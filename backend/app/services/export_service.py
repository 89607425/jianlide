"""简历导出服务：生成 PDF / Word / TXT / Markdown 格式的润色后简历。"""

import re
import io
import os
import logging
from typing import Any

logger = logging.getLogger(__name__)

_FONT_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "fonts", "NotoSansSC-Regular.ttf")

# 优先使用系统中的中文字体
_CJK_FONTS = [
    "/System/Library/Fonts/PingFang.ttc",      # macOS
    "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",  # Linux
    "C:/Windows/Fonts/msyh.ttc",               # Windows
]


def _parse_sections(text: str) -> dict[str, Any]:
    result: dict[str, Any] = {"name": "", "contact": "", "sections": []}
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    if not lines:
        return result

    result["name"] = lines[0]

    section_keywords = [
        "求职意向", "个人简介", "自我评价", "教育背景", "教育经历", "学历",
        "工作经历", "工作经验", "项目经历", "项目经验", "专业技能", "技能",
        "证书", "语言", "个人总结", "summary", "education", "experience",
        "skills", "projects", "certifications",
    ]

    contact_end = 0
    for i, line in enumerate(lines[1:], 1):
        is_contact = bool(re.search(r"[|｜·•]", line)) or bool(re.search(r"[\w.+-]+@[\w-]+\.[\w.-]+", line)) or bool(re.search(r"1[3-9]\d{9}", line))
        is_section = any(kw in line for kw in section_keywords)
        if is_section:
            contact_end = i
            break
        if is_contact:
            contact_end = i + 1

    if contact_end > 0:
        result["contact"] = " | ".join(lines[1:contact_end])
        body_start = contact_end
    else:
        result["contact"] = lines[1] if len(lines) > 1 else ""
        body_start = 2

    current_section = {"title": "基本信息", "items": []}
    for line in lines[body_start:]:
        is_section = any(kw in line for kw in section_keywords)
        if is_section and len(line) < 20:
            if current_section["items"]:
                result["sections"].append(current_section)
            current_section = {"title": line, "items": []}
            continue
        current_section["items"].append(line)
    if current_section["items"]:
        result["sections"].append(current_section)

    return result


def _build_txt(parsed: dict) -> bytes:
    parts: list[str] = []
    parts.append(parsed["name"])
    if parsed["contact"]:
        parts.append(parsed["contact"])
    parts.append("")
    for sec in parsed["sections"]:
        parts.append(sec["title"])
        parts.append("-" * 40)
        for item in sec["items"]:
            parts.append(f"  • {item}")
        parts.append("")
    return "\n".join(parts).encode("utf-8")


def _build_md(parsed: dict) -> bytes:
    parts: list[str] = []
    parts.append(f"# {parsed['name']}")
    if parsed["contact"]:
        parts.append(f"\n{parsed['contact']}\n")
    parts.append("---\n")
    for sec in parsed["sections"]:
        parts.append(f"## {sec['title']}\n")
        for item in sec["items"]:
            parts.append(f"- {item}")
        parts.append("")
    return "\n".join(parts).encode("utf-8")


def _get_cjk_font_path() -> str:
    for path in _CJK_FONTS:
        if os.path.exists(path):
            return path
    if os.path.exists(_FONT_PATH):
        return _FONT_PATH
    return ""


def _build_pdf(parsed: dict) -> bytes:
    from fpdf import FPDF

    pdf = FPDF(orientation="P", unit="mm", format="A4")
    pdf.set_auto_page_break(auto=True, margin=20)

    font_path = _get_cjk_font_path()
    if font_path:
        pdf.add_font("CJK", "", font_path, uni=True)
        font_name = "CJK"
        font_bold = "CJK"
    else:
        logger.warning("No Chinese font found, falling back to Helvetica")
        font_name = "Helvetica"
        font_bold = "Helvetica"

    pdf.add_page()
    pdf.l_margin = 25
    pdf.r_margin = 25

    pdf.set_font(font_bold, "", 22)
    pdf.cell(0, 12, parsed["name"], new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.ln(3)

    if parsed["contact"]:
        pdf.set_font(font_name, "", 9)
        pdf.set_text_color(80, 80, 80)
        pdf.cell(0, 5, parsed["contact"], new_x="LMARGIN", new_y="NEXT", align="C")
        pdf.ln(6)

    pdf.set_draw_color(40, 40, 40)
    pdf.set_line_width(0.5)
    y = pdf.get_y()
    pdf.line(25, y, 185, y)
    pdf.ln(5)

    for sec in parsed["sections"]:
        pdf.set_font(font_bold, "", 13)
        pdf.set_text_color(30, 30, 30)
        pdf.set_fill_color(245, 245, 245)
        pdf.cell(0, 8, f"  {sec['title']}", new_x="LMARGIN", new_y="NEXT", fill=True)
        pdf.ln(3)

        pdf.set_font(font_name, "", 10)
        pdf.set_text_color(60, 60, 60)
        for item in sec["items"]:
            x = pdf.get_x()
            pdf.cell(6, 5, "•")
            pdf.set_x(x + 10)
            pdf.multi_cell(135, 5, item)
            pdf.ln(1)

        pdf.ln(3)

    pdf.set_text_color(0, 0, 0)
    return pdf.output()


def _build_docx(parsed: dict) -> bytes:
    from docx import Document
    from docx.shared import Pt, Cm, RGBColor
    from docx.enum.text import WD_ALIGN_PARAGRAPH
    from docx.oxml.ns import qn

    doc = Document()

    style = doc.styles["Normal"]
    style.font.name = "SimSun"
    style.font.size = Pt(11)
    style.paragraph_format.space_after = Pt(4)
    style.paragraph_format.space_before = Pt(0)

    for section in doc.sections:
        section.top_margin = Cm(2)
        section.bottom_margin = Cm(2)
        section.left_margin = Cm(2.5)
        section.right_margin = Cm(2.5)

    name_para = doc.add_paragraph()
    name_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
    name_run = name_para.add_run(parsed["name"])
    name_run.font.size = Pt(22)
    name_run.font.bold = True
    name_run.font.color.rgb = RGBColor(30, 30, 30)
    name_para.paragraph_format.space_after = Pt(4)

    if parsed["contact"]:
        contact_para = doc.add_paragraph()
        contact_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
        contact_run = contact_para.add_run(parsed["contact"])
        contact_run.font.size = Pt(9)
        contact_run.font.color.rgb = RGBColor(100, 100, 100)
        contact_para.paragraph_format.space_after = Pt(10)

    sep = doc.add_paragraph()
    sep.paragraph_format.space_before = Pt(0)
    sep.paragraph_format.space_after = Pt(10)
    pPr = sep._p.get_or_add_pPr()
    pBdr = pPr.makeelement(qn("w:pBdr"), {})
    bottom = pBdr.makeelement(qn("w:bottom"), {
        qn("w:val"): "single", qn("w:sz"): "6",
        qn("w:space"): "4", qn("w:color"): "333333",
    })
    pBdr.append(bottom)
    pPr.append(pBdr)

    for sec in parsed["sections"]:
        heading = doc.add_heading(sec["title"], level=2)
        heading.paragraph_format.space_before = Pt(10)
        heading.paragraph_format.space_after = Pt(4)
        for run in heading.runs:
            run.font.size = Pt(13)
            run.font.color.rgb = RGBColor(40, 40, 40)

        for item in sec["items"]:
            p = doc.add_paragraph(style="List Bullet")
            run = p.add_run(item)
            run.font.size = Pt(10.5)
            run.font.color.rgb = RGBColor(70, 70, 70)

    buf = io.BytesIO()
    doc.save(buf)
    buf.seek(0)
    return buf.read()


def export_resume(polished_text: str, fmt: str) -> tuple[bytes, str]:
    parsed = _parse_sections(polished_text)

    if fmt == "pdf":
        content = _build_pdf(parsed)
        return content, "application/pdf"
    elif fmt == "docx" or fmt == "word":
        content = _build_docx(parsed)
        return content, "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    elif fmt == "txt":
        content = _build_txt(parsed)
        return content, "text/plain; charset=utf-8"
    elif fmt == "md":
        content = _build_md(parsed)
        return content, "text/markdown; charset=utf-8"
    else:
        raise ValueError(f"不支持的导出格式: {fmt}")
