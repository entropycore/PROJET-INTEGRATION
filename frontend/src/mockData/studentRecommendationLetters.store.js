import { ref } from "vue";

import {
  recommendationLetterStudent,
  recommendationLetterTeachers,
  studentRecommendationLetters,
} from "./studentRecommendationLetters.mock";

export const recommendationLetters = ref([...studentRecommendationLetters]);
export const recommendationTeachers = ref([...recommendationLetterTeachers]);

export const addRecommendationLetter = (payload) => {
  const teacher = recommendationTeachers.value.find(
    (item) => item.id === payload.teacherId,
  );

  const letter = {
    id: `letter-${Date.now()}`,
    title: payload.title,
    requestMessage: payload.content,
    letterContent: "",
    type: payload.type,
    validationStatus: "PENDING",
    documentUrl: "",
    downloadable: false,
    createdAt: new Date().toISOString(),
    validatedAt: null,
    rejectionReason: "",
    author: teacher || {
      id: payload.teacherId,
      fullName: "Enseignant sélectionné",
      department: "",
      specialty: "",
      profilePicture: "",
    },
    validator: null,
    student: recommendationLetterStudent,
  };

  recommendationLetters.value.unshift(letter);
  return letter;
};

export const saveRecommendationLetterDraft = (letterId, content) => {
  const letter = recommendationLetters.value.find((item) => item.id === letterId);
  if (!letter) return null;

  letter.letterContent = content;
  letter.validationStatus = "DRAFT";
  letter.rejectionReason = "";
  return letter;
};

export const sendRecommendationLetter = (letterId, content) => {
  const letter = recommendationLetters.value.find((item) => item.id === letterId);
  if (!letter) return null;

  letter.letterContent = content;
  letter.validationStatus = "APPROVED";
  letter.validatedAt = new Date().toISOString();
  letter.rejectionReason = "";
  return letter;
};

export const rejectRecommendationLetter = (letterId, reason) => {
  const letter = recommendationLetters.value.find((item) => item.id === letterId);
  if (!letter) return null;

  letter.validationStatus = "REJECTED";
  letter.rejectionReason = reason;
  return letter;
};
