import { describe, it, expect } from "vitest";
import { detectCrisis, crisisResources } from "../safety";

describe("crisis detection", () => {
  it("detects explicit suicidal language", () => {
    expect(detectCrisis("I want to kill myself")).toBe(true);
    expect(detectCrisis("thinking about suicide a lot")).toBe(true);
    expect(detectCrisis("I want to end my life")).toBe(true);
  });

  it("detects self-harm and indirect phrasing", () => {
    expect(detectCrisis("I've been cutting myself")).toBe(true);
    expect(detectCrisis("I don't want to be alive")).toBe(true);
    expect(detectCrisis("i cant take it anymore")).toBe(true);
    expect(detectCrisis("I want to unalive myself")).toBe(true);
  });

  it("does not flag ordinary distress", () => {
    expect(detectCrisis("I feel really sad and tired today")).toBe(false);
    expect(detectCrisis("my anxiety is terrible lately")).toBe(false);
    expect(detectCrisis("I hate my job")).toBe(false);
    expect(detectCrisis("")).toBe(false);
    expect(detectCrisis(null)).toBe(false);
  });

  it("provides usable crisis resources", () => {
    expect(crisisResources.length).toBeGreaterThanOrEqual(3);
    expect(crisisResources.some((r) => r.contact.includes("988"))).toBe(true);
  });
});
