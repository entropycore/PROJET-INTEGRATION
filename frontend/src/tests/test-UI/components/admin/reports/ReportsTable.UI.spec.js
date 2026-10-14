import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import ReportsTable from "@/components/admin/reports/ReportsTable.vue";

const mockReports = [
  {
    id: "rep-1",
    reason: "Contenu abusif",
    description: "Ce portfolio contient des propos inappropriés.",
    targetType: "PORTFOLIO",
    reportedBy: { fullName: "Safae", email: "safae@ensat.ma" },
    status: "PENDING",
    createdAt: new Date().toISOString(),
  },
  {
    id: "rep-2",
    reason: "Plagiat",
    description: "Copie conforme d'un autre projet.",
    targetType: "COMMENT",
    reportedBy: { fullName: "Douae", email: "douae@ensat.ma" },
    status: "RESOLVED",
    createdAt: new Date().toISOString(),
  },
];

describe("ReportsTable - Tests UI & Composant", () => {
  it("affiche le message vide lorsque la liste est vide", () => {
    const wrapper = mount(ReportsTable, {
      props: { reports: [] },
    });

    expect(wrapper.find(".empty").exists()).toBe(true);
    expect(wrapper.text()).toContain("Aucun signalement trouve.");
  });

  it("affiche correctement les donnees et les badges traduits", () => {
    const wrapper = mount(ReportsTable, {
      props: { reports: mockReports },
    });

    expect(wrapper.findAll(".table-row")).toHaveLength(2);
    expect(wrapper.text()).toContain("Portfolio");
    expect(wrapper.text()).toContain("Commentaire");
    expect(wrapper.text()).toContain("En attente");
    expect(wrapper.text()).toContain("Traite");
  });

  it("ouvre le menu actions et masque les actions de resolution si le statut est RESOLVED", async () => {
    const wrapper = mount(ReportsTable, {
      props: { reports: mockReports },
    });

    const secondRow = wrapper.findAll(".table-row")[1];
    await secondRow.find(".actions-trigger").trigger("click");

    const menuButtons = secondRow.findAll(".actions-dropdown-menu button");
    expect(menuButtons).toHaveLength(1);
    expect(menuButtons[0].text()).toBe("Voir details");
  });

  it("emet les evenements depuis le menu actions", async () => {
    const wrapper = mount(ReportsTable, {
      props: { reports: [mockReports[0]] },
    });

    await wrapper.find(".actions-trigger").trigger("click");
    const buttons = wrapper.findAll(".actions-dropdown-menu button");

    await buttons[1].trigger("click");
    expect(wrapper.emitted("resolve")?.[0]).toEqual([mockReports[0]]);

    await wrapper.find(".actions-trigger").trigger("click");
    await wrapper.findAll(".actions-dropdown-menu button")[3].trigger("click");
    expect(wrapper.emitted("delete-target")?.[0]).toEqual([mockReports[0]]);
  });
});
