import { describe, it, expect } from "vitest";

describe("MesCompetences Unit Tests", () => {
  const normalizeScore = (value) => {
    const score = Number(value);

    if (!Number.isFinite(score)) return null;

    return Math.min(100, Math.max(0, Math.round(score)));
  };

  const getSkillScore = (skill) => {
    return normalizeScore(
      skill.level ?? skill.masteryLevel
    );
  };

  it("normalizes score correctly", () => {
    expect(normalizeScore(75.4)).toBe(75);
  });

  it("limits score to 100", () => {
    expect(normalizeScore(150)).toBe(100);
  });

  it("limits score to 0", () => {
    expect(normalizeScore(-10)).toBe(0);
  });

  it("returns null for invalid value", () => {
    expect(normalizeScore("abc")).toBe(null);
  });

  it("gets score from level", () => {
    expect(
      getSkillScore({
        level: 80,
      })
    ).toBe(80);
  });

  it("gets score from masteryLevel", () => {
    expect(
      getSkillScore({
        masteryLevel: 60,
      })
    ).toBe(60);
  });
});