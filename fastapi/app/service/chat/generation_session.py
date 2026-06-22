import asyncio
from enum import Enum

from llm_bridge import ChatResponse


class GenerationState(Enum):
    Running = "running"
    Completed = "completed"
    StoppedKept = "stopped_kept"
    StoppedDiscarded = "stopped_discarded"
    Superseded = "superseded"


class AbortIntent(str, Enum):
    Discard = "discard"
    Keep = "keep"


class GenerationSession:
    def __init__(self, conversation_id: int | None) -> None:
        self._conversation_id: int | None = conversation_id
        self._state: GenerationState = GenerationState.Running
        self._buffer: list[ChatResponse] = []
        self._subscribers: set[asyncio.Queue] = set()
        self._lock: asyncio.Lock = asyncio.Lock()
        self._finalized: asyncio.Event = asyncio.Event()

    @property
    def conversation_id(self) -> int | None:
        return self._conversation_id

    @property
    def state(self) -> GenerationState:
        return self._state

    @property
    def buffer(self) -> list[ChatResponse]:
        return self._buffer

    async def publish(self, chunk: ChatResponse) -> None:
        async with self._lock:
            self._buffer.append(chunk)
            for queue in self._subscribers:
                queue.put_nowait(chunk)

    async def subscribe(self) -> asyncio.Queue:
        async with self._lock:
            queue: asyncio.Queue = asyncio.Queue()

            for chunk in self._buffer: # Replay
                queue.put_nowait(chunk)

            if self._state is GenerationState.Running: # Running: subscribe
                self._subscribers.add(queue)
            else: # Finished: end
                queue.put_nowait(None)
            return queue

    async def unsubscribe(self, queue: asyncio.Queue) -> None:
        async with self._lock:
            self._subscribers.discard(queue)

    async def close(self, state: GenerationState) -> None:
        async with self._lock:
            self._state = state

    async def notify_end(self) -> None:
        async with self._lock:
            for queue in self._subscribers:
                queue.put_nowait(None)
            self._subscribers.clear()

    def mark_finalized(self) -> None:
        self._finalized.set()

    async def wait_finalized(self) -> None:
        await self._finalized.wait()
