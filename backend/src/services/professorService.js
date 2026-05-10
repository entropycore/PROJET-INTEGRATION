'use strict';

const prisma = require('../config/prisma');

const professorProfileSelect = {
  id: true,
  userId: true,
  employeeId: true,
  grade: true,
  specialty: true,
  department: true,
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
  supervisedInternships: {
    orderBy: [{ endDate: 'desc' }, { startDate: 'desc' }],
    take: 5,
    select: {
      id: true,
      hostOrganization: true,
      duration: true,
      startDate: true,
      endDate: true,
      validationStatus: true,
      student: {
        select: {
          id: true,
          major: true,
          level: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
    },
  },
  projectValidations: {
    orderBy: [{ decisionDate: 'desc' }],
    take: 5,
    select: {
      id: true,
      decision: true,
      comment: true,
      professorFeedback: true,
      decisionDate: true,
      project: {
        select: {
          id: true,
          title: true,
          validationStatus: true,
          student: {
            select: {
              id: true,
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  },
  internshipValidations: {
    orderBy: [{ decisionDate: 'desc' }],
    take: 5,
    select: {
      id: true,
      decision: true,
      comment: true,
      decisionDate: true,
      internship: {
        select: {
          id: true,
          hostOrganization: true,
          validationStatus: true,
          student: {
            select: {
              id: true,
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  },
};

const professorDashboardSelect = {
  id: true,
  userId: true,
  grade: true,
  specialty: true,
  department: true,
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
  supervisedInternships: {
    orderBy: [{ endDate: 'desc' }, { startDate: 'desc' }],
    take: 3,
    select: {
      id: true,
      hostOrganization: true,
      validationStatus: true,
      startDate: true,
      endDate: true,
      student: {
        select: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  },
  projectValidations: {
    orderBy: [{ decisionDate: 'desc' }],
    take: 3,
    select: {
      id: true,
      decision: true,
      decisionDate: true,
      project: {
        select: {
          id: true,
          title: true,
          student: {
            select: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      },
    },
  },
  internshipValidations: {
    orderBy: [{ decisionDate: 'desc' }],
    take: 3,
    select: {
      id: true,
      decision: true,
      decisionDate: true,
      internship: {
        select: {
          id: true,
          hostOrganization: true,
          student: {
            select: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      },
    },
  },
};

const formatFullName = (user) => `${user.firstName} ${user.lastName}`.trim();

const mapUserSummary = (user) => ({
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  fullName: formatFullName(user),
  email: user.email,
  phone: user.phone,
  profilePicture: user.profilePicture,
  accountStatus: user.accountStatus,
  createdAt: user.createdAt,
  lastLoginAt: user.lastLoginAt,
});

const mapProfessorProfile = (professor) => ({
  user: mapUserSummary(professor.user),
  profile: {
    id: professor.id,
    userId: professor.userId,
    employeeId: professor.employeeId,
    grade: professor.grade,
    specialty: professor.specialty,
    department: professor.department,
  },
  supervisedInternships: professor.supervisedInternships.map((internship) => ({
    id: internship.id,
    hostOrganization: internship.hostOrganization,
    duration: internship.duration,
    startDate: internship.startDate,
    endDate: internship.endDate,
    validationStatus: internship.validationStatus,
    student: internship.student?.user
      ? {
          id: internship.student.user.id,
          fullName: formatFullName(internship.student.user),
          email: internship.student.user.email,
          major: internship.student.major,
          level: internship.student.level,
        }
      : null,
  })),
  recentProjectValidations: professor.projectValidations.map((validation) => ({
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
  })),
  recentInternshipValidations: professor.internshipValidations.map((validation) => ({
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
  })),
});

const getProfessorOrThrow = async (userId) => {
  const professor = await prisma.professor.findUnique({
    where: { userId },
    select: professorProfileSelect,
  });

  if (!professor) {
    throw new Error('PROFESSOR_PROFILE_NOT_FOUND');
  }

  return professor;
};

exports.getProfessorProfile = async (userId) =>
  mapProfessorProfile(await getProfessorOrThrow(userId));

const getProfessorDashboardBaseOrThrow = async (userId) => {
  const professor = await prisma.professor.findUnique({
    where: { userId },
    select: professorDashboardSelect,
  });

  if (!professor) {
    throw new Error('PROFESSOR_PROFILE_NOT_FOUND');
  }

  return professor;
};

exports.getProfessorDashboard = async (userId) => {
  const professor = await getProfessorDashboardBaseOrThrow(userId);

  const [
    supervisedInternshipsCount,
    pendingSupervisedInternshipsCount,
    pendingProjectsCount,
    pendingInternshipsCount,
    completedProjectReviewsCount,
    completedInternshipReviewsCount,
    recentPendingProjects,
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
      where: { validationStatus: 'PENDING' },
    }),
    prisma.internship.count({
      where: { validationStatus: 'PENDING' },
    }),
    prisma.projectValidation.count({
      where: { professorId: professor.id },
    }),
    prisma.internshipValidation.count({
      where: { professorId: professor.id },
    }),
    prisma.project.findMany({
      where: { validationStatus: 'PENDING' },
      orderBy: [{ submittedAt: 'desc' }, { createdAt: 'desc' }],
      take: 3,
      select: {
        id: true,
        title: true,
        type: true,
        submittedAt: true,
        createdAt: true,
        student: {
          select: {
            major: true,
            level: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    }),
  ]);

  const recentReviewActivity = [
    ...professor.projectValidations.map((validation) => ({
      id: validation.id,
      reviewType: 'PROJECT',
      decision: validation.decision,
      decisionDate: validation.decisionDate,
      label: validation.project?.title || 'Projet',
      studentName: validation.project?.student?.user
        ? formatFullName(validation.project.student.user)
        : null,
    })),
    ...professor.internshipValidations.map((validation) => ({
      id: validation.id,
      reviewType: 'INTERNSHIP',
      decision: validation.decision,
      decisionDate: validation.decisionDate,
      label: validation.internship?.hostOrganization || 'Stage',
      studentName: validation.internship?.student?.user
        ? formatFullName(validation.internship.student.user)
        : null,
    })),
  ]
    .sort((left, right) => new Date(right.decisionDate).getTime() - new Date(left.decisionDate).getTime())
    .slice(0, 5);

  return {
    profileSnapshot: {
      id: professor.user.id,
      fullName: formatFullName(professor.user),
      email: professor.user.email,
      profilePicture: professor.user.profilePicture,
      accountStatus: professor.user.accountStatus,
      lastLoginAt: professor.user.lastLoginAt,
      grade: professor.grade,
      specialty: professor.specialty,
      department: professor.department,
    },
    summaryCards: {
      pendingProjects: { value: pendingProjectsCount, label: 'Projets a valider' },
      pendingInternships: { value: pendingInternshipsCount, label: 'Stages a valider' },
      supervisedInternships: { value: supervisedInternshipsCount, label: 'Stages supervises' },
      pendingSupervisedInternships: {
        value: pendingSupervisedInternshipsCount,
        label: 'Stages supervises en attente',
      },
      completedProjectReviews: { value: completedProjectReviewsCount, label: 'Avis projet rendus' },
      completedInternshipReviews: {
        value: completedInternshipReviewsCount,
        label: 'Avis stage rendus',
      },
    },
    recentPendingProjects: recentPendingProjects.map((project) => ({
      id: project.id,
      title: project.title,
      type: project.type,
      submittedAt: project.submittedAt,
      createdAt: project.createdAt,
      studentName: project.student?.user ? formatFullName(project.student.user) : null,
      studentMajor: project.student?.major || null,
      studentLevel: project.student?.level || null,
    })),
    supervisedInternships: professor.supervisedInternships.map((internship) => ({
      id: internship.id,
      hostOrganization: internship.hostOrganization,
      validationStatus: internship.validationStatus,
      startDate: internship.startDate,
      endDate: internship.endDate,
      studentName: internship.student?.user ? formatFullName(internship.student.user) : null,
    })),
    recentReviewActivity,
  };
};
