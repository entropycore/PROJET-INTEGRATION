import { describe, it, expect } from "vitest";

describe("Profile Unit Tests", () => {
  const getInitials = (fn, ln) =>
    `${fn?.[0] || ""}${ln?.[0] || ""}`.toUpperCase();

  const formatProfileDate = (date) => {
    if (!date) return "";

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
      return "";
    }

    return new Intl.DateTimeFormat(
      "fr-FR",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }
    ).format(value);
  };

  const formatDateRange = (
    startDate,
    endDate
  ) => {
    const start =
      formatProfileDate(startDate) ||
      "Date non renseignée";

    const end =
      formatProfileDate(endDate) ||
      "Présent";

    return `${start} — ${end}`;
  };

  const normalizeSoftSkills = (
    payload
  ) => {
    const items = Array.isArray(payload)
      ? payload
      : payload?.softSkills || [];

    return items
      .map((skill) => ({
        id:
          skill.id ||
          skill.name,
        name:
          skill.name || "",
      }))
      .filter(
        (skill) => skill.name
      );
  };

  it("generates initials", () => {
    expect(
      getInitials(
        "Mohamed",
        "Alaoui"
      )
    ).toBe("MA");
  });

  it("returns empty initials when names are missing", () => {
    expect(
      getInitials("", "")
    ).toBe("");
  });

  it("formats profile date", () => {
    expect(
      formatProfileDate(
        "2025-01-10"
      )
    ).toContain("2025");
  });

  it("returns empty string for invalid date", () => {
    expect(
      formatProfileDate(
        "invalid-date"
      )
    ).toBe("");
  });

  it("formats date range", () => {
    expect(
      formatDateRange(
        "2023-01-01",
        "2024-01-01"
      )
    ).toContain("2024");
  });

  it("normalizes soft skills", () => {
    expect(
      normalizeSoftSkills([
        {
          id: 1,
          name: "Leadership",
        },
      ])
    ).toEqual([
      {
        id: 1,
        name: "Leadership",
      },
    ]);
  });
});