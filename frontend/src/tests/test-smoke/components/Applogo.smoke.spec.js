import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import AppLogo from "@/components/AppLogo.vue";

<<<<<<< HEAD
describe("AppLogo - Test de fumee", () => {
  it("se monte et rend le logo", () => {
    const wrapper = mount(AppLogo);
=======
describe('AppLogo - Test de fumee', () => {
  it('se monte et rend le logo', () => {
    const wrapper = mount(AppLogo)
>>>>>>> f631fb1e6bf4e352d9d8ebef2ec35dbe0244a48b

    expect(wrapper.find("img.app-logo").exists()).toBe(true);
    expect(wrapper.find("img").attributes("alt")).toBe("ValiDia logo");
  });
});
