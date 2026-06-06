"""简历路由：上传、详情、列表。支持 PDF 和 Word (.docx) 格式。"""

import os
import time
from fastapi import APIRouter, Depends, Header, UploadFile, File
from sqlalchemy.orm import Session
from app.database import get_db
from app.config import settings
from app.repositories.resume_repo import ResumeRepo
from app.routers.auth import get_user_from_token
from app.models.user import User
from app.services.document_parser import document_parser_service

router = APIRouter()

ALLOWED_EXTENSIONS = {".pdf", ".docx"}


def _get_current_user(authorization: str = Header(None), db: Session = Depends(get_db)) -> User:
    return get_user_from_token(authorization, db)


@router.post("/upload")
def upload_resume(file: UploadFile = File(...), db: Session = Depends(get_db), current_user: User = Depends(_get_current_user)):
    """上传简历文件（支持 PDF 和 Word .docx 格式）。"""
    if not file.filename:
        return {"code": 1002, "message": "文件名不能为空", "data": None}

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        return {"code": 1002, "message": "仅支持 PDF 和 Word (.docx) 格式", "data": None}

    file_bytes = file.file.read()

    if len(file_bytes) > settings.MAX_FILE_SIZE:
        return {"code": 1003, "message": "文件大小不能超过5MB", "data": None}

    user_dir = os.path.join(settings.UPLOAD_DIR, str(current_user.id))
    os.makedirs(user_dir, exist_ok=True)
    timestamp = int(time.time() * 1000)
    safe_filename = f"{timestamp}_{file.filename}"
    file_path = os.path.join(user_dir, safe_filename)

    with open(file_path, "wb") as f:
        f.write(file_bytes)

    resume = ResumeRepo.create(
        db=db,
        user_id=current_user.id,
        file_name=file.filename,
        file_path=file_path,
    )

    try:
        result = document_parser_service.parse(file_bytes, file.filename)
        raw_text = result["raw_text"]
        parsed_data = result["parsed_data"]
        status = 1 if raw_text.strip() else 2
        ResumeRepo.update_parsed(db, resume.id, raw_text, parsed_data, status)
        resume.status = status
        resume.raw_text = raw_text
        resume.parsed_data = parsed_data
    except Exception:
        ResumeRepo.update_status(db, resume.id, 2)
        resume.status = 2

    return {
        "code": 0,
        "message": "success",
        "data": {
            "id": resume.id,
            "file_name": resume.file_name,
            "status": resume.status,
            "parsed_data": resume.parsed_data if resume.status == 1 else None,
        },
    }


@router.get("/{resume_id}")
def get_resume(resume_id: int, db: Session = Depends(get_db), current_user: User = Depends(_get_current_user)):
    resume = ResumeRepo.get_by_id(db, resume_id)
    if not resume:
        return {"code": 3001, "message": "简历不存在", "data": None}

    if resume.user_id != current_user.id:
        return {"code": 3001, "message": "无权访问该简历", "data": None}

    return {
        "code": 0,
        "message": "success",
        "data": {
            "id": resume.id,
            "file_name": resume.file_name,
            "status": resume.status,
            "raw_text": resume.raw_text,
            "parsed_data": resume.parsed_data,
            "created_at": resume.created_at.isoformat() if resume.created_at else None,
        },
    }


@router.get("")
def list_resumes(db: Session = Depends(get_db), current_user: User = Depends(_get_current_user)):
    resumes = ResumeRepo.get_by_user(db, current_user.id)
    total = ResumeRepo.count_by_user(db, current_user.id)

    items = [
        {
            "id": r.id,
            "file_name": r.file_name,
            "status": r.status,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in resumes
    ]

    return {
        "code": 0,
        "message": "success",
        "data": {"items": items, "total": total},
    }
