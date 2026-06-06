"""用户数据访问层。"""

from sqlalchemy.orm import Session
from app.models.user import User


class UserRepo:
    """用户Repository，封装用户表的CRUD操作。"""

    @staticmethod
    def create(db: Session, phone: str, password_hash: str, nickname: str = "", email: str = "") -> User:
        """创建新用户。"""
        user = User(phone=phone, password_hash=password_hash, nickname=nickname, email=email)
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def get_by_id(db: Session, user_id: int) -> User | None:
        """根据ID获取用户。"""
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def get_by_phone(db: Session, phone: str) -> User | None:
        """根据手机号获取用户。"""
        return db.query(User).filter(User.phone == phone).first()

    @staticmethod
    def get_by_email(db: Session, email: str) -> User | None:
        """根据邮箱获取用户。"""
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def update_member_type(db: Session, user_id: int, member_type: int) -> User | None:
        """更新用户会员类型。"""
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            user.member_type = member_type
            db.commit()
            db.refresh(user)
        return user

    @staticmethod
    def update_password(db: Session, user_id: int, password_hash: str) -> User | None:
        """更新用户密码。"""
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            user.password_hash = password_hash
            db.commit()
            db.refresh(user)
        return user
