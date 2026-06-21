from app.service.chat.generation_session import GenerationSession, GenerationState


class GenerationManager:
    def __init__(self) -> None:
        self._sessions: dict[int, GenerationSession] = {}  # conversation_id → current session

    async def start(self, conversation_id: int | None) -> GenerationSession:
        # Not resumable in anonymous conversation
        if conversation_id is None:
            return GenerationSession(conversation_id)

        # Close existing session
        old_session = self._sessions.get(conversation_id)
        if old_session is not None:
            await old_session.close(GenerationState.Superseded)

        # Start new session
        session = GenerationSession(conversation_id)
        self._sessions[conversation_id] = session
        return session

    def get(self, conversation_id: int) -> GenerationSession | None:
        return self._sessions.get(conversation_id)

    def finish(self, session: GenerationSession) -> None:
        conversation_id = session.conversation_id
        # Object-Identity Fencing: only the current session clears the slot
        if conversation_id is not None and self._sessions.get(conversation_id) is session:
            del self._sessions[conversation_id]

    def is_generating(self, conversation_id: int) -> bool:
        return conversation_id in self._sessions


generation_manager = GenerationManager()
