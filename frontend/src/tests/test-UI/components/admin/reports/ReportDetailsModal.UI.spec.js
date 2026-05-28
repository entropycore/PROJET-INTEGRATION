import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import ReportDetailModal from "@/components/admin/reports/ReportDetailsModal.vue";

const baseReport = {
  reason: "Contenu inapproprié",
  description: "Ce projet contient des images offensantes.",
  status: "PENDING",
  createdAt: "2026-05-20T14:32:00.000Z",
  targetType: "PROJECT",
  targetId: 4872,
  reportedBy: {
    fullName: "Julien Dupont",
    email: "julien.dupont@mail.com",
  },
};

const makeReport = (overrides = {}) => ({ ...baseReport, ...overrides });
const mountModal = (report = baseReport) =>
  mount(ReportDetailModal, { props: { report } });

describe("ReportDetailModal", () => {
  it("affiche les informations principales du signalement", () => {
    const wrapper = mountModal();

    expect(wrapper.text()).toContain("Détail du signalement");
    expect(wrapper.text()).toContain(baseReport.reason);
    expect(wrapper.text()).toContain(baseReport.description);
    expect(wrapper.text()).toContain("#4872");
    expect(wrapper.text()).toContain("Julien Dupont");
    expect(wrapper.text()).toContain("julien.dupont@mail.com");
    expect(wrapper.find(".reporter-avatar").text()).toBe("JU");
  });

  it.each([
    ["PROJECT", "Projet"],
    ["PORTFOLIO", "Portfolio"],
    ["COMMENT", "Commentaire"],
    ["USER", "Utilisateur"],
  ])("traduit targetType %s", (targetType, expected) => {
    const wrapper = mountModal(makeReport({ targetType }));

    expect(wrapper.text()).toContain(expected);
  });

  it("affiche le targetType brut si inconnu", () => {
    const wrapper = mountModal(makeReport({ targetType: "UNKNOWN_TYPE" }));

    expect(wrapper.text()).toContain("UNKNOWN_TYPE");
  });

  it("affiche les boutons d'action uniquement pour PENDING", () => {
    const pending = mountModal(makeReport({ status: "PENDING" }));
    const resolved = mountModal(makeReport({ status: "RESOLVED" }));

    expect(pending.find(".resolve-btn").exists()).toBe(true);
    expect(pending.find(".reject-btn").exists()).toBe(true);
    expect(pending.find(".delete-btn").exists()).toBe(true);
    expect(resolved.find(".resolve-btn").exists()).toBe(false);
    expect(resolved.find(".cancel-btn").exists()).toBe(true);
  });

  it("emet les evenements attendus", async () => {
    const wrapper = mountModal();

    await wrapper.find(".close-btn").trigger("click");
    await wrapper.find(".resolve-btn").trigger("click");
    await wrapper.find(".reject-btn").trigger("click");
    await wrapper.find(".delete-btn").trigger("click");

    expect(wrapper.emitted("close")).toHaveLength(1);
    expect(wrapper.emitted("resolve")?.[0]).toEqual([baseReport]);
    expect(wrapper.emitted("reject")?.[0]).toEqual([baseReport]);
    expect(wrapper.emitted("delete-target")?.[0]).toEqual([baseReport]);
  });
});
