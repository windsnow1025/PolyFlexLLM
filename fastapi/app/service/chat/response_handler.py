import json
import logging
import uuid
from asyncio import Queue, create_task
from collections.abc import AsyncGenerator
from typing import Callable, Awaitable

from fastapi import HTTPException
from fastapi.responses import StreamingResponse
from llm_bridge import ChatResponse, File, serialize

from app.client.nest_js_client.models import Message, Content, ContentType, MessageRole
from app.service.chat.generation_manager import generation_manager
from app.service.conversation import conversation_logic
from app.service.file import file_logic

ChunkGenerator = AsyncGenerator[ChatResponse, None]
ReduceCredit = Callable[[int, int], Awaitable[float]]


def _build_message(
        text: str | None,
        thought: str | None,
        code: str | None,
        code_output: str | None,
        file_urls: list[str],
        display: str | None,
) -> Message:
    contents = []

    if code:
        contents.append(Content(type_=ContentType.CODE, data=code))
    if code_output:
        contents.append(Content(type_=ContentType.CODE_OUTPUT, data=code_output))
    if text:
        contents.append(Content(type_=ContentType.TEXT, data=text))
    for file_url in file_urls:
        contents.append(Content(type_=ContentType.FILE, data=file_url))

    return Message(
        id=str(uuid.uuid4()),
        role=MessageRole.ASSISTANT,
        contents=contents,
        thought=thought,
        display=display,
    )


def _to_log(response: ChatResponse) -> ChatResponse:
    return ChatResponse(
        text=response.text,
        thought=response.thought,
        code=response.code,
        code_output=response.code_output,
        files=[File(name=f.name, type=f.type, data=f"<base64 len={len(f.data)}>") for f in (response.files or [])],
        display=response.display,
        input_tokens=response.input_tokens,
        output_tokens=response.output_tokens,
    )


async def _save_conversation(
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
        file_urls = []
        if files:
            file_urls = await file_logic.upload_base64_files(token, files)

        assistant_message = _build_message(
            text=text,
            thought=thought,
            code=code,
            code_output=code_output,
            file_urls=file_urls,
            display=display,
        )

        empty_user_message = Message(
            id=str(uuid.uuid4()),
            role=MessageRole.USER,
            contents=[Content(type_=ContentType.TEXT, data="")],
        )

        await conversation_logic.add_messages_to_conversation(
            token=token,
            conversation_id=conversation_id,
            new_messages=[assistant_message, empty_user_message],
        )
    except HTTPException as e:
        if e.status_code == 404:
            logging.warning(f"Conversation not found, skipping save: {e.detail}")
        else:
            raise e


async def non_stream_handler(
        request_id: str,
        chat_response: ChatResponse,
        reduce_credit: ReduceCredit,
        token: str,
        conversation_id: int | None,
) -> ChatResponse:
    generation_manager.start(conversation_id, request_id)
    try:
        cost = await reduce_credit(chat_response.input_tokens, chat_response.output_tokens)

        logging.info(f"content: {_to_log(chat_response)}")
        logging.info(f"cost: {cost}")

        if conversation_id is not None and not generation_manager.is_aborted(request_id):
            await _save_conversation(
                token=token,
                conversation_id=conversation_id,
                text=chat_response.text,
                thought=chat_response.thought,
                code=chat_response.code,
                code_output=chat_response.code_output,
                files=chat_response.files,
                display=chat_response.display,
            )

        return chat_response
    finally:
        generation_manager.finish(conversation_id, request_id)


async def stream_handler(
        request_id: str,
        generator: ChunkGenerator,
        reduce_credit: ReduceCredit,
        token: str,
        conversation_id: int | None,
) -> StreamingResponse:
    generation_manager.start(conversation_id, request_id)
    queue: Queue = Queue()

    async def background_generator():
        text = ""
        thought = ""
        code = ""
        code_output = ""
        files = []
        display = ""
        input_tokens = 0
        output_tokens = 0
        error = ""

        try:
            async for chunk in generator:
                if generation_manager.is_aborted(request_id):
                    logging.info(f"Request {request_id} aborted")
                    break

                logging.info(f"chunk: {_to_log(chunk)}")

                if chunk.text:
                    text += chunk.text
                if chunk.thought:
                    thought += chunk.thought
                if chunk.code:
                    code += chunk.code
                if chunk.code_output:
                    code_output += chunk.code_output
                if chunk.files:
                    files += chunk.files
                if chunk.display:
                    display += chunk.display
                if chunk.input_tokens:
                    input_tokens = chunk.input_tokens
                if chunk.output_tokens:
                    output_tokens += chunk.output_tokens
                if chunk.error:
                    error += chunk.error

                await queue.put(chunk)

            if error:
                return

            chat_response = ChatResponse(
                text=text,
                thought=thought,
                code=code,
                code_output=code_output,
                files=files,
                display=display,
                input_tokens=input_tokens,
                output_tokens=output_tokens,
            )

            cost = await reduce_credit(input_tokens, output_tokens)

            logging.info(f"content: {_to_log(chat_response)}")
            logging.info(f"cost: {cost}")

            if conversation_id is not None and not generation_manager.is_aborted(request_id):
                await _save_conversation(
                    token=token,
                    conversation_id=conversation_id,
                    text=chat_response.text,
                    thought=chat_response.thought,
                    code=chat_response.code,
                    code_output=chat_response.code_output,
                    files=chat_response.files,
                    display=chat_response.display,
                )

        except Exception as e:
            logging.exception(f"Error in background_generator: {e}")
            await queue.put(ChatResponse(error=str(e)))
        finally:
            await queue.put(None)
            generation_manager.finish(conversation_id, request_id)

    async def sse_generator() -> AsyncGenerator[str, None]:
        while True:
            chunk = await queue.get()
            if chunk is None:
                chunk = {'done': True}
            yield f"data: {json.dumps(serialize(chunk))}\n\n"
            if (isinstance(chunk, dict) and chunk.get("done")) or (hasattr(chunk, "error") and chunk.error):
                break

    create_task(background_generator())

    return StreamingResponse(sse_generator(), media_type='text/event-stream')
