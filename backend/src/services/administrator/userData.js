'use strict';

const prisma = require('../../config/prisma');
const { buildProfessionalProfileData } = require('./userHelpers');
const { userSelect } = require('./serviceSelects');
const { safeAggregateCount } = require('./serviceUtils');

const buildUserSearch = (search) => {
  if (!search) {
    return undefined;
  }

  return [
    { firstName: { contains: search, mode: 'insensitive' } },
    { lastName: { contains: search, mode: 'insensitive' } },
    { email: { contains: search, mode: 'insensitive' } },
    {
      professional: {
        is: {
          company: { contains: search, mode: 'insensitive' },
        },
      },
    },
  ];
};

const getUserOrThrow = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: userSelect,
  });

  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }

  return user;
};

const deleteCurrentProfile = async (tx, user) => {
  if (user.student) {
    await tx.student.delete({ where: { userId: user.id } });
  } else if (user.professor) {
    await tx.professor.delete({ where: { userId: user.id } });
  } else if (user.administrator) {
    await tx.administrator.delete({ where: { userId: user.id } });
  } else if (user.professional) {
    await tx.professional.delete({ where: { userId: user.id } });
  }
};

const ensureRoleChangeAllowed = async (user) => {
  if (user.role === 'STUDENT' && user.student) {
    const relatedCount = await safeAggregateCount(async () => {
      const [projectCount, internshipCount, activityCount, pathCount, skillCount, letterCount, recommendationCount] =
        await Promise.all([
          prisma.project.count({ where: { studentId: user.student.id } }),
          prisma.internship.count({ where: { studentId: user.student.id } }),
          prisma.extracurricularActivity.count({ where: { studentId: user.student.id } }),
          prisma.academicPath.count({ where: { studentId: user.student.id } }),
          prisma.studentSkill.count({ where: { studentId: user.student.id } }),
          prisma.recommendationLetter.count({ where: { studentId: user.student.id } }),
          prisma.recommendation.count({ where: { studentId: user.student.id } }),
        ]);

      return (
        projectCount + internshipCount + activityCount + pathCount + skillCount + letterCount + recommendationCount
      );
    });

    if (relatedCount > 0) {
      throw new Error('ROLE_CHANGE_BLOCKED_BY_RELATED_DATA');
    }
  }

  if (user.role === 'PROFESSOR' && user.professor) {
    const relatedCount = await safeAggregateCount(async () => {
      const [projectValidationCount, internshipValidationCount, supervisedInternshipCount] = await Promise.all([
        prisma.projectValidation.count({ where: { professorId: user.professor.id } }),
        prisma.internshipValidation.count({ where: { professorId: user.professor.id } }),
        prisma.internship.count({ where: { supervisorProfessorId: user.professor.id } }),
      ]);

      return projectValidationCount + internshipValidationCount + supervisedInternshipCount;
    });

    if (relatedCount > 0) {
      throw new Error('ROLE_CHANGE_BLOCKED_BY_RELATED_DATA');
    }
  }

  if (user.role === 'ADMINISTRATOR' && user.administrator) {
    const relatedCount = await safeAggregateCount(async () => {
      const [certificateValidationCount, approvedCount, rejectedCount, suspendedCount] = await Promise.all([
        prisma.certificateValidation.count({ where: { administratorId: user.administrator.id } }),
        prisma.professional.count({ where: { approvedByAdministratorId: user.administrator.id } }),
        prisma.professional.count({ where: { rejectedByAdministratorId: user.administrator.id } }),
        prisma.professional.count({ where: { suspendedByAdministratorId: user.administrator.id } }),
      ]);

      return certificateValidationCount + approvedCount + rejectedCount + suspendedCount;
    });

    if (relatedCount > 0) {
      throw new Error('ROLE_CHANGE_BLOCKED_BY_RELATED_DATA');
    }
  }
};

const createProfileForRole = async (tx, userId, role, payload, accountStatus) => {
  switch (role) {
    case 'STUDENT':
      if (!payload.major || !payload.level) {
        throw new Error('MISSING_STUDENT_FIELDS');
      }

      await tx.student.create({
        data: {
          userId,
          apogeeCode: payload.apogeeCode || null,
          cne: payload.cne || null,
          major: payload.major,
          level: payload.level,
          city: payload.city || null,
          bio: payload.bio || null,
          linkedinUrl: payload.linkedinUrl || null,
        },
      });
      return;

    case 'PROFESSOR':
      await tx.professor.create({
        data: {
          userId,
          employeeId: payload.employeeId || null,
          grade: payload.grade || null,
          specialty: payload.specialty || null,
          department: payload.department || null,
        },
      });
      return;

    case 'ADMINISTRATOR':
      await tx.administrator.create({
        data: {
          userId,
          employeeId: payload.employeeId || null,
          department: payload.department || null,
          adminLevel: payload.adminLevel || null,
        },
      });
      return;

    case 'PROFESSIONAL':
      await tx.professional.create({
        data: {
          userId,
          ...buildProfessionalProfileData(payload, accountStatus),
        },
      });
      return;

    default:
      throw new Error('INVALID_ROLE');
  }
};

module.exports = {
  buildUserSearch,
  createProfileForRole,
  deleteCurrentProfile,
  ensureRoleChangeAllowed,
  getUserOrThrow,
};
