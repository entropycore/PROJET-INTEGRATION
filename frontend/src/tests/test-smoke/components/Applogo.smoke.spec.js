import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import AppLogo from "@/components/AppLogo.vue";

<<<<<<< HEAD
describe('AppLogo - Test de fumee', () => {
  it('se monte et rend le logo', () => {
    const wrapper = mount(AppLogo)
=======
describe("AppLogo - Smoke", () => {
  it("se monte et rend le logo", () => {
    const wrapper = mount(AppLogo);
>>>>>>> 3dce0a3e27749bbf804690e5e1c08da883d1e98c

    expect(wrapper.find("img.app-logo").exists()).toBe(true);
    expect(wrapper.find("img").attributes("alt")).toBe("ValiDia logo");
  });
});
