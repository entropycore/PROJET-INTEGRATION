import {
  describe,
  it,
  expect,
  vi,
} from "vitest";

import { mount } from "@vue/test-utils";
import { getGithubStats } from "@/services/studentGithub";

import Github from "@/views/student/Github.vue";

vi.mock(
  "@/services/studentGithub",
  () => ({
    connectGithub: vi.fn(),
    getGithubStats: vi.fn(),
    importGithubRepository: vi.fn(),
  })
);

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

const githubStatsResponse = {
  data: {
    data: {
      connected: false,
      repositories: [],
      languages: [],
    },
  },
};

const mountLoadedGithub = async () => {
  const wrapper = mount(Github);
  await flushPromises();
  await wrapper.vm.$nextTick();
  return wrapper;
};

describe("Github UI Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getGithubStats).mockResolvedValue(githubStatsResponse);
  });

  it("renders component", () => {
    const wrapper = mount(Github);

    expect(
      wrapper.exists()
    ).toBe(true);
  });

  it("displays page title", () => {
    const wrapper = mount(Github);

    expect(
      wrapper.text()
    ).toContain("Mon GitHub");
  });

  it("displays github header", () => {
    const wrapper = mount(Github);

    expect(
      wrapper.find(
        ".github-page-header"
      ).exists()
    ).toBe(true);
  });

  it("shows loading message", async () => {
    const wrapper = mount(Github);

    wrapper.vm.isLoading = true;

    await wrapper.vm.$nextTick();

    expect(
      wrapper.text()
    ).toContain(
      "Chargement des données GitHub"
    );
  });

  it("shows github connect section", async () => {
    const wrapper = await mountLoadedGithub();

    expect(
      wrapper.text()
    ).toContain(
      "Lier votre compte GitHub"
    );
  });

  it("shows connect button", async () => {
    const wrapper = await mountLoadedGithub();

    expect(
      wrapper.text()
    ).toContain(
      "Connecter GitHub"
    );
  });

  it("shows benefits section", async () => {
    const wrapper = await mountLoadedGithub();

    expect(
      wrapper.text()
    ).toContain(
      "Pourquoi connecter GitHub à Credencia"
    );
  });

  it("shows import projects benefit", async () => {
    const wrapper = await mountLoadedGithub();

    expect(
      wrapper.text()
    ).toContain(
      "Importez vos projets"
    );
  });

  it("shows contributions benefit", async () => {
    const wrapper = await mountLoadedGithub();

    expect(
      wrapper.text()
    ).toContain(
      "Suivez vos contributions"
    );
  });

  it("shows error message", async () => {
    const wrapper = await mountLoadedGithub();

    wrapper.vm.errorMessage =
      "Connexion GitHub impossible pour le moment.";

    await wrapper.vm.$nextTick();

    expect(
      wrapper.text()
    ).toContain(
      "Connexion GitHub impossible pour le moment."
    );
  });
});
