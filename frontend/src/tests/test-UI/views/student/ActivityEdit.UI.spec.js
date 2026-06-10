import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import EditActivity from "@/views/student/ActivityEdit.vue";

vi.mock("vue-router", () => ({
  useRoute: () => ({
    params: { id: 1 },
  }),
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe("EditActivity UI Tests", () => {
  it("displays page title", () => {
    const wrapper = mount(EditActivity);

    expect(wrapper.text()).toContain(
      "Modifier une activité"
    );
  });

  it("displays return button", () => {
    const wrapper = mount(EditActivity);

    expect(
      wrapper.find(".back-btn").exists()
    ).toBe(true);
  });

  it("displays page header", () => {
    const wrapper = mount(EditActivity);

    expect(
      wrapper.find(".page-header").exists()
    ).toBe(true);
  });

  it("has correct css class on return button", () => {
    const wrapper = mount(EditActivity);

    const button = wrapper.find(".back-btn");

    expect(button.classes()).toContain(
      "back-btn"
    );
  });

  it("shows loading state", async () => {
    const wrapper = mount(EditActivity);

    wrapper.vm.isLoading = true;

    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain(
      "Chargement..."
    );
  });

  it("shows error message", async () => {
    const wrapper = mount(EditActivity);

    wrapper.vm.errorMessage =
      "Impossible de charger cette activité.";

    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain(
      "Impossible de charger cette activité."
    );
  });
});
