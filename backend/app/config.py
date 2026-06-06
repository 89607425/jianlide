"""应用配置管理模块，从.env文件读取所有配置项。"""

import os
from dotenv import load_dotenv

_env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
load_dotenv(_env_path)


class Settings:
    """全局配置类，集中管理所有应用配置。"""

    # 数据库配置
    DATABASE_URL: str = os.getenv("DATABASE_URL", "mysql+pymysql://root:hjy89607425@localhost:3306/jianlida")

    # AI服务配置
    SILICONFLOW_API_KEY: str = os.getenv("SILICONFLOW_API_KEY", "")
    SILICONFLOW_BASE_URL: str = os.getenv("SILICONFLOW_BASE_URL", "https://api.siliconflow.cn/v1")
    AI_MODEL: str = os.getenv("AI_MODEL", "deepseek-ai/DeepSeek-V3")

    # JWT配置
    JWT_SECRET: str = os.getenv("JWT_SECRET", "jianlida_jwt_secret_key_2025")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_EXPIRE_DAYS: int = int(os.getenv("JWT_EXPIRE_DAYS", "7"))

    # 文件上传配置
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./uploads")
    MAX_FILE_SIZE: int = int(os.getenv("MAX_FILE_SIZE", "5242880"))  # 5MB

    # 应用配置
    APP_NAME: str = os.getenv("APP_NAME", "简立得")
    APP_VERSION: str = os.getenv("APP_VERSION", "1.0.0")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"

    # 产品定价
    PRICE_FULL_REPORT: float = 9.90
    PRICE_POLISH: float = 19.90

    # 每日诊断次数限制
    FREE_DIAGNOSIS_LIMIT: int = 2       # 非会员每日
    MEMBER_DIAGNOSIS_LIMIT: int = 8     # 会员每日

    # 邮件配置
    EMAIL_HOST: str = os.getenv("EMAIL_HOST", "smtp.qq.com")
    EMAIL_PORT: int = int(os.getenv("EMAIL_PORT", "587"))
    EMAIL_USER: str = os.getenv("EMAIL_USER", "")
    EMAIL_PASSWORD: str = os.getenv("EMAIL_PASSWORD", "")
    EMAIL_FROM: str = os.getenv("EMAIL_FROM", "")


settings = Settings()
