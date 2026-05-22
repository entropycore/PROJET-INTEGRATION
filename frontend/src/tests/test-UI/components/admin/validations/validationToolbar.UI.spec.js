import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import ValidationToolbar from "@/components/admin/validations/ValidationToolbar.vue";

describe("ValidationToolbar - Tests UI", () => {
  it("initialise les champs avec les props", () => {
    const wrapper = mount(ValidationToolbar, {
      props: {
        search: "Projet",
        selectedType: "PROJECT",
        selectedStatus: "PENDING",
      },
    });

    expect(wrapper.find("input").element.value).toBe("Projet");
    expect(wrapper.findAll("select")[0].element.value).toBe("PROJECT");
    expect(wrapper.findAll("select")[1].element.value).toBe("PENDING");
  });

  it("emet les mises a jour des filtres", async () => {
    const wrapper = mount(ValidationToolbar);

    await wrapper.find("input").setValue("Yassine");
    await wrapper.findAll("select")[0].setValue("CERTIFICATE");
    await wrapper.findAll("select")[1].setValue("APPROVED");

    expect(wrapper.emitted("update:search")[0][0]).toBe("Yassine");
    expect(wrapper.emitted("update:selectedType")[0][0]).toBe("CERTIFICATE");
    expect(wrapper.emitted("update:selectedStatus")[0][0]).toBe("APPROVED");
  });
});
