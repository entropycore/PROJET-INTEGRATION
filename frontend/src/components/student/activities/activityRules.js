export const hasActivityCertificate = (activity) => {
  return Boolean(activity?.certificateName || activity?.certificate?.id)
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
  return (
    activity?.validationStatus === 'DRAFT' &&
    hasActivityCertificate(activity)
  )
}

export const canSubmitActivityWithCertificate = (activity) => {
  return canSubmitActivity(activity)
}
