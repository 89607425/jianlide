"""订单ORM模型。"""

from datetime import datetime
from decimal import Decimal
from sqlalchemy import BigInteger, String, SmallInteger, DateTime, Numeric, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class Order(Base):
    """订单表模型，存储用户付费记录。"""

    __tablename__ = "order"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("user.id"), nullable=False, comment="下单用户")
    order_no: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, comment="订单号")
    product_type: Mapped[int] = mapped_column(
        SmallInteger, nullable=False, comment="1完整报告 2AI润色"
    )
    amount: Mapped[Decimal] = mapped_column(
        Numeric(10, 2), nullable=False, comment="金额"
    )
    pay_channel: Mapped[int] = mapped_column(
        SmallInteger, nullable=False, default=1, comment="1微信 2苹果"
    )
    status: Mapped[int] = mapped_column(
        SmallInteger, nullable=False, default=0, comment="0待支付 1已支付 2已退款"
    )
    transaction_id: Mapped[str] = mapped_column(String(128), default="", comment="第三方交易号")
    resume_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey("resume.id"), default=None, comment="关联简历"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.now, comment="创建时间"
    )
    paid_at: Mapped[datetime | None] = mapped_column(
        DateTime, default=None, comment="支付时间"
    )
