import { describe, expect, it } from "vitest";

import { connectionLabel, formatDeviceTimestamp, formatNumber } from "./format";

describe("telemetry formatting", () => {
  it("does not invent missing numeric values", () => {
    expect(formatNumber(null)).toBe("—");
  });

  it("preserves configured precision", () => {
    expect(formatNumber(1.9876, 3)).toBe("1.988");
  });

  it("formats protocol and connection labels for display", () => {
    expect(formatDeviceTimestamp("2026-07-16T14:35:20")).toBe("2026-07-16 14:35:20");
    expect(connectionLabel("configuration_required")).toBe("configuration required");
  });
});

