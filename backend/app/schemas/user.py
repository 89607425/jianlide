"""用户相关Pydantic Schema。"""

from pydantic import BaseModel, Field
from typing import Optional


class RegisterRequest(BaseModel):
    """注册请求。"""
    phone: str = Field(..., min_length=11, max_length=11, pattern=r"^1[3-9]\d{9}$", description="手机号")
    password: str = Field(..., min_length=6, max_length=20, description="密码（6-20位）")


class LoginRequest(BaseModel):
    """登录请求。"""
    phone: str = Field(..., min_length=11, max_length=11, description="手机号")
    password: str = Field(..., min_length=6, max_length=20, description="密码")


class UserInfo(BaseModel):
    """用户信息响应。"""
    id: int
    phone: str
    nickname: str = ""
    member_type: int = 0
    token: Optional[str] = None

    class Config:
        from_attributes = True


class UserBasicInfo(BaseModel):
    """用户基本信息（不含token）。"""
    id: int
    phone: str
    nickname: str = ""
    member_type: int = 0

    class Config:
        from_attributes = True
