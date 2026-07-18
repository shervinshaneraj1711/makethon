"""Transport interface kept independent from parsing and persistence."""

from __future__ import annotations

from abc import ABC, abstractmethod


class TelemetryTransport(ABC):
    """Blocking line-oriented transport used from an asyncio worker thread."""

    name: str
    endpoint: str | None

    @abstractmethod
    def connect(self) -> None:
        """Open the underlying connection or raise an exception."""

    @abstractmethod
    def readline(self) -> str | None:
        """Return one complete line, or ``None`` on a normal read timeout."""

    @abstractmethod
    def write(self, data: bytes) -> None:
        """Write raw bytes to the transport connection."""

    @abstractmethod
    def close(self) -> None:
        """Close the connection safely and idempotently."""

