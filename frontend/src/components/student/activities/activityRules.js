export const hasActivityValidator = (activity) => {
  return Boolean(activity?.validatorName || activity?.validatorId)
}

export const canEditActivity = (activity) => {
  return ['DRAFT', 'CORRECTION_REQUIRED'].includes(
    activity?.validationStatus,
  )
}

export const canDeleteActivity = (activity) => {
  return ['DRAFT', 'CORRECTION_REQUIRED', 'REJECTED'].includes(
    activity?.validationStatus,
  )
}

export const canSubmitActivity = (activity) => {
  return activity?.validationStatus === 'DRAFT'
}

export const canSubmitActivityWithValidator = (activity) => {
  return canSubmitActivity(activity) && hasActivityValidator(activity)
}
