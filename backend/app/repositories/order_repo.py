"""订单数据访问层。"""

from datetime import datetime
from sqlalchemy.orm import Session
from app.models.order import Order


class OrderRepo:
    """订单Repository，封装订单表的CRUD操作。"""

    @staticmethod
    def create(db: Session, user_id: int, order_no: str, product_type: int,
               amount: float, resume_id: int | None = None) -> Order:
        """创建订单记录。"""
        order = Order(
            user_id=user_id,
            order_no=order_no,
            product_type=product_type,
            amount=amount,
            pay_channel=1,
            status=0,
            transaction_id="",
            resume_id=resume_id,
        )
        db.add(order)
        db.commit()
        db.refresh(order)
        return order

    @staticmethod
    def get_by_id(db: Session, order_id: int) -> Order | None:
        """根据ID获取订单。"""
        return db.query(Order).filter(Order.id == order_id).first()

    @staticmethod
    def get_by_order_no(db: Session, order_no: str) -> Order | None:
        """根据订单号获取订单。"""
        return db.query(Order).filter(Order.order_no == order_no).first()

    @staticmethod
    def get_by_user(db: Session, user_id: int) -> list[Order]:
        """获取用户的所有订单。"""
        return db.query(Order).filter(Order.user_id == user_id).order_by(
            Order.created_at.desc()
        ).all()

    @staticmethod
    def update_paid(db: Session, order_no: str, transaction_id: str = "") -> Order | None:
        """更新订单为已支付状态。"""
        order = db.query(Order).filter(Order.order_no == order_no).first()
        if order:
            order.status = 1
            order.transaction_id = transaction_id
            order.paid_at = datetime.now()
            db.commit()
            db.refresh(order)
        return order
