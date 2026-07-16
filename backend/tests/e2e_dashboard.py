"""Browser-level V1 smoke test run against the simulator backend."""

from pathlib import Path

from playwright.sync_api import sync_playwright


ARTIFACT = Path("artifacts/dashboard-v1.png")
ARTIFACT.parent.mkdir(parents=True, exist_ok=True)

with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 1100})
    console_errors: list[str] = []
    page.on(
        "console",
        lambda message: console_errors.append(message.text)
        if message.type == "error"
        else None,
    )

    page.goto("http://127.0.0.1:8000", wait_until="networkidle")
    page.get_by_text("Current conditions").wait_for()
    page.get_by_text("Receiving telemetry").wait_for(timeout=15_000)
    page.get_by_text("Node01", exact=True).first.wait_for()
    page.get_by_text("Raw telemetry").wait_for()
    page.get_by_text("Reading history").wait_for()

    assert page.get_by_role("link", name="Export CSV").get_attribute("href") == (
        "/api/v1/readings/export.csv"
    )
    assert page.locator("table.raw-table tbody tr").count() >= 1
    assert page.locator(".history-panel tbody tr").count() >= 1
    assert not console_errors, console_errors

    page.screenshot(path=str(ARTIFACT), full_page=True)
    browser.close()

