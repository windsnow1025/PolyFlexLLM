import logging
from typing import Any, Optional

from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from llm_bridge import Message, get_model_prices, ModelPrice, find_model_prices
from pydantic import BaseModel

import app.service.auth as auth
from app.client.nest_js_client.models import UserResDto
from app.service.chat import response_handler
from app.service.chat.chat_service import handle_chat_interaction
from app.service.chat.generation_manager import generation_manager
from app.service.chat.generation_session import AbortIntent
from app.service.conversation import conversation_logic
from app.service.user import user_logic

chat_router = APIRouter()
security = HTTPBearer()


class ChatRequest(BaseModel):
    messages: list[Message]
    api_type: str
    model: str
    temperature: float
    stream: bool
    thought: bool
    web_search: bool
    code_execution: bool
    structured_output_schema: Optional[dict[str, Any]] = None
    conversation_id: Optional[int] = None


class AbortRequest(BaseModel):
    conversation_id: int
    intent: AbortIntent


@chat_router.post("/chat")
async def generate(
        chat_request: ChatRequest,
        credentials: HTTPAuthorizationCredentials = Depends(security),
):
    try:
        token: str = credentials.credentials
        user_id: str = auth.get_user_id_from_token(token)

        if find_model_prices(chat_request.api_type, chat_request.model) is None:
            raise HTTPException(status_code=400, detail="Invalid API Type and Model combination")

        user: UserResDto = await user_logic.get_user(token)
        if not user.email_verified:
            raise HTTPException(status_code=401, detail="Email not verified")
        if user.credit <= 0:
            raise HTTPException(status_code=402, detail="Insufficient credit")

        return await handle_chat_interaction(
            token=token,
            user_id=user_id,
            messages=chat_request.messages,
            model=chat_request.model,
            api_type=chat_request.api_type,
            temperature=chat_request.temperature,
            stream=chat_request.stream,
            thought=chat_request.thought,
            web_search=chat_request.web_search,
            code_execution=chat_request.code_execution,
            structured_output_schema=chat_request.structured_output_schema,
            conversation_id=chat_request.conversation_id,
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        logging.exception(e)
        raise HTTPException(status_code=500, detail=str(e))


@chat_router.get("/chat/stream/{conversation_id}")
async def resume(
        conversation_id: int,
        credentials: HTTPAuthorizationCredentials = Depends(security),
):
    token: str = credentials.credentials
    auth.get_user_id_from_token(token)
    await conversation_logic.get_conversation(token, conversation_id)
    return await response_handler.resume_handler(conversation_id)


@chat_router.post("/chat/abort")
async def abort_chat(
        abort_request: AbortRequest,
        credentials: HTTPAuthorizationCredentials = Depends(security),
) -> bool:
    token: str = credentials.credentials
    auth.get_user_id_from_token(token)
    await conversation_logic.get_conversation(token, abort_request.conversation_id)
    await response_handler.abort_handler(abort_request.conversation_id, abort_request.intent)
    return True


@chat_router.get("/chat/generating/{conversation_id}")
async def is_generating(
        conversation_id: int,
        credentials: HTTPAuthorizationCredentials = Depends(security),
) -> bool:
    token: str = credentials.credentials
    auth.get_user_id_from_token(token)
    return generation_manager.is_generating(conversation_id)


@chat_router.get("/model")
async def get_models() -> list[ModelPrice]:
    return get_model_prices()
