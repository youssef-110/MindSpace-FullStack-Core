import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("../supabase", () => ({ supabase: {} }));
const { claimDevice } = await import("../sync");
const { load, save } = await import("../storage");

describe("claimDevice", () => {
  beforeEach(() => localStorage.clear());

  it("adopts anonymous device data for the first account", () => {
    save("results", [{ id: "a" }]);
    claimDevice("user-1");
    expect(load("results")).toEqual([{ id: "a" }]);
    expect(load("owner")).toBe("user-1");
  });

  it("never exposes one account's data to another, and restores it later", () => {
    save("owner", "user-1");
    save("results", [{ id: "mine" }]);
    claimDevice("user-2");
    expect(load("results", [])).toEqual([]);
    save("results", [{ id: "theirs" }]);
    claimDevice("user-1");
    expect(load("results")).toEqual([{ id: "mine" }]);
    claimDevice("user-2");
    expect(load("results")).toEqual([{ id: "theirs" }]);
  });
});
