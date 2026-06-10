import {
  recommendationLetters,
  rejectRecommendationLetter,
  saveRecommendationLetterDraft,
  sendRecommendationLetter,
} from "@/mockData/studentRecommendationLetters.store";

const wait = (value) =>
  new Promise((resolve) => {
    window.setTimeout(() => resolve(value), 120);
  });

export const getProfessorRecommendationLetters = async () =>
  wait([...recommendationLetters.value]);

export const saveProfessorRecommendationLetterDraft = async (id, content) =>
  wait(saveRecommendationLetterDraft(id, content));

export const sendProfessorRecommendationLetter = async (id, content) =>
  wait(sendRecommendationLetter(id, content));

export const rejectProfessorRecommendationLetter = async (id, reason) =>
  wait(rejectRecommendationLetter(id, reason));
