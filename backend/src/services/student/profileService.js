'use strict';

const prisma = require('../../config/prisma');
const { formatFullName, mapStudentProfile } = require('./dashboardHelpers');
const { getStudentOrThrow } = require('./studentData');
const {
  deleteProfilePicture,
  getStoragePathFromUrl,
  storeProfilePicture,
} = require('./profilePictureStorage');

const getStudentProfile = async (userId) => mapStudentProfile(await getStudentOrThrow(userId));

const getStudentProfileCompat = async (userId) => {
  const student = await getStudentOrThrow(userId);

  return {
    id: student.user.id,
    studentId: student.id,
    firstName: student.user.firstName,
    lastName: student.user.lastName,
    fullName: formatFullName(student.user),
    email: student.user.email,
    phone: student.user.phone || '',
    field: student.major,
    major: student.major,
    level: student.level,
    city: student.city || '',
    bio: student.bio || '',
    linkedinUrl: student.linkedinUrl || '',
    profilePicture: student.user.profilePicture,
    apogeeCode: student.apogeeCode,
    cne: student.cne,
    careerGoal: student.careerObjective || '',
    address: student.address || '',
    birthDate: student.birthDate,
  };
};

const updateStudentProfileCompat = async (userId, payload) => {
  const student = await getStudentOrThrow(userId);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: student.user.id },
      data: {
        firstName: payload.firstName ?? student.user.firstName,
        lastName: payload.lastName ?? student.user.lastName,
        phone: payload.phone ?? student.user.phone,
      },
    }),
    prisma.student.update({
      where: { id: student.id },
      data: {
        city: payload.city ?? student.city,
        bio: payload.bio ?? student.bio,
        linkedinUrl: payload.linkedinUrl ?? student.linkedinUrl,
        major: payload.field ?? payload.major ?? student.major,
        level: payload.level ?? student.level,
        careerObjective: payload.careerGoal ?? payload.careerObjective ?? student.careerObjective,
      },
    }),
  ]);

  return getStudentProfileCompat(userId);
};

const getStudentCareerGoal = async (userId) => {
  const student = await getStudentOrThrow(userId);

  return {
    careerGoal: student.careerObjective || '',
  };
};

const updateStudentCareerGoal = async (userId, payload) => {
  const student = await getStudentOrThrow(userId);

  await prisma.student.update({
    where: { id: student.id },
    data: {
      careerObjective: payload.careerGoal ?? payload.careerObjective ?? '',
    },
  });

  return getStudentCareerGoal(userId);
};

const updateStudentProfilePicture = async (userId, file) => {
  if (!file) {
    throw new Error('PROFILE_PICTURE_UPLOAD_EMPTY');
  }

  const student = await getStudentOrThrow(userId);
  const oldStoragePath = getStoragePathFromUrl(student.user.profilePicture);
  const storedFile = await storeProfilePicture(file);

  try {
    await prisma.user.update({
      where: { id: student.user.id },
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
  getStudentCareerGoal,
  getStudentProfile,
  getStudentProfileCompat,
  updateStudentProfilePicture,
  updateStudentCareerGoal,
  updateStudentProfileCompat,
};
