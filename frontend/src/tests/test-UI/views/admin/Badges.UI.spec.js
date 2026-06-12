import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Badges from "@/views/admin/Badges.vue";
import { createBadge, updateBadge } from "@/services/adminBadgesApi";

const badges = [
  {
    id: "web",
    name: "Web Developer",
    description: "Badge web",
    rule: "Projet web valide",
    attributionCount: 10,
  },
  {
    id: "devops",
    name: "DevOps Explorer",
    description: "Badge DevOps",
    rule: "Pipeline valide",
    attributionCount: 5,
  },
  {
    id: "hackathon",
    name: "Hackathon Participant",
    description: "Badge hackathon",
    rule: "Participation valide",
    attributionCount: 3,
  },
];

vi.mock("@/services/adminBadgesApi", () => ({
  getBadges: vi.fn(() => Promise.resolve({ items: badges })),
  createBadge: vi.fn(() => Promise.resolve()),
  updateBadge: vi.fn(() => Promise.resolve()),
  deleteBadge: vi.fn(() => Promise.resolve()),
}));

const mountBadges = async () => {
  const wrapper = mount(Badges);
  await flushPromises();
  return wrapper;
};

describe("Badges - Tests UI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("affiche les badges", async () => {
    const wrapper = await mountBadges();

    expect(wrapper.text()).toContain("Web Developer");
    expect(wrapper.text()).toContain("DevOps Explorer");
    expect(wrapper.text()).toContain("Hackathon Participant");
  });

  it("envoie la creation d'un nouveau badge", async () => {
    const wrapper = await mountBadges();

    await wrapper.find(".primary-btn").trigger("click");
    const inputs = wrapper.findAll("input");
    await inputs[1].setValue("Backend Expert");
    await wrapper.find("textarea").setValue("Créer une API sécurisée");
    await wrapper.find(".create-btn").trigger("click");

    expect(createBadge).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Backend Expert",
        rule: "Créer une API sécurisée",
      }),
    );
  });

  it("envoie la modification d'un badge", async () => {
    const wrapper = await mountBadges();
    const webBadgeCard = wrapper
      .findAll(".badge-card")
      .find((card) => card.text().includes("Web Developer"));

    await webBadgeCard.find(".edit-btn").trigger("click");
    await wrapper.findAll("input")[1].setValue("Senior Web Developer");
    await wrapper.find(".create-btn").trigger("click");

    expect(updateBadge).toHaveBeenCalledWith(
      "web",
      expect.objectContaining({ name: "Senior Web Developer" }),
    );
  });
});
