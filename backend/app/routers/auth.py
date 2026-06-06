"""认证路由：注册、登录、找回密码和用户信息。"""

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user import RegisterRequest, LoginRequest
from app.repositories.user_repo import UserRepo
from app.utils.security import hash_password, verify_password, create_access_token, decode_access_token
from app.utils.code_store import generate_code, verify_code
from app.models.user import User
import re

router = APIRouter()


def get_user_from_token(authorization: str, db: Session) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="无效的认证信息")

    token = authorization.replace("Bearer ", "")
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token无效或已过期")

    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Token无效")

    user = UserRepo.get_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=401, detail="用户不存在")

    return user


def _user_response(user: User) -> dict:
    token = create_access_token(data={"user_id": user.id})
    return {
        "code": 0,
        "message": "success",
        "data": {
            "id": user.id,
            "phone": user.phone,
            "nickname": user.nickname,
            "member_type": user.member_type,
            "email": user.email or "",
            "token": token,
        },
    }


@router.post("/send-code")
def send_code(req: dict, db: Session = Depends(get_db)):
    """发送邮箱验证码（用于注册和找回密码）。"""
    email = (req.get("email") or "").strip()
    if not email or not re.match(r"^[\w.+-]+@[\w-]+\.[\w.-]+$", email):
        return {"code": 2004, "message": "请输入有效的邮箱地址", "data": None}

    code, email_sent = generate_code(email)
    if email_sent:
        return {"code": 0, "message": f"验证码已发送至 {email}", "data": {"email": email}}
    else:
        print(f"\n{'='*60}\n[验证码] {email} -> {code}\n{'='*60}\n")
        return {"code": 0, "message": f"验证码已发送至 {email}（SMTP未配置，验证码: {code}）", "data": {"email": email}}


@router.post("/register")
def register(req: dict, db: Session = Depends(get_db)):
    """注册：手机号 + 邮箱 + 密码 + 邮箱验证码。"""
    phone = (req.get("phone") or "").strip()
    email = (req.get("email") or "").strip()
    password = (req.get("password") or "").strip()
    code = (req.get("code") or "").strip()

    if not phone or not email or not password or not code:
        return {"code": 2004, "message": "手机号、邮箱、密码和验证码不能为空", "data": None}

    if not re.match(r"^1\d{10}$", phone):
        return {"code": 2004, "message": "请输入有效的手机号", "data": None}

    if len(password) < 6 or len(password) > 20:
        return {"code": 2004, "message": "密码长度需在6-20位之间", "data": None}

    if not re.match(r"^[\w.+-]+@[\w-]+\.[\w.-]+$", email):
        return {"code": 2004, "message": "请输入有效的邮箱地址", "data": None}

    if not verify_code(email, code):
        return {"code": 2005, "message": "验证码错误或已过期", "data": None}

    existing = UserRepo.get_by_phone(db, phone)
    if existing:
        return {"code": 2001, "message": "该手机号已注册", "data": None}

    email_existing = UserRepo.get_by_email(db, email)
    if email_existing:
        return {"code": 2001, "message": "该邮箱已被其他账号绑定", "data": None}

    password_hash = hash_password(password)
    user = UserRepo.create(db, phone=phone, password_hash=password_hash, email=email)
    return _user_response(user)


@router.post("/login")
def login(req: dict, db: Session = Depends(get_db)):
    """登录：手机号+密码 或 邮箱+密码。"""
    account = (req.get("account") or "").strip()
    password = (req.get("password") or "").strip()

    if not account or not password:
        return {"code": 2004, "message": "账号和密码不能为空", "data": None}

    user = None
    if account.startswith("1") and len(account) == 11 and account.isdigit():
        user = UserRepo.get_by_phone(db, account)
    else:
        user = UserRepo.get_by_email(db, account)

    if not user:
        return {"code": 2001, "message": "用户未注册", "data": None}

    if not verify_password(password, user.password_hash):
        return {"code": 2002, "message": "密码错误", "data": None}

    return _user_response(user)


@router.post("/forgot-password")
def forgot_password(req: dict, db: Session = Depends(get_db)):
    """找回密码：邮箱 + 验证码 + 新密码。"""
    email = (req.get("email") or "").strip()
    code = (req.get("code") or "").strip()
    new_password = (req.get("new_password") or "").strip()

    if not email or not code or not new_password:
        return {"code": 2004, "message": "邮箱、验证码和新密码不能为空", "data": None}

    if len(new_password) < 6 or len(new_password) > 20:
        return {"code": 2004, "message": "新密码长度需在6-20位之间", "data": None}

    if not verify_code(email, code):
        return {"code": 2005, "message": "验证码错误或已过期", "data": None}

    user = UserRepo.get_by_email(db, email)
    if not user:
        return {"code": 2001, "message": "该邮箱未注册", "data": None}

    UserRepo.update_password(db, user.id, hash_password(new_password))
    return {"code": 0, "message": "密码重置成功，请使用新密码登录", "data": None}


@router.get("/me")
def get_me(
    authorization: str = Header(""),
    db: Session = Depends(get_db),
):
    """获取当前用户信息。"""
    try:
        user = get_user_from_token(authorization, db)
        return {
            "code": 0,
            "message": "success",
            "data": {
                "id": user.id,
                "phone": user.phone,
                "nickname": user.nickname,
                "member_type": user.member_type,
                "email": user.email or "",
            },
        }
    except HTTPException as e:
        return {"code": 2003, "message": str(e.detail), "data": None}
