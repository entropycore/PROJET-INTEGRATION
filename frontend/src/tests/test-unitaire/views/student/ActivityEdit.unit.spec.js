import { describe, it, expect } from "vitest";

describe("EditActivity Unit Tests", () => {
  const buildActivityPayload = (payload) => {
    const activityPayload = { ...payload };

    delete activityPayload.certificate;
    delete activityPayload.certificateName;
    delete activityPayload.certificateUrl;

    return activityPayload;
  };

  it("should remove certificate fields from payload", () => {
    const payload = {
      title: "Hackathon",
      description: "Activity description",
      certificate: {},
      certificateName: "certificate.pdf",
      certificateUrl: "/uploads/certificate.pdf",
    };

    const result = buildActivityPayload(payload);

    expect(result).toEqual({
      title: "Hackathon",
      description: "Activity description",
    });
  });
});