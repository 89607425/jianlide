"""内存验证码存储（MVP 阶段，后续可改为 Redis）。"""

import time
import random
import logging

logger = logging.getLogger(__name__)

_codes: dict[str, tuple[str, float]] = {}

CODE_EXPIRY = 300
CLEANUP_INTERVAL = 600
_last_cleanup = 0.0


def _cleanup():
    global _last_cleanup
    now = time.time()
    if now - _last_cleanup < CLEANUP_INTERVAL:
        return
    expired = [k for k, (_, ts) in _codes.items() if now - ts > CODE_EXPIRY]
    for k in expired:
        del _codes[k]
    _last_cleanup = now


def generate_code(email: str) -> str:
    """为指定邮箱生成6位数字验证码并存储，同时尝试发送邮件。"""
    _cleanup()
    code = f"{random.randint(100000, 999999)}"
    _codes[email] = (code, time.time())
    logger.info(f"[验证码] {email} -> {code}")

    from app.utils.email_service import send_verification_code
    sent = send_verification_code(email, code)
    if not sent:
        logger.info(f"[验证码] 邮件发送失败，验证码已在控制台打印")
    return code, sent


def verify_code(email: str, code: str) -> bool:
    """验证邮箱和验证码是否匹配。"""
    _cleanup()
    stored = _codes.get(email)
    if not stored:
        return False
    stored_code, ts = stored
    if time.time() - ts > CODE_EXPIRY:
        del _codes[email]
        return False
    if stored_code != code:
        return False
    del _codes[email]
    return True
