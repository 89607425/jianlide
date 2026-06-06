"""文档解析服务，支持 PDF 和 Word (.docx) 格式。"""

import re
import pdfplumber
import logging
from io import BytesIO
from typing import Any

logger = logging.getLogger(__name__)


class DocumentParserService:
    """文档解析服务类，支持 PDF 和 DOCX 格式的文本提取与结构化解析。"""

    def parse(self, file_bytes: bytes, filename: str = "") -> dict[str, Any]:
        """解析文档文件，自动识别格式。

        Args:
            file_bytes: 文件的二进制内容
            filename: 文件名，用于判断格式

        Returns:
            包含 raw_text 和 parsed_data 的字典
        """
        raw_text = ""
        ext = filename.lower().rsplit(".", 1)[-1] if "." in filename else ""

        if ext == "docx":
            raw_text = self._extract_docx_text(file_bytes)
        else:
            raw_text = self._extract_pdf_text(file_bytes)

        if not raw_text.strip():
            return {"raw_text": "", "parsed_data": {}}

        parsed_data = self._split_sections(raw_text)
        contact = self._extract_contact(raw_text)
        parsed_data.update(contact)

        return {"raw_text": raw_text, "parsed_data": parsed_data}

    def _extract_pdf_text(self, file_bytes: bytes) -> str:
        text_parts: list[str] = []
        try:
            with pdfplumber.open(BytesIO(file_bytes)) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text_parts.append(page_text)
        except Exception as e:
            logger.error(f"PDF文本提取失败: {e}")
            return ""
        return "\n".join(text_parts)

    def _extract_docx_text(self, file_bytes: bytes) -> str:
        try:
            from docx import Document
            doc = Document(BytesIO(file_bytes))
            paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
            return "\n".join(paragraphs)
        except Exception as e:
            logger.error(f"DOCX文本提取失败: {e}")
            return ""

    def _split_sections(self, raw_text: str) -> dict[str, Any]:
        sections: dict[str, Any] = {
            "summary": "",
            "education": [],
            "work_experience": [],
            "projects": [],
            "skills": [],
        }

        section_keywords = {
            "summary": ["个人简介", "自我评价", "个人总结", "总结", "summary", "profile", "about"],
            "education": ["教育", "学历", "学习经历", "education", "academic"],
            "work_experience": ["工作经历", "工作经验", "工作", "work experience", "employment", "职业经历"],
            "projects": ["项目经历", "项目经验", "项目", "projects", "project experience"],
            "skills": ["技能", "专业技能", "技术栈", "skills", "technologies", "competencies"],
        }

        lines = raw_text.split("\n")
        current_section = "summary"
        section_lines: dict[str, list[str]] = {"summary": []}

        for line in lines:
            line_stripped = line.strip()
            if not line_stripped:
                continue

            detected_section = None
            for sec_key, keywords in section_keywords.items():
                for kw in keywords:
                    if kw.lower() in line_stripped.lower() and len(line_stripped) < 30:
                        detected_section = sec_key
                        break
                if detected_section:
                    break

            if detected_section:
                current_section = detected_section
                if current_section not in section_lines:
                    section_lines[current_section] = []
            else:
                if current_section not in section_lines:
                    section_lines[current_section] = []
                section_lines[current_section].append(line_stripped)

        if "summary" in section_lines and section_lines["summary"]:
            sections["summary"] = " ".join(section_lines["summary"])

        for sec in ["education", "work_experience", "projects", "skills"]:
            if sec in section_lines:
                sections[sec] = section_lines[sec]

        return sections

    def _extract_contact(self, text: str) -> dict[str, str]:
        result: dict[str, str] = {"name": "", "phone": "", "email": ""}

        phone_match = re.search(r"1[3-9]\d{9}", text)
        if phone_match:
            result["phone"] = phone_match.group()

        email_match = re.search(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", text)
        if email_match:
            result["email"] = email_match.group()

        first_line = text.strip().split("\n")[0].strip()
        name_match = re.match(r"^[\u4e00-\u9fa5]{2,4}$", first_line)
        if name_match:
            result["name"] = first_line
        else:
            name_match2 = re.search(r"(?:姓名|名字)[:：]\s*([\u4e00-\u9fa5]{2,4})", text)
            if name_match2:
                result["name"] = name_match2.group(1)

        return result


document_parser_service = DocumentParserService()
