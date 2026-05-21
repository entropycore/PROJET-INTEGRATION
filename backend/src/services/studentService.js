'use strict';

const prisma = require('../config/prisma');

const studentProfileSelect = {
  id: true,
  userId: true,
  apogeeCode: true,
  cne: true,
  major: true,
  level: true,
  birthDate: true,
  address: true,
  city: true,
  bio: true,
  careerObjective: true,
  linkedinUrl: true,
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      profilePicture: true,
      accountStatus: true,
      createdAt: true,
      lastLoginAt: true,
    },
  },
  academicPaths: {
    orderBy: [{ endDate: 'desc' }, { startDate: 'desc' }],
    select: {
      id: true,
      institution: true,
      degree: true,
      major: true,
      startDate: true,
      endDate: true,
      honor: true,
    },
  },
  studentSkills: {
    orderBy: [{ updatedAt: 'desc' }],
    select: {
      id: true,
      masteryLevel: true,
      skillSource: true,
      updatedAt: true,
      skill: {
        select: {
          id: true,
          name: true,
          type: true,
          description: true,
        },
      },
    },
  },
  portfolio: {
    select: {
      id: true,
      title: true,
      publicSlug: true,
      description: true,
      visibility: true,
      status: true,
      targetDomain: true,
      generatedAt: true,
      updatedAt: true,
    },
  },
};

const studentDashboardSelect = {
  id: true,
  userId: true,
  major: true,
  level: true,
  city: true,
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      profilePicture: true,
      accountStatus: true,
      lastLoginAt: true,
    },
  },
  portfolio: {
    select: {
      id: true,
      title: true,
      publicSlug: true,
      visibility: true,
      status: true,
      targetDomain: true,
      updatedAt: true,
    },
  },
  projects: {
    orderBy: [{ submittedAt: 'desc' }, { createdAt: 'desc' }],
    take: 3,
    select: {
      id: true,
      title: true,
      type: true,
      validationStatus: true,
      visibility: true,
      createdAt: true,
      submittedAt: true,
    },
  },
  internships: {
    orderBy: [{ endDate: 'desc' }, { startDate: 'desc' }],
    take: 3,
    select: {
      id: true,
      hostOrganization: true,
      validationStatus: true,
      visibility: true,
      startDate: true,
      endDate: true,
    },
  },
  activities: {
    orderBy: [{ endDate: 'desc' }, { startDate: 'desc' }],
    take: 3,
    select: {
      id: true,
      title: true,
      type: true,
      organization: true,
      visibility: true,
      startDate: true,
      endDate: true,
    },
  },
};

const formatFullName = (user) => `${user.firstName} ${user.lastName}`.trim();

const mapStudentProfile = (student) => ({
  user: {
    id: student.user.id,
    firstName: student.user.firstName,
    lastName: student.user.lastName,
    fullName: formatFullName(student.user),
    email: student.user.email,
    phone: student.user.phone,
    profilePicture: student.user.profilePicture,
    accountStatus: student.user.accountStatus,
    createdAt: student.user.createdAt,
    lastLoginAt: student.user.lastLoginAt,
  },
  profile: {
    id: student.id,
    userId: student.userId,
    apogeeCode: student.apogeeCode,
    cne: student.cne,
    major: student.major,
    level: student.level,
    birthDate: student.birthDate,
    address: student.address,
    city: student.city,
    bio: student.bio,
    careerObjective: student.careerObjective,
    linkedinUrl: student.linkedinUrl,
  },
  academicPaths: student.academicPaths,
  skills: student.studentSkills.map((studentSkill) => ({
    id: studentSkill.id,
    masteryLevel: studentSkill.masteryLevel,
    skillSource: studentSkill.skillSource,
    updatedAt: studentSkill.updatedAt,
    skill: studentSkill.skill,
  })),
  portfolio: student.portfolio,
});

const getStudentOrThrow = async (userId) => {
  const student = await prisma.student.findUnique({
    where: { userId },
    select: studentProfileSelect,
  });

  if (!student) {
    throw new Error('STUDENT_PROFILE_NOT_FOUND');
  }

  return student;
};

exports.getStudentProfile = async (userId) => mapStudentProfile(await getStudentOrThrow(userId));

const getStudentDashboardBaseOrThrow = async (userId) => {
  const student = await prisma.student.findUnique({
    where: { userId },
    select: studentDashboardSelect,
  });

  if (!student) {
    throw new Error('STUDENT_PROFILE_NOT_FOUND');
  }

  return student;
};

exports.getStudentDashboard = async (userId) => {
  const student = await getStudentDashboardBaseOrThrow(userId);

  const [
    projectCount,
    internshipCount,
    activityCount,
    certificateCount,
    recommendationLetterCount,
    recommendationCount,
    pendingProjectCount,
    pendingInternshipCount,
    pendingCertificateCount,
    pendingRecommendationLetterCount,
    pendingRecommendationCount,
  ] = await Promise.all([
    prisma.project.count({ where: { studentId: student.id } }),
    prisma.internship.count({ where: { studentId: student.id } }),
    prisma.extracurricularActivity.count({ where: { studentId: student.id } }),
    prisma.certificate.count({
      where: {
        activity: {
          studentId: student.id,
        },
      },
    }),
    prisma.recommendationLetter.count({ where: { studentId: student.id } }),
    prisma.recommendation.count({ where: { studentId: student.id } }),
    prisma.project.count({
      where: {
        studentId: student.id,
        validationStatus: 'PENDING',
      },
    }),
    prisma.internship.count({
      where: {
        studentId: student.id,
        validationStatus: 'PENDING',
      },
    }),
    prisma.certificate.count({
      where: {
        validationStatus: 'PENDING',
        activity: {
          studentId: student.id,
        },
      },
    }),
    prisma.recommendationLetter.count({
      where: {
        studentId: student.id,
        validationStatus: 'PENDING',
      },
    }),
    prisma.recommendation.count({
      where: {
        studentId: student.id,
        status: 'PENDING',
      },
    }),
  ]);

  return {
    profileSnapshot: {
      id: student.user.id,
      fullName: formatFullName(student.user),
      email: student.user.email,
      profilePicture: student.user.profilePicture,
      accountStatus: student.user.accountStatus,
      lastLoginAt: student.user.lastLoginAt,
      major: student.major,
      level: student.level,
      city: student.city,
    },
    summaryCards: {
      projects: { value: projectCount, label: 'Projets' },
      internships: { value: internshipCount, label: 'Stages' },
      activities: { value: activityCount, label: 'Activites' },
      certificates: { value: certificateCount, label: 'Certificats' },
      recommendationLetters: { value: recommendationLetterCount, label: 'Lettres de recommandation' },
      recommendations: { value: recommendationCount, label: 'Recommandations' },
    },
    validationOverview: {
      pendingProjects: pendingProjectCount,
      pendingInternships: pendingInternshipCount,
      pendingCertificates: pendingCertificateCount,
      pendingRecommendationLetters: pendingRecommendationLetterCount,
      pendingRecommendations: pendingRecommendationCount,
    },
    portfolio: student.portfolio,
    recentItems: {
      projects: student.projects,
      internships: student.internships,
      activities: student.activities,
    },
  };
};
