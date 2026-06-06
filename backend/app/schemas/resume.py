"""简历相关Pydantic Schema。"""

from pydantic import BaseModel, Field
from typing import Optional, Any
from datetime import datetime


class ResumeUploadResponse(BaseModel):
    """简历上传响应。"""
    id: int
    file_name: str
    status: int = 0
    parsed_data: Optional[dict] = None


class ResumeDetail(BaseModel):
    """简历详情响应。"""
    id: int
    file_name: str
    status: int = 0
    raw_text: Optional[str] = None
    parsed_data: Optional[dict] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ResumeListItem(BaseModel):
    """简历列表项。"""
    id: int
    file_name: str
    status: int = 0
    created_at: datetime

    class Config:
        from_attributes = True


class ResumeListResponse(BaseModel):
    """简历列表响应。"""
    items: list[ResumeListItem]
    total: int
