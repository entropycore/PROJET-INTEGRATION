import { describe, it, expect } from "vitest";

describe("Github Unit Tests", () => {
  const isRepoImported = (
    repo,
    importedRepos
  ) => {
    return (
      repo.isImported ||
      importedRepos.includes(repo.name)
    );
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Intl.DateTimeFormat(
      "fr-FR",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    ).format(new Date(date));
  };

  it("returns true when repo is imported", () => {
    expect(
      isRepoImported(
        {
          name: "Portfolio",
          isImported: true,
        },
        []
      )
    ).toBe(true);
  });

  it("returns true when repo exists in imported list", () => {
    expect(
      isRepoImported(
        {
          name: "Portfolio",
        },
        ["Portfolio"]
      )
    ).toBe(true);
  });

  it("returns false when repo is not imported", () => {
    expect(
      isRepoImported(
        {
          name: "Portfolio",
        },
        []
      )
    ).toBe(false);
  });

  it("formats date correctly", () => {
    expect(
      formatDate("2025-05-10")
    ).toContain("2025");
  });

  it("returns dash for empty date", () => {
    expect(
      formatDate(null)
    ).toBe("—");
  });
});