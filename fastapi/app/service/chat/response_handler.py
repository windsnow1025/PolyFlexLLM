import json
import logging
from asyncio import Queue, create_task
from collections.abc import AsyncGenerator
from typing import Callable, Awaitable

from fastapi import HTTPException
from fastapi.responses import StreamingResponse
from llm_bridge import ChatResponse, serialize

from app.service.chat import response_transform
from app.service.chat.generation_manager import generation_manager
from app.service.chat.generation_session import AbortIntent, GenerationSession, GenerationState
from app.service.conversation.conversation_logic import save_response_to_conversation

ChunkGenerator = AsyncGenerator[ChatResponse, None]
ReduceCredit = Callable[[int, int], Awaitable[float]]


async def _stream_response(session: GenerationSession) -> StreamingResponse:
    queue = await session.subscribe()

    async def sse_generator(session: GenerationSession, queue: Queue) -> AsyncGenerator[str, None]:
        try:
            while True:
                chunk = await queue.get()
                if chunk is None:
                    yield f"data: {json.dumps({'done': True})}\n\n"
                    break
                yield f"data: {json.dumps(serialize(chunk))}\n\n"
                if chunk.error:
                    break
        finally:
            await session.unsubscribe(queue)

    return StreamingResponse(sse_generator(session, queue), media_type='text/event-stream')


async def non_stream_handler(
        chat_response: ChatResponse,
        reduce_credit: ReduceCredit,
        token: str,
        conversation_id: int | None,
) -> ChatResponse:
    assert chat_response.input_tokens is not None and chat_response.output_tokens is not None
    cost = await reduce_credit(chat_response.input_tokens, chat_response.output_tokens)

    logging.info(f"content: {response_transform.to_log(chat_response)}")
    logging.info(f"cost: {cost}")

    if conversation_id is not None:
        await save_response_to_conversation(
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


async def stream_handler(
        generator: ChunkGenerator,
        reduce_credit: ReduceCredit,
        token: str,
        conversation_id: int | None,
) -> StreamingResponse:
    session = await generation_manager.start(conversation_id)

    async def run():
        try:
            async for chunk in generator:
                if session.state is not GenerationState.Running:
                    break
                await session.publish(chunk)
        except Exception as e:
            logging.exception(f"Error in generation: {e}")
            await session.publish(ChatResponse(error=str(e)))
        finally:
            if session.state is GenerationState.Running:
                await session.close(GenerationState.Completed)

            result = response_transform.aggregate(session.buffer)

            if result.error:
                generation_manager.finish(session)
            else:
                assert result.input_tokens is not None and result.output_tokens is not None
                cost = await reduce_credit(result.input_tokens, result.output_tokens)
                logging.info(f"content: {response_transform.to_log(result)}")
                logging.info(f"cost: {cost}")

                if session.conversation_id is not None and session.state in (
                        GenerationState.Completed,
                        GenerationState.StoppedKept,
                ):
                    await save_response_to_conversation(
                        token=token,
                        conversation_id=session.conversation_id,
                        text=result.text,
                        thought=result.thought,
                        code=result.code,
                        code_output=result.code_output,
                        files=result.files,
                        display=result.display,
                    )

                generation_manager.finish(session)

            session.mark_finalized()

    create_task(run())
    return await _stream_response(session)


async def resume_handler(conversation_id: int) -> StreamingResponse:
    session = generation_manager.get(conversation_id)
    if session is None:
        raise HTTPException(status_code=404, detail="No active generation")
    return await _stream_response(session)


async def abort_handler(conversation_id: int, intent: AbortIntent) -> None:
    session = generation_manager.get(conversation_id)
    if session is not None:
        state = GenerationState.StoppedKept if intent is AbortIntent.Keep else GenerationState.StoppedDiscarded
        await session.close(state)
        await session.wait_finalized()
