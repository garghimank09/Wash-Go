from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.auth.dependencies import get_current_active_user
from app.models.user import User
from app.schemas.assistant_schema import AssistantChatRequest, AssistantChatResponse, ChatMessage
from app.services import assistant_llm_service

router = APIRouter(prefix="/assistant", tags=["Assistant"])


def _strip_client_system(messages: list[ChatMessage]) -> list[dict[str, str]]:
    """Ignore client system messages; server injects its own system prompt."""
    return [{"role": m.role, "content": m.content} for m in messages if m.role != "system"]


@router.post("/chat", response_model=AssistantChatResponse)
async def assistant_chat(
    payload: AssistantChatRequest,
    _: Annotated[User, Depends(get_current_active_user)],
) -> AssistantChatResponse:
    history = _strip_client_system(payload.messages)
    if not history:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Send at least one user or assistant message.",
        )
    try:
        message, model = await assistant_llm_service.complete_chat(history)
    except assistant_llm_service.AssistantLLMError as e:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(e)) from e
    return AssistantChatResponse(message=message, model=model)
