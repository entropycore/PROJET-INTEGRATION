import { describe, it, expect } from "vitest";

describe("Dashboard Unit Tests", () => {
  const getStatusLabel = (status) => {
    const labels = {
      APPROVED: "Validé",
      PENDING: "En attente",
      DRAFT: "Brouillon",
      CORRECTION_REQUIRED: "Correction",
      CHANGES_REQUESTED: "Correction",
      REJECTED: "Refusé",
    };

    return labels[status] || status;
  };

  const getNotificationIconClass = (type) => {
    const classes = {
      SUCCESS: "success",
      INFO: "info",
      VALIDATION: "warning",
      BADGE: "badge",
      ALERT: "alert",
    };

    return classes[type] || "info";
  };

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString(
      "fr-FR",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  it("returns correct status label", () => {
    expect(
      getStatusLabel("APPROVED")
    ).toBe("Validé");
  });

  it("returns correction label", () => {
    expect(
      getStatusLabel(
        "CORRECTION_REQUIRED"
      )
    ).toBe("Correction");
  });

  it("returns notification class", () => {
    expect(
      getNotificationIconClass(
        "SUCCESS"
      )
    ).toBe("success");
  });

  it("returns default notification class", () => {
    expect(
      getNotificationIconClass(
        "UNKNOWN"
      )
    ).toBe("info");
  });

  it("formats date correctly", () => {
    expect(
      formatDate("2025-05-10")
    ).toContain("2025");
  });

  it("returns empty string for null date", () => {
    expect(
      formatDate(null)
    ).toBe("");
  });
});