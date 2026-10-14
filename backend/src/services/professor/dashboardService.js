'use strict';

const prisma = require('../../config/prisma');
const { getProfessorByUserId } = require('./data');
const { formatFullName, sortByDateDesc } = require('./helpers');
const {
  mapInternshipValidationItem,
  mapProfessorSnapshot,
  mapProjectValidationItem,
  mapReviewActivity,
  mapUserSummary,
} = require('./mappers');
const {
  professorDashboardSelect,
  professorInternshipValidationSelect,
  professorProjectValidationSelect,
} = require('./selects');

const mapSupervisedInternship = (internship) => ({
  id: internship.id,
  hostOrganization: internship.hostOrganization,
  validationStatus: internship.validationStatus,
  startDate: internship.startDate,
  endDate: internship.endDate,
  studentName: internship.student?.user
    ? formatFullName(internship.student.user)
    : null,
});

const buildRecentReviewActivity = (professor) =>
  [
    ...professor.projectValidations.map((validation) =>
      mapReviewActivity(validation, 'PROJECT'),
    ),
    ...professor.internshipValidations.map((validation) =>
      mapReviewActivity(validation, 'INTERNSHIP'),
    ),
  ]
    .sort(
      (left, right) =>
        new Date(right.decisionDate) - new Date(left.decisionDate),
    )
    .slice(0, 5);

const getProfessorDashboard = async (userId) => {
  const professor = await getProfessorByUserId(
    userId,
    professorDashboardSelect,
  );

  const [
    supervisedInternshipsCount,
    pendingSupervisedInternshipsCount,
    pendingProjectsCount,
    pendingInternshipsCount,
    completedProjectReviewsCount,
    completedInternshipReviewsCount,
    recentPendingProjects,
    recentPendingInternships,
  ] = await Promise.all([
    prisma.internship.count({
      where: { supervisorProfessorId: professor.id },
    }),
    prisma.internship.count({
      where: {
        supervisorProfessorId: professor.id,
        validationStatus: 'PENDING',
      },
    }),
    prisma.project.count({
      where: {
        validatorProfessorId: professor.id,
        validationStatus: 'PENDING',
      },
    }),
    prisma.internship.count({
      where: {
        supervisorProfessorId: professor.id,
        validationStatus: 'PENDING',
      },
    }),
    prisma.projectValidation.count({
      where: { professorId: professor.id },
    }),
    prisma.internshipValidation.count({
      where: { professorId: professor.id },
    }),
    prisma.project.findMany({
      where: {
        validatorProfessorId: professor.id,
        validationStatus: 'PENDING',
      },
      orderBy: [{ submittedAt: 'desc' }, { createdAt: 'desc' }],
      take: 3,
      select: professorProjectValidationSelect,
    }),
    prisma.internship.findMany({
      where: {
        supervisorProfessorId: professor.id,
        validationStatus: 'PENDING',
      },
      orderBy: [{ startDate: 'desc' }, { endDate: 'desc' }],
      take: 3,
      select: professorInternshipValidationSelect,
    }),
  ]);

  const pendingValidations = sortByDateDesc([
    ...recentPendingProjects.map(mapProjectValidationItem),
    ...recentPendingInternships.map(mapInternshipValidationItem),
  ]).slice(0, 5);

  return {
    area: 'professor',
    user: mapUserSummary(professor.user),
    profileSnapshot: {
      ...mapProfessorSnapshot(professor),
      fullName: formatFullName(professor.user),
      email: professor.user.email,
      profilePicture: professor.user.profilePicture,
      accountStatus: professor.user.accountStatus,
      lastLoginAt: professor.user.lastLoginAt,
    },
    summaryCards: {
      pendingProjects: {
        value: pendingProjectsCount,
        label: 'Projets à valider',
      },
      pendingInternships: {
        value: pendingInternshipsCount,
        label: 'Stages à valider',
      },
      supervisedInternships: {
        value: supervisedInternshipsCount,
        label: 'Stages supervisés',
      },
      pendingSupervisedInternships: {
        value: pendingSupervisedInternshipsCount,
        label: 'Stages supervisés en attente',
      },
      completedProjectReviews: {
        value: completedProjectReviewsCount,
        label: 'Avis projet rendus',
      },
      completedInternshipReviews: {
        value: completedInternshipReviewsCount,
        label: 'Avis stage rendus',
      },
    },
    pendingValidations,
    recentPendingProjects: recentPendingProjects.map(mapProjectValidationItem),
    recentPendingInternships: recentPendingInternships.map(
      mapInternshipValidationItem,
    ),
    supervisedInternships: professor.supervisedInternships.map(
      mapSupervisedInternship,
    ),
    recentReviewActivity: buildRecentReviewActivity(professor),
  };
};

module.exports = {
  getProfessorDashboard,
};
