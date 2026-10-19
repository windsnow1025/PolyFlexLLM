from fastapi import APIRouter
from llm_bridge import *
from pydantic import BaseModel

messages_convert_router = APIRouter()


class MessagesConvertRequest(BaseModel):
    messages: list[Message]
    api_type: str


@messages_convert_router.post("/messages/convert")
async def convert_messages(chat_request: MessagesConvertRequest):
    messages = chat_request.messages
    api_type = chat_request.api_type

    if api_type == "OpenAI" or api_type == "Grok":
        return await convert_messages_to_openai_responses(messages)
    if api_type == "OpenAI-Azure":
        return await convert_messages_to_openai(messages)
    if api_type == "Gemini":
        return await convert_messages_to_gemini(messages)
    if api_type == "Claude":
        return await convert_messages_to_claude(messages)
    return None
