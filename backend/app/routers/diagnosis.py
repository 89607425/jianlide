"""诊断路由：发起诊断、获取报告、用户诊断列表。"""

from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.diagnosis import DiagnosisCreateRequest
from app.repositories.diagnosis_repo import DiagnosisRepo
from app.repositories.resume_repo import ResumeRepo
from app.routers.auth import get_user_from_token
from app.models.user import User
from app.services.diagnosis_service import diagnosis_service

router = APIRouter()


def _get_current_user(authorization: str = Header(None), db: Session = Depends(get_db)) -> User:
    return get_user_from_token(authorization, db)


@router.get("")
def list_diagnoses(
    db: Session = Depends(get_db),
    current_user: User = Depends(_get_current_user),
):
    """获取当前用户的所有诊断报告（历史记录）。"""
    try:
        results = diagnosis_service.get_user_diagnoses(db, current_user.id)
        return {"code": 0, "message": "success", "data": {"items": results, "total": len(results)}}
    except Exception as e:
        return {"code": 4001, "message": str(e), "data": None}


@router.post("")
def create_diagnosis(
    req: DiagnosisCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(_get_current_user),
):
    """发起简历诊断。"""
    resume = ResumeRepo.get_by_id(db, req.resume_id)
    if not resume or resume.user_id != current_user.id:
        return {"code": 3001, "message": "简历不存在", "data": None}

    if resume.status != 1:
        return {"code": 3003, "message": "简历解析中或解析失败，请稍后重试", "data": None}

    # 检查每日次数限制
    is_member = current_user.member_type == 1
    if not diagnosis_service.check_daily_limit(db, current_user.id, is_member):
        limit = 8 if is_member else 2
        label = "会员" if is_member else "免费用户"
        return {"code": 4003, "message": f"您今日的诊断次数已用完（{label}每日{limit}次），请明天再试", "data": None}

    try:
        result = diagnosis_service.create_diagnosis(
            db=db,
            resume_id=req.resume_id,
            target_job=req.target_job,
            user_id=current_user.id,
            custom_prompt=req.custom_prompt,
            is_member=is_member,
        )
        return {"code": 0, "message": "success", "data": result}
    except Exception as e:
        return {"code": 6001, "message": f"AI诊断服务异常: {str(e)}", "data": None}


@router.get("/{diagnosis_id}")
def get_diagnosis(
    diagnosis_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(_get_current_user),
):
    """获取诊断报告。"""
    try:
        result = diagnosis_service.get_diagnosis(
            db=db,
            diagnosis_id=diagnosis_id,
            user_id=current_user.id,
        )
        return {"code": 0, "message": "success", "data": result}
    except Exception as e:
        return {"code": 4001, "message": str(e), "data": None}
