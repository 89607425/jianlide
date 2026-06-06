"""润色路由：发起润色、获取润色结果、按简历查询、导出。"""

from fastapi import APIRouter, Depends, Header, Query
from fastapi.responses import Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.order import PolishCreateRequest
from app.repositories.resume_repo import ResumeRepo
from app.repositories.diagnosis_repo import PolishResultRepo
from app.routers.auth import get_user_from_token
from app.models.user import User
from app.services.polish_service import polish_service
from app.services.export_service import export_resume
from urllib.parse import quote

router = APIRouter()


def _get_current_user(authorization: str = Header(None), db: Session = Depends(get_db)) -> User:
    return get_user_from_token(authorization, db)


@router.get("/resume/{resume_id}")
def get_polish_by_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(_get_current_user),
):
    """获取某简历的最新润色结果（用于前端判断是否已有润色，避免重复触发AI）。"""
    resume = ResumeRepo.get_by_id(db, resume_id)
    if not resume or resume.user_id != current_user.id:
        return {"code": 3001, "message": "简历不存在", "data": None}

    polish = PolishResultRepo.get_latest_by_resume(db, resume_id)
    if not polish:
        return {"code": 0, "message": "success", "data": None}

    return {
        "code": 0, "message": "success",
        "data": {
            "id": polish.id,
            "resume_id": polish.resume_id,
            "polished_text": polish.polished_text,
            "diff_data": polish.diff_data or [],
            "created_at": polish.created_at.isoformat() if polish.created_at else None,
        },
    }


@router.get("/resume/{resume_id}/export")
def export_polish(
    resume_id: int,
    fmt: str = Query("pdf", description="导出格式: pdf/word/txt/md"),
    db: Session = Depends(get_db),
    current_user: User = Depends(_get_current_user),
):
    """导出润色后的简历（PDF/Word/TXT/MD）- 仅会员可用。"""
    resume = ResumeRepo.get_by_id(db, resume_id)
    if not resume or resume.user_id != current_user.id:
        return {"code": 3001, "message": "简历不存在", "data": None}

    if current_user.member_type != 1:
        return {"code": 4003, "message": "导出功能仅限会员使用，请先升级会员", "data": None}

    polish = PolishResultRepo.get_latest_by_resume(db, resume_id)
    if not polish:
        return {"code": 4001, "message": "暂无润色结果，请先完成AI润色", "data": None}

    try:
        content, media_type = export_resume(polish.polished_text, fmt)
    except ValueError as e:
        return {"code": 4002, "message": str(e), "data": None}

    ext_map = {"pdf": ".pdf", "docx": ".docx", "word": ".docx", "txt": ".txt", "md": ".md"}
    safe_name = resume.file_name.rsplit(".", 1)[0] if "." in resume.file_name else resume.file_name
    filename = f"{safe_name}_润色版{ext_map.get(fmt, f'.{fmt}')}"
    encoded_filename = quote(filename)

    return Response(
        content=content,
        media_type=media_type,
        headers={"Content-Disposition": f"attachment; filename*=UTF-8''{encoded_filename}"},
    )


@router.post("")
def create_polish(
    req: PolishCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(_get_current_user),
):
    """发起AI润色。仅会员可用。如果已有润色结果，直接返回。"""
    resume = ResumeRepo.get_by_id(db, req.resume_id)
    if not resume or resume.user_id != current_user.id:
        return {"code": 3001, "message": "简历不存在", "data": None}

    if current_user.member_type != 1:
        return {"code": 4003, "message": "AI润色仅限会员使用，请先升级会员", "data": None}

    if resume.status != 1:
        return {"code": 3003, "message": "简历解析中或解析失败，请稍后重试", "data": None}

    # 检查是否已有润色结果
    existing = PolishResultRepo.get_latest_by_resume(db, req.resume_id)
    if existing:
        return {
            "code": 0, "message": "success",
            "data": {
                "id": existing.id,
                "resume_id": existing.resume_id,
                "polished_text": existing.polished_text,
                "diff_data": existing.diff_data or [],
                "created_at": existing.created_at.isoformat() if existing.created_at else None,
            },
        }

    try:
        result = polish_service.create_polish(
            db=db,
            resume_id=req.resume_id,
            user_id=current_user.id,
            custom_prompt=req.custom_prompt,
        )
        return {"code": 0, "message": "success", "data": result}
    except Exception as e:
        return {"code": 6001, "message": f"AI润色服务异常: {str(e)}", "data": None}


@router.get("/{polish_id}")
def get_polish(
    polish_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(_get_current_user),
):
    """获取润色结果。"""
    try:
        result = polish_service.get_polish(
            db=db,
            polish_id=polish_id,
            user_id=current_user.id,
        )
        return {"code": 0, "message": "success", "data": result}
    except Exception as e:
        return {"code": 4001, "message": str(e), "data": None}
