"""订单与润色相关Pydantic Schema。"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from decimal import Decimal


# ===== 润色相关 =====

class PolishCreateRequest(BaseModel):
    """发起润色请求。"""
    resume_id: int = Field(..., gt=0, description="简历ID")
    custom_prompt: str = Field("", description="用户自定义润色提示词")


class DiffItem(BaseModel):
    """润色对比条目。"""
    original: str
    polished: str
    reason: str


class PolishResponse(BaseModel):
    """润色结果响应。"""
    id: int
    resume_id: int
    polished_text: str
    diff_data: list[DiffItem] = []
    created_at: Optional[datetime] = None


# ===== 订单相关 =====

class OrderCreateRequest(BaseModel):
    """创建订单请求。"""
    product_type: int = Field(..., ge=1, le=2, description="1=完整报告 2=AI润色")
    resume_id: int = Field(..., gt=0, description="关联简历ID")


class OrderInfo(BaseModel):
    """订单信息响应。"""
    order_no: str
    product_type: int
    amount: Decimal
    status: int = 0
    created_at: Optional[datetime] = None


class MockPayRequest(BaseModel):
    """Mock支付请求。"""
    order_no: str = Field(..., description="订单号")


class MockPayResponse(BaseModel):
    """Mock支付响应。"""
    order_no: str
    status: int
    paid_at: Optional[datetime] = None
