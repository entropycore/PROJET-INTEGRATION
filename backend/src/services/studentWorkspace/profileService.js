'use strict';

const {
  bcrypt,
  crypto,
  prisma,
  VALID_VISIBILITIES,
  VALID_RECOMMENDATION_STATUSES,
  VALID_PROJECT_TYPES,
  VALID_ACTIVITY_TYPES,
  serviceError,
  toEnum,
  toDate,
  normalizePreferences,
  requireBoolean,
  fromRecommendationUiStatus,
  getStudentOrThrow,
  ensureProjectOwner,
  ensureInternshipOwner,
  ensureActivityOwner,
  projectInclude,
  internshipInclude,
  activityInclude,
  fullName,
  recommendationInclude,
  mapStudentRecommendation,
  mapProject,
  mapInternship,
  mapInternshipMedia,
  mapActivity,
  syncTechnologies,
} = require('./shared');

exports.getStudentProfile = async (userId) => getStudentOrThrow(userId);

exports.updateStudentProfile = async (userId, payload) => {
  const student = await getStudentOrThrow(userId);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        firstName: payload.firstName,
        lastName: payload.lastName,
        phone: payload.phone,
        profilePicture: payload.profilePicture,
      },
    }),
    prisma.student.update({
      where: { id: student.id },
      data: {
        major: payload.major,
        level: payload.level,
        birthDate: payload.birthDate ? toDate(payload.birthDate) : undefined,
        address: payload.address,
        city: payload.city,
        bio: payload.bio,
        careerObjective: payload.careerObjective,
        linkedinUrl: payload.linkedinUrl,
      },
    }),
  ]);
  return getStudentOrThrow(userId);
};

exports.listAcademicPaths = async (userId) => {
  const student = await getStudentOrThrow(userId);
  return prisma.academicPath.findMany({
    where: { studentId: student.id },
    orderBy: [{ endDate: 'desc' }, { startDate: 'desc' }],
  });
};

exports.createAcademicPath = async (userId, payload) => {
  const student = await getStudentOrThrow(userId);
  return prisma.academicPath.create({
    data: {
      studentId: student.id,
      institution: payload.institution,
      degree: payload.degree,
      major: payload.major || null,
      startDate: toDate(payload.startDate),
      endDate: toDate(payload.endDate),
      honor: payload.honor || null,
    },
  });
};

exports.updateAcademicPath = async (userId, id, payload) => {
  const student = await getStudentOrThrow(userId);
  await prisma.academicPath.updateMany({
    where: { id, studentId: student.id },
    data: {
      institution: payload.institution,
      degree: payload.degree,
      major: payload.major,
      startDate: payload.startDate ? toDate(payload.startDate) : undefined,
      endDate: payload.endDate ? toDate(payload.endDate) : undefined,
      honor: payload.honor,
    },
  });
  return prisma.academicPath.findFirst({ where: { id, studentId: student.id } });
};

exports.deleteAcademicPath = async (userId, id) => {
  const student = await getStudentOrThrow(userId);
  await prisma.academicPath.deleteMany({ where: { id, studentId: student.id } });
  return { deleted: true, id };
};
