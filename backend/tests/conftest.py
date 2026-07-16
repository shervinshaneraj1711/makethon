from __future__ import annotations

import pytest

from backend.app.database import ReadingRepository


@pytest.fixture
def repository(tmp_path):
    repo = ReadingRepository(f"sqlite:///{tmp_path / 'test.db'}")
    repo.initialize()
    yield repo
    repo.close()

