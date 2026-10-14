'use strict';

const prisma = require('../../config/prisma');
const { getProfessorByUserId } = require('./data');
const { formatFullName } = require('./helpers');
const { mapProfessorSnapshot, mapUserSummary } = require('./mappers');
const { professorProfileSelect } = require('./selects');
const {
  deleteProfilePicture,
  getStoragePathFromUrl,
  storeProfilePicture,
} = require('../student/profilePictureStorage');

const mapProfileInternship = (internship) => ({
  id: internship.id,
  hostOrganization: internship.hostOrganization,
  duration: internship.duration,
  startDate: internship.startDate,
  endDate: internship.endDate,
  validationStatus: internship.validationStatus,
  student: internship.student?.user
    ? {
        id: internship.student.id,
        fullName: formatFullName(internship.student.user),
        email: internship.student.user.email,
        major: internship.student.major,
        level: internship.student.level,
      }
    : null,
});

const mapProjectReview = (validation) => ({
  id: validation.id,
  decision: validation.decision,
  comment: validation.comment,
  professorFeedback: validation.professorFeedback,
  decisionDate: validation.decisionDate,
  project: validation.project
    ? {
        id: validation.project.id,
        title: validation.project.title,
        validationStatus: validation.project.validationStatus,
        studentName: validation.project.student?.user
          ? formatFullName(validation.project.student.user)
          : null,
      }
    : null,
});

const mapInternshipReview = (validation) => ({
  id: validation.id,
  decision: validation.decision,
  comment: validation.comment,
  decisionDate: validation.decisionDate,
  internship: validation.internship
    ? {
        id: validation.internship.id,
        hostOrganization: validation.internship.hostOrganization,
        validationStatus: validation.internship.validationStatus,
        studentName: validation.internship.student?.user
          ? formatFullName(validation.internship.student.user)
          : null,
      }
    : null,
});

const getProfessorProfile = async (userId) => {
  const professor = await getProfessorByUserId(userId, professorProfileSelect);

  return {
    user: mapUserSummary(professor.user),
    profile: mapProfessorSnapshot(professor),
    supervisedInternships:
      professor.supervisedInternships.map(mapProfileInternship),
    recentProjectValidations:
      professor.projectValidations.map(mapProjectReview),
    recentInternshipValidations:
      professor.internshipValidations.map(mapInternshipReview),
  };
};

const updateProfessorProfilePicture = async (userId, file) => {
  if (!file) {
    throw new Error('PROFILE_PICTURE_UPLOAD_EMPTY');
  }

  const professor = await getProfessorByUserId(userId);
  const oldStoragePath = getStoragePathFromUrl(professor.user.profilePicture);
  const storedFile = await storeProfilePicture(file);

  try {
    await prisma.user.update({
      where: { id: professor.user.id },
      data: { profilePicture: storedFile.publicUrl },
    });
  } catch (err) {
    await deleteProfilePicture(storedFile.storagePath);
    throw err;
  }

  await deleteProfilePicture(oldStoragePath);

  return {
    profilePicture: storedFile.publicUrl,
    fileName: storedFile.fileName,
    mimeType: storedFile.mimeType,
    fileSize: storedFile.fileSize,
  };
};

module.exports = {
  getProfessorProfile,
  updateProfessorProfilePicture,
};
