"""诊断相关Pydantic Schema。"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class IssueItem(BaseModel):
    """问题条目。"""
    severity: str = Field(..., description="严重程度: critical/warning/info")
    field: str = Field(..., description="字段标识")
    description: str = Field(..., description="问题描述")


class DimensionDetail(BaseModel):
    """单维度诊断详情。"""
    score: int
    max_score: int
    issues: list[IssueItem]
    suggestions: list[str]


class DiagnosisDetail(BaseModel):
    """完整诊断详情（四维度）。"""
    ats: DimensionDetail
    content: DimensionDetail
    project: DimensionDetail
    match: DimensionDetail


class FreePreview(BaseModel):
    """免费预览信息。"""
    total_score: int
    top_issues: list[IssueItem]


class DiagnosisCreateRequest(BaseModel):
    """发起诊断请求。"""
    resume_id: int = Field(..., gt=0, description="简历ID")
    target_job: str = Field("", description="目标岗位")
    custom_prompt: str = Field("", description="用户自定义提示词")


class DiagnosisResponse(BaseModel):
    """诊断报告响应。"""
    id: int
    resume_id: int
    total_score: int = 0
    ats_score: int = 0
    content_score: int = 0
    project_score: int = 0
    match_score: int = 0
    is_unlocked: bool = False
    free_preview: Optional[FreePreview] = None
    detail: Optional[DiagnosisDetail] = None
    created_at: Optional[datetime] = None
