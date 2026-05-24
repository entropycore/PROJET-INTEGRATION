import { ref } from "vue";

import { studentActivities as mockActivities } from "./studentActivities.mock";

export const activities = ref([...mockActivities]);

export const addActivity = (newActivity) => {
  activities.value.unshift(newActivity)
}

export const getActivityById = (activityId) => {
  return activities.value.find(
    (activity) => String(activity.id) === String(activityId),
  )
}

export const updateActivity = (updatedActivity) => {
  activities.value = activities.value.map((activity) =>
    activity.id === updatedActivity.id ? updatedActivity : activity,
  )
}

export const deleteActivity = (activityId) => {
  activities.value = activities.value.filter(
    (activity) => activity.id !== activityId,
  );
};

export const submitActivityValidation = (activityId) => {
  activities.value = activities.value.map((activity) => {
    if (activity.id !== activityId) return activity;
    if (activity.validationStatus !== 'DRAFT') return activity;

    const hasValidator = Boolean(
      activity.validator ||
        activity.validatorName ||
        activity.validatorId ||
        activity.verifiedValidator,
    )

    if (!hasValidator) return activity;

    return {
      ...activity,
      validationStatus: 'PENDING',
    }
  })
}
