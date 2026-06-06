"""诊断业务逻辑服务。"""

import logging
from sqlalchemy.orm import Session
from app.repositories.diagnosis_repo import DiagnosisRepo, PolishResultRepo
from app.repositories.resume_repo import ResumeRepo
from app.services.ai_service import ai_service
from app.models.diagnosis import Diagnosis
from app.config import settings

logger = logging.getLogger(__name__)

DIM_NAMES = {"ats": "ATS通过率", "content": "内容质量", "project": "项目经历", "match": "岗位匹配度"}
DIM_MAX = {"ats": 20, "content": 25, "project": 30, "match": 25}


class DiagnosisService:
    """诊断服务类，处理诊断创建、查询和免费/付费分层逻辑。"""

    def create_diagnosis(self, db: Session, resume_id: int, target_job: str = "", user_id: int = 0, custom_prompt: str = "", is_member: bool = False) -> dict:
        """创建简历诊断。会员自动解锁。"""
        resume = ResumeRepo.get_by_id(db, resume_id)
        if not resume:
            raise Exception("简历不存在")

        ai_result = ai_service.diagnose(resume.raw_text or "", target_job, custom_prompt)

        ats_score = ai_result.get("ats", {}).get("score", 0)
        content_score = ai_result.get("content", {}).get("score", 0)
        project_score = ai_result.get("project", {}).get("score", 0)
        match_score = ai_result.get("match", {}).get("score", 0)
        total_score = ats_score + content_score + project_score + match_score

        diagnosis = DiagnosisRepo.create(
            db=db,
            resume_id=resume_id,
            ats_score=ats_score,
            content_score=content_score,
            project_score=project_score,
            match_score=match_score,
            total_score=total_score,
            detail=ai_result,
        )

        if is_member:
            DiagnosisRepo.update_unlocked(db, diagnosis.id, is_unlocked=1)
            diagnosis.is_unlocked = 1

        return self._build_response(diagnosis, is_owner=True)

    def get_diagnosis(self, db: Session, diagnosis_id: int, user_id: int = 0) -> dict:
        """获取诊断报告。"""
        diagnosis = DiagnosisRepo.get_by_id(db, diagnosis_id)
        if not diagnosis:
            raise Exception("诊断报告不存在")

        resume = ResumeRepo.get_by_id(db, diagnosis.resume_id)
        is_owner = resume and resume.user_id == user_id

        return self._build_response(diagnosis, is_owner)

    def get_user_diagnoses(self, db: Session, user_id: int) -> list[dict]:
        """获取用户的所有诊断报告列表（用于历史记录），含润色结果。"""
        diagnoses = DiagnosisRepo.get_by_user(db, user_id)
        results = []
        for d in diagnoses:
            resume = ResumeRepo.get_by_id(db, d.resume_id)
            polish = PolishResultRepo.get_latest_by_resume(db, d.resume_id)
            results.append({
                "id": d.id,
                "resume_id": d.resume_id,
                "file_name": resume.file_name if resume else "",
                "total_score": d.total_score,
                "ats_score": d.ats_score,
                "content_score": d.content_score,
                "project_score": d.project_score,
                "match_score": d.match_score,
                "is_unlocked": bool(d.is_unlocked),
                "grade": self._get_grade(d.total_score),
                "has_polish": polish is not None,
                "polish_id": polish.id if polish else None,
                "created_at": d.created_at.isoformat() if d.created_at else None,
            })
        return results

    def check_daily_limit(self, db: Session, user_id: int, is_member: bool) -> bool:
        """检查每日诊断次数是否超限。返回 True 表示可以继续使用。"""
        today_count = DiagnosisRepo.count_today_by_user(db, user_id)
        limit = settings.MEMBER_DIAGNOSIS_LIMIT if is_member else settings.FREE_DIAGNOSIS_LIMIT
        return today_count < limit

    def unlock_diagnosis(self, db: Session, diagnosis_id: int) -> Diagnosis:
        return DiagnosisRepo.update_unlocked(db, diagnosis_id, is_unlocked=1)

    def _get_grade(self, total_score: int) -> str:
        if total_score >= 85:
            return "A"
        elif total_score >= 70:
            return "B"
        elif total_score >= 55:
            return "C"
        return "D"

    def _build_response(self, diagnosis: Diagnosis, is_owner: bool = True) -> dict:
        detail = diagnosis.detail or {}

        all_issues = []
        for dim_key in ["ats", "content", "project", "match"]:
            dim_data = detail.get(dim_key, {})
            for issue in dim_data.get("issues", []):
                issue_copy = dict(issue)
                issue_copy["dimension"] = dim_key
                issue_copy["dimension_name"] = DIM_NAMES.get(dim_key, dim_key)
                all_issues.append(issue_copy)

        severity_order = {"critical": 0, "warning": 1, "info": 2}
        all_issues.sort(key=lambda x: severity_order.get(x.get("severity", "info"), 3))

        checklist = self._build_checklist(all_issues)

        response = {
            "id": diagnosis.id,
            "resume_id": diagnosis.resume_id,
            "total_score": diagnosis.total_score,
            "ats_score": diagnosis.ats_score,
            "content_score": diagnosis.content_score,
            "project_score": diagnosis.project_score,
            "match_score": diagnosis.match_score,
            "is_unlocked": True,
            "grade": self._get_grade(diagnosis.total_score),
            "overall_assessment": detail.get("overall_assessment", ""),
            "free_preview": None,
            "priority_checklist": checklist,
            "detail": detail if is_owner else None,
            "match_analysis": detail.get("match_analysis") if is_owner else None,
            "created_at": diagnosis.created_at.isoformat() if diagnosis.created_at else None,
        }

        return response

    def _build_checklist(self, all_issues: list) -> list:
        """构建按优先级排序的改进清单。"""
        checklist = []
        for idx, issue in enumerate(all_issues):
            checklist.append({
                "priority": idx + 1,
                "severity": issue.get("severity", "info"),
                "dimension": issue.get("dimension_name", ""),
                "description": issue.get("description", ""),
                "field": issue.get("field", ""),
            })
        return checklist

    def _build_diagnosis_summary(self, diagnosis: Diagnosis) -> str:
        detail = diagnosis.detail or {}
        summary_parts: list[str] = []

        for dim_key, dim_name in [("ats", "ATS通过率"), ("content", "内容质量"), ("project", "项目经历"), ("match", "岗位匹配度")]:
            dim_data = detail.get(dim_key, {})
            score = dim_data.get("score", 0)
            max_score = DIM_MAX.get(dim_key, 25)
            issues = dim_data.get("issues", [])

            critical_issues = [i for i in issues if i.get("severity") == "critical"]
            summary_parts.append(f"{dim_name}({score}/{max_score}分)")
            if critical_issues:
                for ci in critical_issues:
                    summary_parts.append(f"  - {ci.get('description', '')}")

        return "\n".join(summary_parts)


diagnosis_service = DiagnosisService()
