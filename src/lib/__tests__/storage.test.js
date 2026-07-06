import { describe, it, expect, beforeEach } from "vitest";
import { load, save, remove, appendToList } from "../storage";

beforeEach(() => localStorage.clear());

describe("storage", () => {
  it("round-trips values", () => {
    save("x", { a: 1 });
    expect(load("x")).toEqual({ a: 1 });
  });

  it("returns fallback for missing or corrupt keys", () => {
    expect(load("nope", [])).toEqual([]);
    localStorage.setItem("mindspace:bad", "{not json");
    expect(load("bad", "fb")).toBe("fb");
  });

  it("removes keys", () => {
    save("y", 1);
    remove("y");
    expect(load("y", null)).toBeNull();
  });

  it("appendToList prepends and caps", () => {
    appendToList("list", 1, 3);
    appendToList("list", 2, 3);
    appendToList("list", 3, 3);
    const result = appendToList("list", 4, 3);
    expect(result).toEqual([4, 3, 2]);
  });
});
