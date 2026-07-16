from datetime import datetime, timezone

from backend.app.parser import parse_telemetry


def test_persists_and_lists_readings(repository):
    packet = "Node01,16-07-2026,14:35:20,124.5,1.98,2.3,-1.1,180.4,0"
    reading = parse_telemetry(packet, received_at=datetime.now(timezone.utc))

    stored = repository.add(reading)
    result = repository.list()

    assert stored.id > 0
    assert len(result) == 1
    assert result[0].raw_packet == packet
    assert result[0].rain is False



def test_readings_survive_repository_restart(tmp_path):
    from backend.app.database import ReadingRepository

    database_url = f"sqlite:///{tmp_path / 'restart.db'}"
    first = ReadingRepository(database_url)
    first.initialize()
    packet = "Node01,16-07-2026,14:35:20,124.5,1.98,2.3,-1.1,180.4"
    first.add(parse_telemetry(packet, received_at=datetime.now(timezone.utc)))
    first.close()

    reopened = ReadingRepository(database_url)
    reopened.initialize()
    assert reopened.latest() is not None
    assert reopened.latest().raw_packet == packet
    reopened.close()
