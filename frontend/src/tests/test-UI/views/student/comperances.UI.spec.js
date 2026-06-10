import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";

import MesCompetences from "@/views/student/competances.vue";

vi.mock(
  "@/services/studentSkillsService",
  () => ({
    getMySkills: vi.fn(),
    getSkillStats: vi.fn(),
    addSkill: vi.fn(),
    deleteSkill: vi.fn(),
    getSkillsCatalog: vi.fn(),
    getSoftSkills: vi.fn(),
    addSoftSkill: vi.fn(),
    deleteSoftSkill: vi.fn(),
  })
);

describe("MesCompetences UI Tests", () => {
  it("displays page title", () => {
    const wrapper = mount(MesCompetences);

    expect(wrapper.text()).toContain(
      "Mes compétences"
    );
  });

  it("displays page header", () => {
    expect(
      mount(MesCompetences)
        .find(".page-header")
        .exists()
    ).toBe(true);
  });

  it("displays technical skills section", () => {
    expect(
      mount(MesCompetences)
        .text()
    ).toContain(
      "Compétences techniques"
    );
  });

  it("displays soft skills section", () => {
    expect(
      mount(MesCompetences)
        .text()
    ).toContain(
      "Compétences comportementales"
    );
  });

  it("displays radar section", () => {
    expect(
      mount(MesCompetences)
        .text()
    ).toContain(
      "Aperçu du profil technique"
    );
  });

  it("displays suggestions section", () => {
    expect(
      mount(MesCompetences)
        .text()
    ).toContain(
      "Suggestions d'amélioration"
    );
  });

  it("shows loading message", async () => {
    const wrapper = mount(MesCompetences);

    wrapper.vm.isLoading = true;

    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain(
      "Chargement..."
    );
  });

  it("shows error message", async () => {
    const wrapper = mount(MesCompetences);

    wrapper.vm.errorMessage =
      "Impossible de charger les compétences.";

    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain(
      "Impossible de charger les compétences."
    );
  });
});
