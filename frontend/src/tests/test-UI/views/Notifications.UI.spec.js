import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Validations from "@/views/admin/Validations.vue";

vi.mock("vue-router", () => ({
  useRoute: () => ({ query: {} }),
}));

const validations = [
  {
    id: 1,
    title: "Projet web",
    targetType: "PROJECT",
    status: "PENDING",
    student: { fullName: "Yassine K.", email: "yassine@example.com" },
    createdAt: "2026-05-20T10:00:00.000Z",
  },
  {
    id: 2,
    title: "Stage",
    targetType: "INTERNSHIP",
    status: "PENDING",
    student: { fullName: "Sara B.", email: "sara@example.com" },
    createdAt: "2026-05-20T11:00:00.000Z",
  },
  {
    id: 3,
    title: "Certificat",
    targetType: "CERTIFICATE",
    status: "PENDING",
    student: { fullName: "Imane T.", email: "imane@example.com" },
    createdAt: "2026-05-20T12:00:00.000Z",
  },
  {
    id: 4,
    title: "Activite",
    targetType: "ACTIVITY",
    status: "PENDING",
    student: { fullName: "Nora A.", email: "nora@example.com" },
    createdAt: "2026-05-20T13:00:00.000Z",
  },
];

vi.mock("@/services/adminValidationsApi", () => ({
  getPendingValidations: vi.fn(() => Promise.resolve({ items: validations })),
  getPendingValidationsCount: vi.fn(() =>
    Promise.resolve({ count: 4, projects: 1, internships: 1, certificates: 1, activities: 1 }),
  ),
  getValidationDetails: vi.fn((id) =>
    Promise.resolve(validations.find((validation) => validation.id === id)),
  ),
  approveValidation: vi.fn(() => Promise.resolve()),
  rejectValidation: vi.fn(() => Promise.resolve()),
  requestValidationChanges: vi.fn(() => Promise.resolve()),
}));

vi.mock("@/components/admin/validations/ValidationToolbar.vue", () => ({
  default: {
    props: ["search"],
    emits: ["update:search"],
    template:
      '<input class="search-input-mock" :value="search" @input="$emit(\'update:search\', $event.target.value)" />',
  },
}));

vi.mock("@/components/admin/validations/ValidationStats.vue", () => ({
  default: { template: '<div class="stats-mock"></div>' },
}));

vi.mock("@/components/admin/validations/ValidationDetailsModal.vue", () => ({
  default: { props: ["validation"], template: '<div class="modal-mock"></div>' },
}));

vi.mock("@/components/admin/validations/ValidationsTable.vue", () => ({
  default: {
    props: ["validations"],
    template: `
      <div class="table-mock">
        <span class="row-count">{{ validations.length }}</span>
        <button v-if="validations.length" class="view-btn-mock" @click="$emit('view', validations[0])">Voir</button>
      </div>
    `,
  },
}));

const mountValidations = async () => {
  const wrapper = mount(Validations);
  await flushPromises();
  return wrapper;
};

describe("Validations.vue - Tests UI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("filtre les validations via la barre de recherche", async () => {
    const wrapper = await mountValidations();

    expect(wrapper.find(".row-count").text()).toBe("4");

    const input = wrapper.find(".search-input-mock");
    await input.setValue("Yassine");
    await wrapper.vm.$nextTick();

    expect(wrapper.find(".row-count").text()).toBe("1");
  });

  it("ouvre la modale de details lors du clic sur voir", async () => {
    const wrapper = await mountValidations();

    await wrapper.find(".view-btn-mock").trigger("click");
    await flushPromises();

    expect(wrapper.find(".modal-mock").exists()).toBe(true);
    expect(wrapper.vm.selectedValidation.id).toBe(1);
  });
});
