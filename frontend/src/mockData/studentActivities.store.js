import { ref } from "vue";

import { studentActivities as mockActivities } from "./studentActivities.mock";

export const activities = ref([...mockActivities]);

export const addActivity = (newActivity) => {
  activities.value.unshift(newActivity);
};

export const deleteActivity = (activityId) => {
  activities.value = activities.value.filter(
    (activity) => activity.id !== activityId,
  );
};

export const submitActivityValidation = (activityId) => {
  activities.value = activities.value.map((activity) => {
    if (activity.id !== activityId) return activity;

    return {
      ...activity,
      validationStatus: "PENDING",
    };
  });
};
