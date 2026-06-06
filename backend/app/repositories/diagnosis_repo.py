"""诊断数据访问层。"""

from sqlalchemy.orm import Session
from app.models.diagnosis import Diagnosis, PolishResult


class DiagnosisRepo:
    """诊断Repository，封装诊断报告表的CRUD操作。"""

    @staticmethod
    def create(db: Session, resume_id: int, ats_score: int, content_score: int,
               project_score: int, match_score: int, total_score: int, detail: dict) -> Diagnosis:
        """创建诊断记录。"""
        diagnosis = Diagnosis(
            resume_id=resume_id,
            ats_score=ats_score,
            content_score=content_score,
            project_score=project_score,
            match_score=match_score,
            total_score=total_score,
            detail=detail,
            is_unlocked=0,
        )
        db.add(diagnosis)
        db.commit()
        db.refresh(diagnosis)
        return diagnosis

    @staticmethod
    def get_by_id(db: Session, diagnosis_id: int) -> Diagnosis | None:
        """根据ID获取诊断记录。"""
        return db.query(Diagnosis).filter(Diagnosis.id == diagnosis_id).first()

    @staticmethod
    def get_by_resume(db: Session, resume_id: int) -> list[Diagnosis]:
        """获取简历的所有诊断记录。"""
        return db.query(Diagnosis).filter(Diagnosis.resume_id == resume_id).order_by(
            Diagnosis.created_at.desc()
        ).all()

    @staticmethod
    def get_latest_by_resume(db: Session, resume_id: int) -> Diagnosis | None:
        """获取简历的最新诊断记录。"""
        return db.query(Diagnosis).filter(Diagnosis.resume_id == resume_id).order_by(
            Diagnosis.created_at.desc()
        ).first()

    @staticmethod
    def count_by_user(db: Session, user_id: int) -> int:
        from app.models.resume import Resume
        return db.query(Diagnosis).join(Resume, Diagnosis.resume_id == Resume.id).filter(
            Resume.user_id == user_id
        ).count()

    @staticmethod
    def count_today_by_user(db: Session, user_id: int) -> int:
        from datetime import datetime
        from app.models.resume import Resume
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        return db.query(Diagnosis).join(Resume, Diagnosis.resume_id == Resume.id).filter(
            Resume.user_id == user_id,
            Diagnosis.created_at >= today,
        ).count()

    @staticmethod
    def get_by_user(db: Session, user_id: int) -> list[Diagnosis]:
        from app.models.resume import Resume
        return db.query(Diagnosis).join(Resume, Diagnosis.resume_id == Resume.id).filter(
            Resume.user_id == user_id
        ).order_by(Diagnosis.created_at.desc()).all()

    @staticmethod
    def get_latest_by_user_resume(db: Session, user_id: int, resume_id: int) -> Diagnosis | None:
        from app.models.resume import Resume
        return db.query(Diagnosis).join(Resume, Diagnosis.resume_id == Resume.id).filter(
            Resume.user_id == user_id,
            Diagnosis.resume_id == resume_id,
        ).order_by(Diagnosis.created_at.desc()).first()

    @staticmethod
    def update_unlocked(db: Session, diagnosis_id: int, is_unlocked: int = 1) -> Diagnosis | None:
        """更新诊断解锁状态。"""
        diagnosis = db.query(Diagnosis).filter(Diagnosis.id == diagnosis_id).first()
        if diagnosis:
            diagnosis.is_unlocked = is_unlocked
            db.commit()
            db.refresh(diagnosis)
        return diagnosis


class PolishResultRepo:
    """润色结果Repository，封装润色结果表的CRUD操作。"""

    @staticmethod
    def create(db: Session, resume_id: int, polished_text: str, diff_data: dict | None = None) -> PolishResult:
        """创建润色结果记录。"""
        polish = PolishResult(resume_id=resume_id, polished_text=polished_text, diff_data=diff_data)
        db.add(polish)
        db.commit()
        db.refresh(polish)
        return polish

    @staticmethod
    def get_by_id(db: Session, polish_id: int) -> PolishResult | None:
        """根据ID获取润色结果。"""
        return db.query(PolishResult).filter(PolishResult.id == polish_id).first()

    @staticmethod
    def get_by_resume(db: Session, resume_id: int) -> list[PolishResult]:
        """获取简历的所有润色结果。"""
        return db.query(PolishResult).filter(PolishResult.resume_id == resume_id).order_by(
            PolishResult.created_at.desc()
        ).all()

    @staticmethod
    def get_latest_by_resume(db: Session, resume_id: int) -> PolishResult | None:
        """获取简历的最新润色结果。"""
        return db.query(PolishResult).filter(PolishResult.resume_id == resume_id).order_by(
            PolishResult.created_at.desc()
        ).first()
