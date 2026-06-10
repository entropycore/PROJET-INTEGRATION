import {
  addRecommendationLetter,
  recommendationLetters,
  recommendationTeachers,
} from "@/mockData/studentRecommendationLetters.store";

const wait = (value) =>
  new Promise((resolve) => {
    window.setTimeout(() => resolve(value), 120);
  });

export const getStudentRecommendationLetters = async () =>
  wait([...recommendationLetters.value]);

export const createStudentRecommendationLetterRequest = async (data) =>
  wait(addRecommendationLetter(data));

export const getRecommendationLetterTeachers = async () =>
  wait([...recommendationTeachers.value]);
