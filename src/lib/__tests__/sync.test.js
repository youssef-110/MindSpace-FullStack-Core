import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("../supabase", () => ({ supabase: {} }));
const { claimDevice, releaseDevice } = await import("../sync");
const { load, save, clearDeviceData } = await import("../storage");

describe("device ownership", () => {
  beforeEach(() => localStorage.clear());

  it("adopts anonymous device data for the account that signs in", () => {
    save("results", [{ id: "a", date: "2026-01-01" }]);
    claimDevice("user-1");
    expect(load("results")).toEqual([{ id: "a", date: "2026-01-01" }]);
    expect(load("owner")).toBe("user-1");
  });

  it("signing out parks the data, so anonymous use starts empty", () => {
    claimDevice("user-1");
    save("results", [{ id: "mine", date: "2026-01-02" }]);
    releaseDevice();
    expect(load("results", [])).toEqual([]);
    expect(load("owner", null)).toBe(null);
  });

  it("never shows one account's data to another, and restores it on return", () => {
    claimDevice("user-1");
    save("results", [{ id: "mine", date: "2026-01-02" }]);
    releaseDevice();
    claimDevice("user-2");
    expect(load("results", [])).toEqual([]);
    save("results", [{ id: "theirs", date: "2026-01-03" }]);
    releaseDevice();
    claimDevice("user-1");
    expect(load("results").map((r) => r.id)).toEqual(["mine"]);
  });

  it("parks a stale owner's data when another account signs in", () => {
    save("owner", "user-1");
    save("results", [{ id: "mine", date: "2026-01-02" }]);
    claimDevice("user-2");
    expect(load("results", [])).toEqual([]);
    expect(load("stash:user-1").results[0].id).toBe("mine");
  });

  it("clearing the device removes every parked copy", () => {
    claimDevice("user-1");
    save("results", [{ id: "mine", date: "2026-01-02" }]);
    releaseDevice();
    clearDeviceData();
    expect(Object.keys(localStorage).filter((k) => k.includes("stash:"))).toEqual([]);
  });
});
