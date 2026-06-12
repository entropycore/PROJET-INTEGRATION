import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import ReportStats from "@/components/admin/reports/ReportsStats.vue";

const baseStats = {
  total: 142,
  pending: 37,
  resolved: 89,
  rejected: 16,
};

const mountStats = (stats = baseStats) =>
  mount(ReportStats, { props: { stats } });

describe("ReportStats", () => {
  it("affiche les quatre valeurs dans l'ordre", () => {
    const wrapper = mountStats();
    const values = wrapper.findAll(".stat-card strong").map((node) => node.text());

    expect(values).toEqual(["142", "37", "89", "16"]);
  });

  it("affiche les labels actuels", () => {
    const wrapper = mountStats();
    const labels = wrapper.findAll(".stat-card span").map((node) => node.text());

    expect(labels).toEqual(["Total", "En attente", "Traites", "Rejetes"]);
  });

  it("rend exactement 4 stat-cards", () => {
    const wrapper = mountStats();

    expect(wrapper.findAll(".stat-card")).toHaveLength(4);
  });

  it("affiche les valeurs zero", () => {
    const wrapper = mountStats({
      total: 0,
      pending: 0,
      resolved: 0,
      rejected: 0,
    });
    const values = wrapper.findAll(".stat-card strong").map((node) => node.text());

    expect(values).toEqual(["0", "0", "0", "0"]);
  });

  it("met a jour les valeurs quand la prop stats change", async () => {
    const wrapper = mountStats();

    await wrapper.setProps({
      stats: { total: 999, pending: 0, resolved: 200, rejected: 5 },
    });

    const values = wrapper.findAll(".stat-card strong").map((node) => node.text());
    expect(values).toEqual(["999", "0", "200", "5"]);
  });
});
