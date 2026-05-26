'use strict';

const studentActivityService = require('../services/studentActivityService');
const { success, error } = require('../utils/apiResponse');

const handleActivityError = (res, err) => {
  if (err.message === 'STUDENT_PROFILE_NOT_FOUND') {
    return error(res, 404, 'Profil étudiant introuvable.');
  }

  if (err.message === 'ACTIVITY_NOT_FOUND') {
    return error(res, 404, 'Activité introuvable.');
  }

  if (err.message === 'INVALID_ACTIVITY_TYPE') {
    return error(res, 400, "Type d'activité invalide.");
  }

  if (err.message === 'INVALID_ACTIVITY_DATE') {
    return error(res, 400, "Date d'activité invalide.");
  }

  if (err.message === 'ACTIVITY_TITLE_REQUIRED') {
    return error(res, 400, "Le titre de l'activité est obligatoire.");
  }

  if (err.message === 'ACTIVITY_NOT_EDITABLE') {
    return error(res, 400, "Cette activité ne peut plus être modifiée.");
  }

  if (err.message === 'ACTIVITY_NOT_SUBMITTABLE') {
    return error(res, 400, "Cette activité ne peut pas être soumise.");
  }

  if (err.message === 'ACTIVITY_CERTIFICATE_REQUIRED') {
    return error(res, 400, 'Ajoutez une attestation avant la soumission.');
  }

  if (err.message === 'ACTIVITY_CERTIFICATE_UPLOAD_EMPTY') {
    return error(res, 400, 'Ajoutez une attestation.');
  }

  if (err.message === 'ACTIVITY_CERTIFICATE_FILE_NOT_FOUND') {
    return error(res, 404, 'Attestation introuvable.');
  }

  return null;
};

exports.listActivities = async (req, res, next) => {
  try {
    const activities = await studentActivityService.listActivities(req.user.userId);
    return success(res, 200, 'Activités chargées.', activities);
  } catch (err) {
    if (handleActivityError(res, err)) return;
    next(err);
  }
};

exports.getActivityById = async (req, res, next) => {
  try {
    const activity = await studentActivityService.getActivityById(
      req.user.userId,
      req.params.activityId,
    );
    return success(res, 200, 'Activité chargée.', activity);
  } catch (err) {
    if (handleActivityError(res, err)) return;
    next(err);
  }
};

exports.createActivity = async (req, res, next) => {
  try {
    let activity = await studentActivityService.createActivity(req.user.userId, req.body);

    if (req.file) {
      activity = await studentActivityService.uploadActivityCertificate(
        req.user.userId,
        activity.id,
        req.file,
      );
    }

    return success(res, 201, 'Activité créée.', activity);
  } catch (err) {
    if (handleActivityError(res, err)) return;
    next(err);
  }
};

exports.updateActivity = async (req, res, next) => {
  try {
    let activity = await studentActivityService.updateActivity(
      req.user.userId,
      req.params.activityId,
      req.body,
    );

    if (req.file) {
      activity = await studentActivityService.uploadActivityCertificate(
        req.user.userId,
        req.params.activityId,
        req.file,
      );
    }

    return success(res, 200, 'Activité mise à jour.', activity);
  } catch (err) {
    if (handleActivityError(res, err)) return;
    next(err);
  }
};

exports.deleteActivity = async (req, res, next) => {
  try {
    const result = await studentActivityService.deleteActivity(
      req.user.userId,
      req.params.activityId,
    );
    return success(res, 200, 'Activité supprimée.', result);
  } catch (err) {
    if (handleActivityError(res, err)) return;
    next(err);
  }
};

exports.submitActivityValidation = async (req, res, next) => {
  try {
    const activity = await studentActivityService.submitActivityValidation(
      req.user.userId,
      req.params.activityId,
    );
    return success(res, 200, 'Activité soumise à la validation.', activity);
  } catch (err) {
    if (handleActivityError(res, err)) return;
    next(err);
  }
};

exports.uploadActivityCertificate = async (req, res, next) => {
  try {
    const activity = await studentActivityService.uploadActivityCertificate(
      req.user.userId,
      req.params.activityId,
      req.file,
    );
    return success(res, 201, 'Attestation ajoutée.', activity);
  } catch (err) {
    if (handleActivityError(res, err)) return;
    next(err);
  }
};

exports.downloadActivityCertificate = async (req, res, next) => {
  try {
    const certificate = await studentActivityService.getActivityCertificateFile(
      req.user.userId,
      req.params.activityId,
    );

    return res.download(certificate.absolutePath, certificate.downloadName, (err) => {
      if (err) next(err);
    });
  } catch (err) {
    if (handleActivityError(res, err)) return;
    next(err);
  }
};
