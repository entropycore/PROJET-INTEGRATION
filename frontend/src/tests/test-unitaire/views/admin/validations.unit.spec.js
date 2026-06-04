import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Validations from "@/views/admin/Validations.vue";
import {
  approveValidation,
  rejectValidation,
  requestValidationChanges,
} from "@/services/adminValidationsApi";

const validations = [
  {
    id: 1,
    title: "Projet web",
    targetType: "PROJECT",
    status: "PENDING",
    student: { fullName: "Yassine K.", email: "yassine@example.com" },
  },
  {
    id: 2,
    title: "Stage",
    targetType: "INTERNSHIP",
    status: "PENDING",
    student: { fullName: "Sara B.", email: "sara@example.com" },
  },
  {
    id: 3,
    title: "Certificat",
    targetType: "CERTIFICATE",
    status: "PENDING",
    student: { fullName: "Imane T.", email: "imane@example.com" },
  },
];

vi.mock("@/services/adminValidationsApi", () => ({
  getPendingValidations: vi.fn(() => Promise.resolve({ items: validations })),
  getPendingValidationsCount: vi.fn(() =>
    Promise.resolve({ count: 3, projects: 1, internships: 1, certificates: 1, activities: 0 }),
  ),
  getValidationDetails: vi.fn((id) =>
    Promise.resolve(validations.find((validation) => validation.id === id)),
  ),
  approveValidation: vi.fn(() => Promise.resolve()),
  rejectValidation: vi.fn(() => Promise.resolve()),
  requestValidationChanges: vi.fn(() => Promise.resolve()),
}));

const mountValidations = async () => {
  const wrapper = mount(Validations, {
    global: {
      stubs: {
        ValidationStats: true,
        ValidationToolbar: true,
        ValidationsTable: true,
        ValidationDetailsModal: true,
      },
    },
  });
  await flushPromises();
  return wrapper;
};

describe("Validations.vue - Tests unitaires", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("charge les validations depuis le service", async () => {
    const wrapper = await mountValidations();

    expect(wrapper.vm.validations).toHaveLength(3);
  });

  it("handleApprove() appelle le service si l'utilisateur confirme", async () => {
    vi.spyOn(window, "confirm").mockImplementation(() => true);
    const wrapper = await mountValidations();

    await wrapper.vm.handleApprove(wrapper.vm.validations[0]);

    expect(approveValidation).toHaveBeenCalledWith(1);
  });

  it("handleReject() appelle le service si un motif est saisi", async () => {
    vi.spyOn(window, "prompt").mockImplementation(() => "Document incomplet.");
    const wrapper = await mountValidations();

    await wrapper.vm.handleReject(wrapper.vm.validations[1]);

    expect(rejectValidation).toHaveBeenCalledWith(2, {
      comment: "Document incomplet.",
    });
  });

  it("handleRequestChanges() appelle le service si un motif est fourni", async () => {
    vi.spyOn(window, "prompt").mockImplementation(() => "Merci de corriger.");
    const wrapper = await mountValidations();

    await wrapper.vm.handleRequestChanges(wrapper.vm.validations[2]);

    expect(requestValidationChanges).toHaveBeenCalledWith(3, {
      comment: "Merci de corriger.",
    });
  });
});
