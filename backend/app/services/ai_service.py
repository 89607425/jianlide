"""AI调用封装服务，使用OpenAI SDK兼容格式调用硅基流动API。"""

import json
import re
import logging
from typing import Any
from openai import OpenAI
from app.config import settings

logger = logging.getLogger(__name__)


class AIService:
    """AI服务类，封装与硅基流动API的交互逻辑。"""

    def __init__(self) -> None:
        """初始化OpenAI客户端，配置为硅基流动API。"""
        self.client = OpenAI(
            api_key=settings.SILICONFLOW_API_KEY,
            base_url=settings.SILICONFLOW_BASE_URL,
        )
        self.model = settings.AI_MODEL

    def diagnose(self, resume_text: str, target_job: str = "", custom_prompt: str = "") -> dict[str, Any]:
        """调用AI进行简历诊断。"""
        from prompts.diagnosis_prompt import DIAGNOSIS_SYSTEM_PROMPT, DIAGNOSIS_USER_TEMPLATE

        if not target_job:
            target_job = "通用岗位"

        user_message = DIAGNOSIS_USER_TEMPLATE.format(
            target_job=target_job,
            resume_text=resume_text,
        )
        if custom_prompt:
            user_message += f"\n\n## 用户额外要求\n{custom_prompt}"

        response_text = self._call_model(
            system_prompt=DIAGNOSIS_SYSTEM_PROMPT,
            user_message=user_message,
        )

        result = self._validate_json(response_text)
        if not result:
            raise Exception("AI诊断返回格式异常，无法解析为有效JSON")

        # 校验四维度完整性
        for dim in ["ats", "content", "project", "match"]:
            if dim not in result:
                raise Exception(f"AI诊断结果缺少 {dim} 维度")
            if "score" not in result[dim]:
                raise Exception(f"AI诊断结果 {dim} 维度缺少 score")

        return result

    def polish(self, resume_text: str, diagnosis_summary: str = "", custom_prompt: str = "") -> dict[str, Any]:
        """调用AI进行简历润色。"""
        from prompts.polish_prompt import POLISH_SYSTEM_PROMPT, POLISH_USER_TEMPLATE

        if not diagnosis_summary:
            diagnosis_summary = "暂无诊断信息"

        user_message = POLISH_USER_TEMPLATE.format(
            resume_text=resume_text,
            diagnosis_summary=diagnosis_summary,
        )
        if custom_prompt:
            user_message += f"\n\n## 用户额外要求\n{custom_prompt}"

        response_text = self._call_model(
            system_prompt=POLISH_SYSTEM_PROMPT,
            user_message=user_message,
        )

        result = self._validate_json(response_text)
        if not result:
            raise Exception("AI润色返回格式异常，无法解析为有效JSON")

        if "polished_text" not in result:
            raise Exception("AI润色结果缺少 polished_text 字段")

        return result

    def _call_model(self, system_prompt: str, user_message: str) -> str:
        """调用大语言模型。

        Args:
            system_prompt: 系统提示词
            user_message: 用户消息

        Returns:
            模型返回的文本内容
        """
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message},
                ],
                temperature=0.3,
                max_tokens=4096,
            )
            content = response.choices[0].message.content
            if not content:
                raise Exception("AI返回内容为空")
            return content.strip()
        except Exception as e:
            logger.error(f"AI模型调用失败: {e}")
            raise Exception(f"AI服务异常: {str(e)}")

    def _validate_json(self, response: str) -> dict[str, Any] | None:
        """验证AI返回的JSON格式，提取并解析JSON内容。

        Args:
            response: AI返回的原始文本

        Returns:
            解析后的字典，若解析失败返回None
        """
        # 尝试直接解析
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            pass

        # 尝试提取JSON块（处理markdown包裹的情况）
        json_pattern = r"```(?:json)?\s*([\s\S]*?)```"
        matches = re.findall(json_pattern, response)
        for match in matches:
            try:
                return json.loads(match.strip())
            except json.JSONDecodeError:
                continue

        # 尝试提取花括号包裹的内容
        brace_pattern = r"\{[\s\S]*\}"
        match = re.search(brace_pattern, response)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                pass

        logger.error(f"AI返回内容无法解析为JSON: {response[:200]}")
        return None


# 全局实例
ai_service = AIService()
