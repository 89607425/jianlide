# 简立得 - AI 简历诊断与优化工具

## 项目简介

简立得是一款 AI 简历分析与优化工具，用户上传 PDF 格式简历后，系统自动解析并从 **ATS 通过率、内容质量、项目经历、岗位匹配度** 四大维度进行诊断，生成评分报告和改进建议，支持 AI 润色优化。

## 技术栈

| 层次 | 技术 |
|------|------|
| 后端框架 | Python FastAPI |
| 数据库 | MySQL 8.0 |
| ORM | SQLAlchemy 2.0 |
| AI 服务 | DeepSeek-V3（通过硅基流动 API） |
| 前端框架 | React 18 + TypeScript |
| 构建工具 | Vite 5 |
| CSS 方案 | Tailwind CSS 3 |

## 环境要求

- **Python** >= 3.10
- **Node.js** >= 18
- **MySQL** 8.0（需提前安装并运行）

## 快速启动

### 1. 初始化数据库

```bash
# 使用 mysql 命令创建数据库和表
mysql -u root -p < backend/init_db.sql
```

执行后会创建 `jianlida` 数据库及 `user`、`resume`、`diagnosis`、`polish_result`、`order` 五张表。

### 2. 配置环境变量

编辑 `backend/.env`，填入你的配置：

```env
# 数据库配置（替换为你的 MySQL 用户名和密码）
DATABASE_URL=mysql+pymysql://root:你的密码@localhost:3306/jianlida

# AI 服务配置（前往 https://siliconflow.cn 获取 API Key）
SILICONFLOW_API_KEY=你的硅基流动APIKey
SILICONFLOW_BASE_URL=https://api.siliconflow.cn/v1
AI_MODEL=deepseek-ai/DeepSeek-V3

# JWT 配置
JWT_SECRET=jianlida_jwt_secret_key_2025_prod
JWT_ALGORITHM=HS256
JWT_EXPIRE_DAYS=7

# 其他配置保持默认即可
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
APP_NAME=简立得
APP_VERSION=1.0.0
DEBUG=True
```

### 3. 启动后端

```bash
cd backend

# 创建虚拟环境（推荐）
python3 -m venv venv
source venv/bin/activate    # macOS/Linux
# venv\Scripts\activate     # Windows

# 安装依赖
pip install -r requirements.txt

# 启动服务（默认监听 http://localhost:8000）
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

启动后访问 http://localhost:8000/docs 可查看 Swagger API 文档。

### 4. 启动前端

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器（默认 http://localhost:5173）
npm run dev
```

前端开发服务器已配置代理，`/api` 路径的请求会自动转发到后端 `http://localhost:8000`。

### 5. 使用

1. 浏览器打开 http://localhost:5173
2. 在首页点击"免费开始使用"进行注册/登录
3. 上传 PDF 格式简历
4. 等待 AI 诊断完成，查看评分和问题预览
5. 点击"解锁完整报告"购买完整诊断（MVP 阶段为 Mock 支付，点击即成功）

## 项目结构

```
jianlida/
├── backend/                  # 后端代码
│   ├── app/
│   │   ├── main.py           # FastAPI 应用入口
│   │   ├── config.py         # 配置管理
│   │   ├── database.py       # 数据库连接
│   │   ├── models/           # ORM 模型
│   │   ├── schemas/          # Pydantic 请求/响应模型
│   │   ├── routers/          # API 路由
│   │   ├── services/         # 业务逻辑层
│   │   ├── repositories/     # 数据访问层
│   │   └── utils/            # 工具函数
│   ├── prompts/              # AI Prompt 模板
│   ├── init_db.sql           # 数据库初始化 SQL
│   └── requirements.txt      # Python 依赖
├── frontend/                 # 前端代码
│   └── src/
│       ├── App.tsx           # 根组件 + 路由
│       ├── pages/            # 页面组件
│       ├── components/       # 通用组件
│       ├── hooks/            # 自定义 Hooks
│       ├── api/              # API 调用层
│       └── types/            # TypeScript 类型定义
├── docs/                     # 设计文档
└── 简立得-PRD-v1.0.md        # 产品需求文档
```

## 常见问题

**Q: 提示数据库连接失败？**
A: 确保 MySQL 服务已启动，`.env` 中的用户名密码正确，且已执行 `init_db.sql`。

**Q: AI 诊断返回错误？**
A: 检查 `SILICONFLOW_API_KEY` 是否有效，可前往 https://siliconflow.cn 获取。

**Q: 上传 PDF 后解析失败？**
A: MVP 阶段仅支持文字型 PDF（非扫描件/图片），请确保 PDF 中的文字可选中复制。
