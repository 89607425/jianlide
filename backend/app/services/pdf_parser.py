"""PDF解析服务，使用pdfplumber提取简历文本并做结构化解析。"""

import re
import json
import pdfplumber
import logging
from io import BytesIO
from typing import Any

logger = logging.getLogger(__name__)


class PDFParserService:
    """PDF解析服务类，负责从PDF文件中提取文本并解析为结构化数据。"""

    def parse(self, file_bytes: bytes) -> dict[str, Any]:
        """解析PDF文件，提取文本并结构化。

        Args:
            file_bytes: PDF文件的二进制内容

        Returns:
            包含raw_text和parsed_data的字典
        """
        raw_text = self._extract_text(file_bytes)
        if not raw_text.strip():
            return {"raw_text": "", "parsed_data": {}}

        parsed_data = self._split_sections(raw_text)
        contact = self._extract_contact(raw_text)
        parsed_data.update(contact)

        return {"raw_text": raw_text, "parsed_data": parsed_data}

    def _extract_text(self, file_bytes: bytes) -> str:
        """从PDF提取纯文本。

        Args:
            file_bytes: PDF文件的二进制内容

        Returns:
            提取的纯文本字符串
        """
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

    def _split_sections(self, raw_text: str) -> dict[str, Any]:
        """按段落分割简历文本，识别常见板块。

        Args:
            raw_text: 简历原始文本

        Returns:
            结构化解析结果字典
        """
        sections: dict[str, Any] = {
            "summary": "",
            "education": [],
            "work_experience": [],
            "projects": [],
            "skills": [],
        }

        # 常见简历板块关键词映射
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

            # 检测是否为新板块标题
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

        # 组装结果
        if "summary" in section_lines and section_lines["summary"]:
            sections["summary"] = " ".join(section_lines["summary"])

        for sec in ["education", "work_experience", "projects", "skills"]:
            if sec in section_lines:
                sections[sec] = section_lines[sec]

        return sections

    def _extract_contact(self, text: str) -> dict[str, str]:
        """从文本中提取联系方式（姓名、电话、邮箱）。

        Args:
            text: 简历原始文本

        Returns:
            包含name, phone, email的字典
        """
        result: dict[str, str] = {"name": "", "phone": "", "email": ""}

        # 提取手机号
        phone_match = re.search(r"1[3-9]\d{9}", text)
        if phone_match:
            result["phone"] = phone_match.group()

        # 提取邮箱
        email_match = re.search(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", text)
        if email_match:
            result["email"] = email_match.group()

        # 提取姓名（取第一行，长度2-4个中文字符）
        first_line = text.strip().split("\n")[0].strip()
        name_match = re.match(r"^[\u4e00-\u9fa5]{2,4}$", first_line)
        if name_match:
            result["name"] = first_line
        else:
            # 尝试从"姓名："等格式提取
            name_match2 = re.search(r"(?:姓名|名字)[:：]\s*([\u4e00-\u9fa5]{2,4})", text)
            if name_match2:
                result["name"] = name_match2.group(1)

        return result


# 全局实例
pdf_parser_service = PDFParserService()
