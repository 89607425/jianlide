"""简历数据访问层。"""

from sqlalchemy.orm import Session
from app.models.resume import Resume


class ResumeRepo:
    """简历Repository，封装简历表的CRUD操作。"""

    @staticmethod
    def create(db: Session, user_id: int, file_name: str, file_path: str) -> Resume:
        """创建简历记录。"""
        resume = Resume(user_id=user_id, file_name=file_name, file_path=file_path, status=0)
        db.add(resume)
        db.commit()
        db.refresh(resume)
        return resume

    @staticmethod
    def get_by_id(db: Session, resume_id: int) -> Resume | None:
        """根据ID获取简历。"""
        return db.query(Resume).filter(Resume.id == resume_id).first()

    @staticmethod
    def get_by_user(db: Session, user_id: int) -> list[Resume]:
        """获取用户的所有简历。"""
        return db.query(Resume).filter(Resume.user_id == user_id).order_by(Resume.created_at.desc()).all()

    @staticmethod
    def count_by_user(db: Session, user_id: int) -> int:
        """统计用户的简历数量。"""
        return db.query(Resume).filter(Resume.user_id == user_id).count()

    @staticmethod
    def update_parsed(db: Session, resume_id: int, raw_text: str, parsed_data: dict, status: int = 1) -> Resume | None:
        """更新简历解析结果。"""
        resume = db.query(Resume).filter(Resume.id == resume_id).first()
        if resume:
            resume.raw_text = raw_text
            resume.parsed_data = parsed_data
            resume.status = status
            db.commit()
            db.refresh(resume)
        return resume

    @staticmethod
    def update_status(db: Session, resume_id: int, status: int) -> Resume | None:
        """更新简历解析状态。"""
        resume = db.query(Resume).filter(Resume.id == resume_id).first()
        if resume:
            resume.status = status
            db.commit()
            db.refresh(resume)
        return resume
