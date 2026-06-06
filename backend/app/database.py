"""数据库连接与会话管理模块。"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.config import settings

# 创建数据库引擎
engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_pre_ping=True,
    pool_recycle=3600,
    pool_size=10,
    max_overflow=20,
)

# 创建会话工厂
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """SQLAlchemy声明式基类，所有ORM模型继承此类。"""
    pass


def get_db():
    """FastAPI依赖注入：获取数据库会话。

    Yields:
        Session: 数据库会话实例
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
