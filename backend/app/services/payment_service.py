"""支付业务逻辑服务（MVP Mock实现）。"""

import time
import logging
from datetime import datetime
from sqlalchemy.orm import Session
from app.config import settings
from app.repositories.order_repo import OrderRepo
from app.repositories.diagnosis_repo import DiagnosisRepo
from app.models.order import Order

logger = logging.getLogger(__name__)


class PaymentService:
    """支付服务类，MVP阶段使用Mock支付。"""

    def create_order(self, db: Session, user_id: int, product_type: int, resume_id: int) -> dict:
        """创建支付订单。

        Args:
            db: 数据库会话
            user_id: 用户ID
            product_type: 产品类型（1=完整报告 2=AI润色）
            resume_id: 关联简历ID

        Returns:
            订单信息字典
        """
        # 生成订单号: JLD + 日期 + 序号
        now = datetime.now()
        order_no = f"JLD{now.strftime('%Y%m%d%H%M%S')}{user_id:06d}{int(time.time() * 1000) % 10000:04d}"

        # 确定金额
        if product_type == 1:
            amount = settings.PRICE_FULL_REPORT
        elif product_type == 2:
            amount = settings.PRICE_POLISH
        else:
            raise Exception("无效的产品类型")

        # 创建订单
        order = OrderRepo.create(
            db=db,
            user_id=user_id,
            order_no=order_no,
            product_type=product_type,
            amount=amount,
            resume_id=resume_id,
        )

        return {
            "order_no": order.order_no,
            "product_type": order.product_type,
            "amount": float(order.amount),
            "status": order.status,
            "created_at": order.created_at.isoformat() if order.created_at else None,
        }

    def mock_pay(self, db: Session, order_no: str, user_id: int) -> dict:
        """Mock支付，点击即成功。

        支付成功后：
        1. 更新订单状态为已支付
        2. 如果是完整报告产品，解锁对应诊断报告

        Args:
            db: 数据库会话
            order_no: 订单号
            user_id: 当前用户ID

        Returns:
            支付结果字典
        """
        # 查找订单
        order = OrderRepo.get_by_order_no(db, order_no)
        if not order:
            raise Exception("订单不存在")

        if order.user_id != user_id:
            raise Exception("无权操作该订单")

        if order.status == 1:
            raise Exception("订单已支付，请勿重复支付")

        # 更新订单为已支付
        transaction_id = f"MOCK_{int(time.time() * 1000)}"
        order = OrderRepo.update_paid(db, order_no, transaction_id)

        # 如果是完整报告产品，解锁诊断报告
        if order.product_type == 1 and order.resume_id:
            latest_diagnosis = DiagnosisRepo.get_latest_by_resume(db, order.resume_id)
            if latest_diagnosis:
                DiagnosisRepo.update_unlocked(db, latest_diagnosis.id, is_unlocked=1)

        return {
            "order_no": order.order_no,
            "status": order.status,
            "paid_at": order.paid_at.isoformat() if order.paid_at else None,
        }

    def get_user_orders(self, db: Session, user_id: int) -> list[dict]:
        orders = OrderRepo.get_by_user(db, user_id)
        return [
            {
                "order_no": o.order_no,
                "product_type": o.product_type,
                "amount": float(o.amount),
                "status": o.status,
                "pay_channel": o.pay_channel,
                "created_at": o.created_at.isoformat() if o.created_at else None,
                "paid_at": o.paid_at.isoformat() if o.paid_at else None,
            }
            for o in orders
        ]

    def get_order(self, db: Session, order_no: str, user_id: int) -> dict:
        """查询订单状态。

        Args:
            db: 数据库会话
            order_no: 订单号
            user_id: 当前用户ID

        Returns:
            订单信息字典
        """
        order = OrderRepo.get_by_order_no(db, order_no)
        if not order:
            raise Exception("订单不存在")

        if order.user_id != user_id:
            raise Exception("无权查看该订单")

        return {
            "order_no": order.order_no,
            "product_type": order.product_type,
            "amount": float(order.amount),
            "status": order.status,
            "created_at": order.created_at.isoformat() if order.created_at else None,
        }


# 全局实例
payment_service = PaymentService()
