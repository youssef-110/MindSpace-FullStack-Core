import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getCheckins, saveCheckin, todayKey, dateKey, shiftKey, streak, roughRun, lastNDays, average, weekdayPattern } from "../checkin";
import { exportData, importData, clearDeviceData, load } from "../storage";

const entry = (date, mood = 3, extra = {}) => ({ date, mood, energy: 3, tags: [], note: "", ...extra });

beforeEach(() => localStorage.clear());
afterEach(() => vi.useRealTimers());

describe("local dates", () => {
  it("uses the local calendar day, not the UTC one", () => {
    // Either side of local midnight. A UTC-based key gets one of these wrong in every zone but UTC.
    expect(dateKey(new Date(2026, 0, 31, 23, 59))).toBe("2026-01-31");
    expect(dateKey(new Date(2026, 1, 1, 0, 1))).toBe("2026-02-01");
  });

  it("todayKey follows the clock", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 2, 1, 0, 30));
    expect(todayKey()).toBe("2026-03-01");
  });

  it("steps across month, year, leap-day and daylight-saving boundaries", () => {
    expect(shiftKey("2026-03-01", -1)).toBe("2026-02-28");
    expect(shiftKey("2024-03-01", -1)).toBe("2024-02-29");
    expect(shiftKey("2026-01-01", -1)).toBe("2025-12-31");
    expect(shiftKey("2026-12-31", 1)).toBe("2027-01-01");
    expect(shiftKey("2026-03-30", -1)).toBe("2026-03-29"); // EU clocks change on the 29th
    expect(shiftKey("2026-03-09", -1)).toBe("2026-03-08"); // US clocks change on the 8th
    expect(shiftKey("2026-10-25", 1)).toBe("2026-10-26");
  });
});

describe("saveCheckin", () => {
  it("keeps one entry per day: saving again replaces it", () => {
    saveCheckin(entry("2026-11-16", 2));
    saveCheckin(entry("2026-11-15", 4));
    saveCheckin(entry("2026-11-16", 5, { note: "better by evening" }));
    expect(getCheckins()).toEqual([entry("2026-11-16", 5, { note: "better by evening" }), entry("2026-11-15", 4)]);
  });

  it("rejects bad entries and trims the note", () => {
    expect(saveCheckin(entry("2026-11-16", 6))).toBe(null);
    expect(saveCheckin(entry("2026-11-16", 2.5))).toBe(null);
    expect(saveCheckin(entry("2026-02-31"))).toBe(null);
    expect(saveCheckin(entry("16/11/2026"))).toBe(null);
    expect(saveCheckin({ date: "2026-11-16", mood: 3 })).toBe(null);
    expect(getCheckins()).toEqual([]);
    expect(saveCheckin(entry("2026-11-16", 3, { note: "x".repeat(400), tags: ["Sleep", "Sleep", 7] }))).toMatchObject({ tags: ["Sleep"] });
    expect(getCheckins()[0].note).toHaveLength(280);
  });

  it("announces the save", () => {
    const heard = vi.fn();
    window.addEventListener("mindspace:checkin-saved", heard);
    saveCheckin(entry("2026-11-16"));
    window.removeEventListener("mindspace:checkin-saved", heard);
    expect(heard).toHaveBeenCalledTimes(1);
    expect(heard.mock.calls[0][0].detail.date).toBe("2026-11-16");
  });
});

describe("streak", () => {
  const today = "2026-03-02";
  it("is zero with nothing logged, or when the last entry is older than yesterday", () => {
    expect(streak([], today)).toBe(0);
    expect(streak([entry("2026-02-28")], today)).toBe(0);
  });

  it("counts back from today across a month boundary", () => {
    expect(streak([entry("2026-03-02"), entry("2026-03-01"), entry("2026-02-28"), entry("2026-02-27")], today)).toBe(4);
  });

  it("still counts when today is not logged yet", () => {
    expect(streak([entry("2026-03-01"), entry("2026-02-28")], today)).toBe(2);
  });

  it("stops at a gap, whatever order the entries are in", () => {
    expect(streak([entry("2026-02-27"), entry("2026-03-02"), entry("2026-03-01")], today)).toBe(2);
  });

  it("counts rough days running, and a better today ends the run", () => {
    expect(roughRun([entry("2026-03-02", 1), entry("2026-03-01", 1), entry("2026-02-28", 2)], today)).toBe(2);
    expect(roughRun([entry("2026-03-01", 1), entry("2026-02-28", 1)], today)).toBe(2);
    expect(roughRun([entry("2026-03-02", 3), entry("2026-03-01", 1), entry("2026-02-28", 1)], today)).toBe(0);
    expect(roughRun([entry("2026-03-02", 1), entry("2026-02-28", 1)], today)).toBe(1);
  });
});

describe("lastNDays and average", () => {
  const today = "2026-03-02";
  const log = [entry("2026-03-02", 5), entry("2026-02-28", 2), entry("2026-01-15", 1)];

  it("returns n slots, oldest first, with null for days not logged", () => {
    const slots = lastNDays(log, 4, today);
    expect(slots.map((s) => s?.date ?? null)).toEqual([null, "2026-02-28", null, "2026-03-02"]);
    expect(lastNDays([], 3, today)).toEqual([null, null, null]);
    expect(lastNDays(log, 1, today)).toEqual([log[0]]);
  });

  it("ignores entries outside the window and in the future", () => {
    expect(lastNDays([...log, entry("2026-03-03", 4)], 30, today).filter(Boolean)).toHaveLength(2);
  });

  it("averages only the logged days in the window", () => {
    expect(average(log, "mood", 7, today)).toBe(3.5);
    expect(average(log, "energy", 7, today)).toBe(3);
    expect(average(log, "mood", 1, "2026-03-01")).toBe(null);
  });

  it("groups by weekday, Monday first", () => {
    // 2026-03-02 is a Monday, 2026-02-28 a Saturday, 2026-01-15 a Thursday.
    const pattern = weekdayPattern([...log, entry("2026-02-23", 3)]);
    expect(pattern[0]).toEqual({ count: 2, mood: 4 });
    expect(pattern[3]).toEqual({ count: 1, mood: 1 });
    expect(pattern[5]).toEqual({ count: 1, mood: 2 });
    expect(pattern[6]).toEqual({ count: 0, mood: null });
  });
});

describe("backup and device data", () => {
  it("round-trips check-ins and keeps the entry already on this device", () => {
    saveCheckin(entry("2026-11-15", 4));
    saveCheckin(entry("2026-11-14", 2));
    const backup = exportData();
    localStorage.clear();
    saveCheckin(entry("2026-11-15", 1));
    importData(backup);
    expect(getCheckins().map((c) => [c.date, c.mood])).toEqual([["2026-11-15", 1], ["2026-11-14", 2]]);
  });

  it("imports older backups without check-ins, and drops invalid entries", () => {
    expect(importData(JSON.stringify({ app: "mindspace", version: 2, results: [], progress: {} }))).toBe(0);
    importData(JSON.stringify({ app: "mindspace", version: 2, results: [], progress: {}, checkins: [entry("2026-11-14"), entry("2026-11-14", 5), { date: "nope" }, null, entry("2026-11-13", 9)] }));
    expect(getCheckins()).toEqual([entry("2026-11-14")]);
  });

  it("clearing the device removes check-ins", () => {
    saveCheckin(entry("2026-11-16"));
    clearDeviceData();
    expect(load("checkins", null)).toBe(null);
  });
});
