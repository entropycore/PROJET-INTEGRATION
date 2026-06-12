import { describe, it, expect } from "vitest";

describe("MesBadges Unit Tests", () => {
  const progressPercent = (badge) => {
    if (badge.isObtained) return 100;

    const current = Number(badge.progress?.current || 0);
    const target = Number(badge.progress?.target || 0);

    if (!target) return 0;

    return Math.min(
      Math.max(Math.round((current / target) * 100), 0),
      100
    );
  };

  const getBadgeStatus = (badge) => {
    if (badge.isObtained) return "obtained";

    return Number(badge.progress?.current || 0) > 0
      ? "in-progress"
      : "locked";
  };

  it("returns 100 when badge is obtained", () => {
    expect(
      progressPercent({
        isObtained: true,
      })
    ).toBe(100);
  });

  it("calculates progress percentage correctly", () => {
    expect(
      progressPercent({
        isObtained: false,
        progress: {
          current: 1,
          target: 2,
        },
      })
    ).toBe(50);
  });

  it("returns obtained status", () => {
    expect(
      getBadgeStatus({
        isObtained: true,
      })
    ).toBe("obtained");
  });

  it("returns in-progress status", () => {
    expect(
      getBadgeStatus({
        isObtained: false,
        progress: {
          current: 1,
        },
      })
    ).toBe("in-progress");
  });

  it("returns locked status", () => {
    expect(
      getBadgeStatus({
        isObtained: false,
        progress: {
          current: 0,
        },
      })
    ).toBe("locked");
  });
});