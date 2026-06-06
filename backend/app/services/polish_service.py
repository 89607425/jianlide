"""润色业务逻辑服务。"""

import logging
from sqlalchemy.orm import Session
from app.repositories.diagnosis_repo import DiagnosisRepo, PolishResultRepo
from app.repositories.resume_repo import ResumeRepo
from app.services.ai_service import ai_service

logger = logging.getLogger(__name__)


class PolishService:
    """润色服务类，处理AI简历润色业务逻辑。"""

    def create_polish(self, db: Session, resume_id: int, user_id: int = 0, custom_prompt: str = "") -> dict:
        """创建简历润色。

        Args:
            db: 数据库会话
            resume_id: 简历ID
            user_id: 当前用户ID

        Returns:
            润色结果字典
        """
        # 获取简历
        resume = ResumeRepo.get_by_id(db, resume_id)
        if not resume:
            raise Exception("简历不存在")

        # 获取诊断摘要（如有）
        diagnosis_summary = ""
        latest_diagnosis = DiagnosisRepo.get_latest_by_resume(db, resume_id)
        if latest_diagnosis and latest_diagnosis.detail:
            diagnosis_summary = self._build_diagnosis_summary(latest_diagnosis.detail)

        # 调用AI润色
        ai_result = ai_service.polish(
            resume_text=resume.raw_text or "",
            diagnosis_summary=diagnosis_summary,
            custom_prompt=custom_prompt,
        )

        # 保存润色结果
        polished_text = ai_result.get("polished_text", "")
        diff_data = ai_result.get("diff_data", [])

        polish_result = PolishResultRepo.create(
            db=db,
            resume_id=resume_id,
            polished_text=polished_text,
            diff_data=diff_data,
        )

        return {
            "id": polish_result.id,
            "resume_id": polish_result.resume_id,
            "polished_text": polish_result.polished_text,
            "diff_data": polish_result.diff_data or [],
            "created_at": polish_result.created_at.isoformat() if polish_result.created_at else None,
        }

    def get_polish(self, db: Session, polish_id: int, user_id: int = 0) -> dict:
        """获取润色结果。

        Args:
            db: 数据库会话
            polish_id: 润色结果ID
            user_id: 当前用户ID

        Returns:
            润色结果字典
        """
        polish = PolishResultRepo.get_by_id(db, polish_id)
        if not polish:
            raise Exception("润色结果不存在")

        # 验证权限
        resume = ResumeRepo.get_by_id(db, polish.resume_id)
        if resume and resume.user_id != user_id:
            raise Exception("无权访问该润色结果")

        return {
            "id": polish.id,
            "resume_id": polish.resume_id,
            "polished_text": polish.polished_text,
            "diff_data": polish.diff_data or [],
            "created_at": polish.created_at.isoformat() if polish.created_at else None,
        }

    def _build_diagnosis_summary(self, detail: dict) -> str:
        """从诊断详情构建摘要文本。

        Args:
            detail: 诊断详情字典

        Returns:
            诊断摘要文本
        """
        summary_parts: list[str] = []

        for dim_key, dim_name in [("ats", "ATS通过率"), ("content", "内容质量"), ("project", "项目经历"), ("match", "岗位匹配度")]:
            dim_data = detail.get(dim_key, {})
            score = dim_data.get("score", 0)
            max_score = {"ats": 20, "content": 25, "project": 30, "match": 25}.get(dim_key, 25)
            issues = dim_data.get("issues", [])

            critical_issues = [i for i in issues if i.get("severity") == "critical"]
            summary_parts.append(f"{dim_name}({score}/{max_score}分)")
            if critical_issues:
                for ci in critical_issues:
                    summary_parts.append(f"  - {ci.get('description', '')}")

        return "\n".join(summary_parts)


# 全局实例
polish_service = PolishService()
