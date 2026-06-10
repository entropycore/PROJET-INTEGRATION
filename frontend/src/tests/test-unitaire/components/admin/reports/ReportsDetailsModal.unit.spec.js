import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import ReportModal from "@/components/admin/reports/ReportDetailsModal.vue";

const baseReport = {
  reason: "Contenu inapproprié",
  description: "Ce projet contient des images offensantes.",
  status: "PENDING",
  createdAt: "2024-06-15T10:30:00.000Z",
  targetType: "PROJECT",
  targetId: "42",
  reportedBy: {
    fullName: "Alice Dupont",
    email: "alice@example.com",
  },
};

const mountModal = (overrides = {}) =>
  mount(ReportModal, {
    props: { report: { ...baseReport, ...overrides } },
  });

describe("[UNIT] ReportDetailsModal", () => {
  it("affiche le contenu du signalement", () => {
    const wrapper = mountModal();

    expect(wrapper.find("h2").text()).toBe("Détail du signalement");
    expect(wrapper.text()).toContain("Contenu inapproprié");
    expect(wrapper.text()).toContain("Ce projet contient des images offensantes.");
    expect(wrapper.text()).toContain("#42");
  });

  it.each([
    ["PROJECT", "Projet"],
    ["PORTFOLIO", "Portfolio"],
    ["COMMENT", "Commentaire"],
    ["USER", "Utilisateur"],
  ])("traduit le type %s", (targetType, label) => {
    expect(mountModal({ targetType }).text()).toContain(label);
  });

  it("affiche le type brut si inconnu", () => {
    expect(mountModal({ targetType: "UNKNOWN" }).text()).toContain("UNKNOWN");
  });

  it("affiche les infos du signalant et gere fullName null", () => {
    expect(mountModal().text()).toContain("Alice Dupont");
    expect(mountModal().text()).toContain("alice@example.com");
    expect(
      () => mountModal({ reportedBy: { fullName: null, email: "x@x.com" } }),
    ).not.toThrow();
  });

  it("masque les actions quand le statut n'est pas PENDING", () => {
    const wrapper = mountModal({ status: "RESOLVED" });

    expect(wrapper.find(".cancel-btn").exists()).toBe(true);
    expect(wrapper.find(".resolve-btn").exists()).toBe(false);
    expect(wrapper.find(".reject-btn").exists()).toBe(false);
    expect(wrapper.find(".delete-btn").exists()).toBe(false);
  });

  it("emet les evenements avec le rapport complet", async () => {
    const wrapper = mountModal();

    await wrapper.find(".resolve-btn").trigger("click");
    await wrapper.find(".reject-btn").trigger("click");
    await wrapper.find(".delete-btn").trigger("click");

    expect(wrapper.emitted("resolve")?.[0][0]).toMatchObject({ targetId: "42" });
    expect(wrapper.emitted("reject")?.[0][0].reason).toBe("Contenu inapproprié");
    expect(wrapper.emitted("delete-target")?.[0][0].targetType).toBe("PROJECT");
  });
});
