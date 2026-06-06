"""FastAPI应用入口，配置CORS、路由挂载和全局异常处理。"""

import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.routers import auth, resume, diagnosis, polish, payment

# 确保上传目录存在
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

# 创建FastAPI应用实例
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI简历诊断工具 - 简立得",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS中间件配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # MVP阶段允许所有来源
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 全局异常处理
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """全局异常处理器，统一返回标准错误响应格式。"""
    return JSONResponse(
        status_code=500,
        content={
            "code": 9999,
            "message": f"服务器内部错误: {str(exc)}",
            "data": None,
        },
    )


# 注册路由
app.include_router(auth.router, prefix="/api/v1/auth", tags=["认证"])
app.include_router(resume.router, prefix="/api/v1/resumes", tags=["简历"])
app.include_router(diagnosis.router, prefix="/api/v1/diagnoses", tags=["诊断"])
app.include_router(polish.router, prefix="/api/v1/polish", tags=["润色"])
app.include_router(payment.router, prefix="/api/v1/payment", tags=["支付"])


@app.get("/", tags=["健康检查"])
async def root():
    """健康检查接口。"""
    return {
        "code": 0,
        "message": "success",
        "data": {
            "name": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "status": "running",
        },
    }


@app.on_event("startup")
async def startup_event():
    """应用启动时执行：创建数据库表。"""
    from app.database import Base, engine
    from app.models import User, Resume, Diagnosis, PolishResult, Order  # noqa: F401
    Base.metadata.create_all(bind=engine)
