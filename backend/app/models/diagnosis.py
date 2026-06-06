"""诊断报告与润色结果ORM模型。"""

from datetime import datetime
from sqlalchemy import BigInteger, Text, SmallInteger, DateTime, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Diagnosis(Base):
    """诊断报告表模型，存储AI多维度诊断结果。"""

    __tablename__ = "diagnosis"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    resume_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("resume.id"), nullable=False, comment="关联简历")
    ats_score: Mapped[int] = mapped_column(SmallInteger, nullable=False, default=0, comment="ATS通过率得分 0-20")
    content_score: Mapped[int] = mapped_column(SmallInteger, nullable=False, default=0, comment="内容质量得分 0-25")
    project_score: Mapped[int] = mapped_column(SmallInteger, nullable=False, default=0, comment="项目经历得分 0-30")
    match_score: Mapped[int] = mapped_column(SmallInteger, nullable=False, default=0, comment="岗位匹配度得分 0-25")
    total_score: Mapped[int] = mapped_column(SmallInteger, nullable=False, default=0, comment="总分 0-100")
    detail: Mapped[dict] = mapped_column(JSON, nullable=False, comment="完整诊断详情JSON")
    is_unlocked: Mapped[int] = mapped_column(
        SmallInteger, nullable=False, default=0, comment="0未解锁 1已解锁"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.now, comment="创建时间"
    )

    # 关系
    resume = relationship("Resume", back_populates="diagnoses")


class PolishResult(Base):
    """润色结果表模型，存储AI润色后的简历内容与对比数据。"""

    __tablename__ = "polish_result"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    resume_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("resume.id"), nullable=False, comment="关联简历")
    polished_text: Mapped[str] = mapped_column(Text, nullable=False, comment="润色后全文")
    diff_data: Mapped[dict | None] = mapped_column(JSON, default=None, comment="润色对比数据")
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.now, comment="创建时间"
    )

    # 关系
    resume = relationship("Resume", back_populates="polish_results")
