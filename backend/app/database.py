"""SQLite models and repository operations for V1."""

from __future__ import annotations

from datetime import datetime
from pathlib import Path
from typing import Iterator

from sqlalchemy import Boolean, DateTime, Float, Integer, String, Text, create_engine, select
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, sessionmaker

from .domain import StoredReading, TelemetryReading


class Base(DeclarativeBase):
    pass


class ReadingRecord(Base):
    __tablename__ = "readings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    device_id: Mapped[str] = mapped_column(String(64), index=True)
    device_timestamp: Mapped[datetime | None] = mapped_column(DateTime, index=True, nullable=True)
    received_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    water_level: Mapped[float] = mapped_column(Float)
    roll: Mapped[float] = mapped_column(Float)
    pitch: Mapped[float] = mapped_column(Float)
    alert: Mapped[bool] = mapped_column(Boolean)
    raw_packet: Mapped[str] = mapped_column(Text)


class DiagnosticRecord(Base):
    __tablename__ = "diagnostics"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    level: Mapped[str] = mapped_column(String(16))
    event: Mapped[str] = mapped_column(String(64), index=True)
    detail: Mapped[str] = mapped_column(Text)


def _to_domain(record: ReadingRecord) -> StoredReading:
    return StoredReading(
        id=record.id,
        device_id=record.device_id,
        device_timestamp=record.device_timestamp,
        received_at=record.received_at,
        water_level=record.water_level,
        roll=record.roll,
        pitch=record.pitch,
        alert=record.alert,
        raw_packet=record.raw_packet,
    )


class ReadingRepository:
    """Small repository that keeps SQLAlchemy details out of application services."""

    def __init__(self, database_url: str) -> None:
        if database_url.startswith("sqlite:///"):
            path = database_url.removeprefix("sqlite:///")
            if path and path != ":memory:":
                Path(path).parent.mkdir(parents=True, exist_ok=True)
        self.engine = create_engine(
            database_url,
            connect_args={"check_same_thread": False}
            if database_url.startswith("sqlite")
            else {},
        )
        self.sessions = sessionmaker(self.engine, expire_on_commit=False)

    def initialize(self) -> None:
        Base.metadata.create_all(self.engine)

    def close(self) -> None:
        self.engine.dispose()

    def add(self, reading: TelemetryReading) -> StoredReading:
        record = ReadingRecord(**reading.as_dict())
        # SQLAlchemy DateTime columns receive datetime objects, not serialized strings.
        record.device_timestamp = reading.device_timestamp
        record.received_at = reading.received_at
        with self.sessions.begin() as session:
            session.add(record)
        return _to_domain(record)

    def list(self, *, limit: int = 100, offset: int = 0) -> list[StoredReading]:
        with self.sessions() as session:
            statement = (
                select(ReadingRecord)
                .order_by(ReadingRecord.id.desc())
                .limit(limit)
                .offset(offset)
            )
            return [_to_domain(row) for row in session.scalars(statement)]

    def latest(self) -> StoredReading | None:
        rows = self.list(limit=1)
        return rows[0] if rows else None

    def iterate_chronological(
        self, *, start: datetime | None = None, end: datetime | None = None
    ) -> Iterator[StoredReading]:
        with Session(self.engine) as session:
            statement = select(ReadingRecord).order_by(ReadingRecord.id.asc())
            if start is not None:
                statement = statement.where(ReadingRecord.received_at >= start)
            if end is not None:
                statement = statement.where(ReadingRecord.received_at <= end)
            for row in session.scalars(statement).yield_per(500):
                yield _to_domain(row)

    def diagnostic(self, *, level: str, event: str, detail: str) -> None:
        record = DiagnosticRecord(
            created_at=datetime.now().astimezone(),
            level=level,
            event=event,
            detail=detail,
        )
        with self.sessions.begin() as session:
            session.add(record)

