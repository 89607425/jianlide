"""用户ORM模型。"""

from datetime import datetime
from sqlalchemy import BigInteger, String, SmallInteger, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class User(Base):
    """用户表模型，存储用户基本信息和会员状态。"""

    __tablename__ = "user"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    phone: Mapped[str] = mapped_column(String(20), unique=True, nullable=False, comment="手机号")
    email: Mapped[str] = mapped_column(String(100), nullable=True, default="", comment="邮箱")
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False, comment="密码哈希")
    nickname: Mapped[str] = mapped_column(String(50), default="", comment="昵称")
    member_type: Mapped[int] = mapped_column(
        SmallInteger, nullable=False, default=0, comment="0免费用户 1付费会员"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.now, comment="创建时间"
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.now, onupdate=datetime.now, comment="更新时间"
    )
