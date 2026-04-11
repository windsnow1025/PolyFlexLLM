import logging
import os
from typing import AsyncGenerator

from llm_bridge import *
from starlette.responses import StreamingResponse

from app.service.chat import response_handler
from app.service.user import user_logic


async def handle_chat_interaction(
        request_id: str,
        token: str,
        user_id: str,
        messages: list[Message],
        model: str,
        api_type: str,
        temperature: float,
        stream: bool,
        thought: bool,
        web_search: bool,
        code_execution: bool,
        structured_output_schema: dict | None,
        conversation_id: int | None,
):
    logging.info(f"User ID: {user_id}, Request ID: {request_id}")

    async def reduce_credit(input_tokens: int, output_tokens: int) -> float:
        cost = calculate_chat_cost(
            api_type=api_type,
            model=model,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
        )
        await user_logic.reduce_credit(token, cost)
        return cost

    api_keys = {
        "OPENAI_API_KEY": os.environ.get("OPENAI_API_KEY"),
        "AZURE_API_KEY": os.environ.get("AZURE_API_KEY"),
        "AZURE_API_BASE": os.environ.get("AZURE_API_BASE"),
        "GITHUB_API_KEY": os.environ.get("GITHUB_API_KEY"),
        "GOOGLE_AI_STUDIO_FREE_TIER_API_KEY": os.environ.get("GOOGLE_AI_STUDIO_FREE_TIER_API_KEY"),
        "GOOGLE_AI_STUDIO_API_KEY": os.environ.get("GOOGLE_AI_STUDIO_API_KEY"),
        "VERTEX_AI_API_KEY": os.environ.get("VERTEX_AI_API_KEY"),
        "ANTHROPIC_API_KEY": os.environ.get("ANTHROPIC_API_KEY"),
        "XAI_API_KEY": os.environ.get("XAI_API_KEY"),
    }

    chat_client = await create_chat_client(
        api_keys=api_keys,
        messages=messages,
        model=model,
        api_type=api_type,
        temperature=temperature,
        stream=stream,
        thought=thought,
        web_search=web_search,
        code_execution=code_execution,
        structured_output_schema=structured_output_schema,
    )

    if stream:
        response = chat_client.generate_stream_response()

        async def final_response_handler(
                generator: AsyncGenerator[ChatResponse, None]
        ) -> StreamingResponse:
            return await response_handler.stream_handler(
                request_id, generator, reduce_credit, token, conversation_id
            )
    else:
        response = await chat_client.generate_non_stream_response()

        async def final_response_handler(
                content: ChatResponse
        ) -> ChatResponse:
            return await response_handler.non_stream_handler(
                request_id, content, reduce_credit, token, conversation_id
            )

    return await final_response_handler(response)
