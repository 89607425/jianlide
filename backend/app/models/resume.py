"""简历ORM模型。"""

from datetime import datetime
from sqlalchemy import BigInteger, String, Text, SmallInteger, DateTime, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Resume(Base):
    """简历表模型，存储上传的PDF简历信息及解析结果。"""

    __tablename__ = "resume"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("user.id"), nullable=False, comment="所属用户")
    file_name: Mapped[str] = mapped_column(String(255), nullable=False, comment="原始文件名")
    file_path: Mapped[str] = mapped_column(String(500), nullable=False, comment="服务器存储路径")
    raw_text: Mapped[str | None] = mapped_column(Text, default=None, comment="PDF提取的原文")
    parsed_data: Mapped[dict | None] = mapped_column(JSON, default=None, comment="结构化解析结果")
    status: Mapped[int] = mapped_column(
        SmallInteger, nullable=False, default=0, comment="0解析中 1成功 2失败"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.now, comment="创建时间"
    )

    # 关系
    diagnoses = relationship("Diagnosis", back_populates="resume", lazy="select")
    polish_results = relationship("PolishResult", back_populates="resume", lazy="select")
