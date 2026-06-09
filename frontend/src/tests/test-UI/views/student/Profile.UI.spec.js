import {
  describe,
  it,
  expect,
  vi,
} from "vitest";

import { mount } from "@vue/test-utils";

import Profile from "@/views/student/Profile.vue";

vi.mock(
  "@/services/studentProfileService",
  () => ({
    getStudentProfile: vi.fn(),
    updateStudentProfile: vi.fn(),
    uploadStudentProfilePicture:
      vi.fn(),
    getAcademicPaths: vi.fn(),
    addAcademicPath: vi.fn(),
    deleteAcademicPath: vi.fn(),
    getSoftSkills: vi.fn(),
    addSoftSkill: vi.fn(),
    deleteSoftSkill: vi.fn(),
    getCareerGoal: vi.fn(),
    updateCareerGoal: vi.fn(),
  })
);

vi.mock(
  "@/stores/auth",
  () => ({
    useAuthStore: () => ({
      user: {},
    }),
  })
);

describe("Profile UI Tests", () => {
  it("renders component", () => {
    const wrapper =
      mount(Profile);

    expect(
      wrapper.exists()
    ).toBe(true);
  });

  it("shows loading message", async () => {
    const wrapper =
      mount(Profile);

    wrapper.vm.isLoading = true;

    await wrapper.vm.$nextTick();

    expect(
      wrapper.text()
    ).toContain(
      "Chargement..."
    );
  });

  it("shows error message", async () => {
    const wrapper =
      mount(Profile);

    wrapper.vm.errorMessage =
      "Erreur test";

    await wrapper.vm.$nextTick();

    expect(
      wrapper.text()
    ).toContain(
      "Erreur test"
    );
  });

  it("shows success message", async () => {
    const wrapper =
      mount(Profile);

    wrapper.vm.successMessage =
      "Succès test";

    await wrapper.vm.$nextTick();

    expect(
      wrapper.text()
    ).toContain(
      "Succès test"
    );
  });

  it("contains personal information section", () => {
    const wrapper =
      mount(Profile);

    expect(
      wrapper.text()
    ).toContain(
      "Informations personnelles"
    );
  });

  it("contains career goal section", () => {
    const wrapper =
      mount(Profile);

    expect(
      wrapper.text()
    ).toContain(
      "Objectif professionnel"
    );
  });

  it("contains soft skills section", () => {
    const wrapper =
      mount(Profile);

    expect(
      wrapper.text()
    ).toContain(
      "Compétences comportementales"
    );
  });

  it("contains academic path section", () => {
    const wrapper =
      mount(Profile);

    expect(
      wrapper.text()
    ).toContain(
      "Parcours académique"
    );
  });

  it("contains add button", () => {
    const wrapper =
      mount(Profile);

    expect(
      wrapper.text()
    ).toContain(
      "Ajouter"
    );
  });
});