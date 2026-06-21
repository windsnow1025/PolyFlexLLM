import logging
import uuid

import httpcore
import httpx
from fastapi import HTTPException

from app.client.nest_js_client.models import ConversationResDto, ConversationReqDto, Message, Content, ContentType, MessageRole
from app.client.nest_js_client.types import UNSET
from app.service.conversation import conversation_client
from app.service.file import file_logic
from llm_bridge import File



async def get_conversation(token: str, conversation_id: int) -> ConversationResDto:
    try:
        return await conversation_client.get_conversation(token, conversation_id)
    except HTTPException as e:
        raise e
    except (httpcore.ConnectError, httpx.ConnectError) as e:
        detail = f"ConnectError while fetching conversation: {e}"
        logging.exception(detail)
        raise HTTPException(status_code=500, detail=detail)
    except Exception as e:
        detail = f"Unknown error while fetching conversation: {e}"
        logging.exception(detail)
        raise HTTPException(status_code=500, detail=detail)


async def update_conversation(
        token: str,
        conversation_id: int,
        etag: str,
        conversation: ConversationReqDto
) -> ConversationResDto:
    try:
        return await conversation_client.update_conversation(
            token, conversation_id, etag, conversation
        )
    except HTTPException as e:
        raise e
    except (httpcore.ConnectError, httpx.ConnectError) as e:
        detail = f"ConnectError while updating conversation: {e}"
        logging.exception(detail)
        raise HTTPException(status_code=500, detail=detail)
    except Exception as e:
        detail = f"Unknown error while updating conversation: {e}"
        logging.exception(detail)
        raise HTTPException(status_code=500, detail=detail)


async def add_messages_to_conversation(
        token: str,
        conversation_id: int,
        new_messages: list[Message],
) -> ConversationResDto:
    conversation = await get_conversation(token, conversation_id)
    conversation.messages.extend(new_messages)

    updated_conversation_req = ConversationReqDto(
        name=conversation.name,
        messages=conversation.messages,
    )

    return await update_conversation(
        token=token,
        conversation_id=conversation_id,
        etag=str(int(conversation.version)),
        conversation=updated_conversation_req,
    )


async def save_response_to_conversation(
        token: str,
        conversation_id: int,
        text: str | None,
        thought: str | None,
        code: str | None,
        code_output: str | None,
        files: list[File] | None,
        display: str | None,
) -> None:
    try:
        # files -> file_urls
        file_urls = []
        if files:
            file_urls = await file_logic.upload_base64_files(token, files)

        # Assistant Message
        contents: list[Content] = []

        if code:
            contents.append(Content(type_=ContentType.CODE, data=code))
        if code_output:
            contents.append(Content(type_=ContentType.CODE_OUTPUT, data=code_output))
        if text:
            contents.append(Content(type_=ContentType.TEXT, data=text))
        for file_url in file_urls:
            contents.append(Content(type_=ContentType.FILE, data=file_url))

        assistant_message = Message(
            id=str(uuid.uuid4()),
            role=MessageRole.ASSISTANT,
            contents=contents,
            thought=thought or UNSET,
            display=display or UNSET,
        )

        # User Message
        empty_user_message = Message(
            id=str(uuid.uuid4()),
            role=MessageRole.USER,
            contents=[Content(type_=ContentType.TEXT, data="")],
        )

        await add_messages_to_conversation(
            token=token,
            conversation_id=conversation_id,
            new_messages=[assistant_message, empty_user_message],
        )
    except HTTPException as e:
        if e.status_code == 404:
            logging.warning(f"Conversation not found, skipping save: {e.detail}")
        else:
            raise e

