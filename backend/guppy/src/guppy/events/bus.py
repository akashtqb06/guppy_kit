import logging
import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from guppy.models.event import PlatformEvent

logger = logging.getLogger(__name__)


class EventBus:
    async def emit(
        self,
        *,
        db: AsyncSession,
        event_type: str,  # "tool.execution.started" | "tool.execution.completed" | ...
        payload: dict,
        execution_id: uuid.UUID | None = None,
        artifact_id: uuid.UUID | None = None,
        project_id: uuid.UUID | None = None,
    ) -> PlatformEvent:
        event = PlatformEvent(
            type=event_type,
            payload=payload,
            execution_id=execution_id,
            artifact_id=artifact_id,
            project_id=project_id,
        )
        db.add(event)
        await db.flush()
        logger.info("Event emitted: %s [execution=%s]", event_type, execution_id)
        return event


# Singleton
event_bus = EventBus()
