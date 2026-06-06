"""邮件发送服务：通过 SMTP 发送验证码邮件。"""

import smtplib
import logging
from email.mime.text import MIMEText
from email.utils import formataddr
from app.config import settings

logger = logging.getLogger(__name__)


def send_verification_code(email: str, code: str) -> bool:
    if not settings.EMAIL_USER or not settings.EMAIL_PASSWORD:
        logger.warning(f"[邮件] SMTP 未配置，验证码 {email} -> {code}")
        return False

    try:
        display_name = "简立得"
        from_addr = formataddr((display_name, settings.EMAIL_USER))

        msg = MIMEText(
            f"您好!\n\n您的验证码是:{code}\n\n验证码5分钟内有效,请勿泄露。\n\n—— 简立得 AI简历诊断",
            "plain", "utf-8",
        )
        msg["From"] = from_addr
        msg["To"] = email
        msg["Subject"] = "简立得 - 验证码"

        server = smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT, timeout=10)
        server.starttls()
        server.login(settings.EMAIL_USER, settings.EMAIL_PASSWORD)
        server.sendmail(settings.EMAIL_USER, [email], msg.as_string())
        server.quit()

        logger.info(f"[邮件] 验证码已发送至 {email}")
        return True
    except Exception as e:
        logger.error(f"[邮件] 发送失败: {e}")
        return False
