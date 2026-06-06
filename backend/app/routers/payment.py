"""支付路由：创建订单、Mock支付、查询订单。"""

from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.order import OrderCreateRequest, MockPayRequest
from app.routers.auth import get_user_from_token
from app.models.user import User
from app.services.payment_service import payment_service

router = APIRouter()


def _get_current_user(authorization: str = Header(None), db: Session = Depends(get_db)) -> User:
    """依赖注入：获取当前登录用户。"""
    return get_user_from_token(authorization, db)


@router.post("/orders")
def create_order(
    req: OrderCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(_get_current_user),
):
    """创建支付订单。

    Args:
        req: 订单请求（product_type + resume_id）

    Returns:
        标准响应，包含订单信息
    """
    try:
        result = payment_service.create_order(
            db=db,
            user_id=current_user.id,
            product_type=req.product_type,
            resume_id=req.resume_id,
        )
        return {"code": 0, "message": "success", "data": result}
    except Exception as e:
        return {"code": 5001, "message": str(e), "data": None}


@router.post("/mock-pay")
def mock_pay(
    req: MockPayRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(_get_current_user),
):
    """Mock支付接口（MVP阶段）。

    点击即支付成功，更新订单状态和诊断解锁状态。

    Args:
        req: Mock支付请求（order_no）

    Returns:
        标准响应，包含支付结果
    """
    try:
        result = payment_service.mock_pay(
            db=db,
            order_no=req.order_no,
            user_id=current_user.id,
        )
        return {"code": 0, "message": "success", "data": result}
    except Exception as e:
        return {"code": 5003, "message": str(e), "data": None}


@router.get("/orders")
def list_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(_get_current_user),
):
    """获取当前用户的订单列表。"""
    try:
        results = payment_service.get_user_orders(db, current_user.id)
        return {"code": 0, "message": "success", "data": {"items": results, "total": len(results)}}
    except Exception as e:
        return {"code": 5001, "message": str(e), "data": None}


@router.get("/orders/{order_no}")
def get_order(
    order_no: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(_get_current_user),
):
    """查询订单状态。"""
    try:
        result = payment_service.get_order(
            db=db,
            order_no=order_no,
            user_id=current_user.id,
        )
        return {"code": 0, "message": "success", "data": result}
    except Exception as e:
        return {"code": 5001, "message": str(e), "data": None}


@router.post("/activate-member")
def activate_member(
    db: Session = Depends(get_db),
    current_user: User = Depends(_get_current_user),
):
    """Mock激活会员（点击即生效，无需支付）。"""
    from app.repositories.user_repo import UserRepo

    if current_user.member_type == 1:
        return {"code": 0, "message": "您已是会员", "data": {
            "id": current_user.id,
            "phone": current_user.phone,
            "nickname": current_user.nickname or "",
            "member_type": 1,
        }}

    updated = UserRepo.update_member_type(db, current_user.id, 1)
    if not updated:
        return {"code": 5001, "message": "操作失败", "data": None}

    return {"code": 0, "message": "success", "data": {
        "id": updated.id,
        "phone": updated.phone,
        "nickname": updated.nickname or "",
        "member_type": 1,
    }}
