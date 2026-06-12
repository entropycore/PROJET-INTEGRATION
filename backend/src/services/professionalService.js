'use strict';

const prisma = require('../config/prisma');
const {
  deleteProfilePicture,
  getStoragePathFromUrl,
  storeProfilePicture,
} = require('./student/profilePictureStorage');

const professionalProfileSelect = {
  id: true,
  userId: true,
  company: true,
  jobTitle: true,
  sector: true,
  bio: true,
  isVerified: true,
  isEmailVerified: true,
  emailVerifyExpires: true,
  emailVerifiedAt: true,
  approvedAt: true,
  rejectedAt: true,
  rejectionReason: true,
  suspendedAt: true,
  suspensionReason: true,
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
  approvedByAdministrator: {
    select: {
      id: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  },
  rejectedByAdministrator: {
    select: {
      id: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  },
  suspendedByAdministrator: {
    select: {
      id: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  },
};

const formatFullName = (user) => `${user.firstName} ${user.lastName}`.trim();

const mapAdministratorSummary = (administrator) => {
  if (!administrator?.user) {
    return null;
  }

  return {
    id: administrator.id,
    fullName: formatFullName(administrator.user),
    email: administrator.user.email,
  };
};

const mapProfessionalProfile = (professional) => ({
  user: {
    id: professional.user.id,
    firstName: professional.user.firstName,
    lastName: professional.user.lastName,
    fullName: formatFullName(professional.user),
    email: professional.user.email,
    phone: professional.user.phone,
    profilePicture: professional.user.profilePicture,
    accountStatus: professional.user.accountStatus,
    createdAt: professional.user.createdAt,
    lastLoginAt: professional.user.lastLoginAt,
  },
  profile: {
    id: professional.id,
    userId: professional.userId,
    company: professional.company,
    jobTitle: professional.jobTitle,
    sector: professional.sector,
    bio: professional.bio,
    isVerified: professional.isVerified,
    isEmailVerified: professional.isEmailVerified,
    emailVerifyExpires: professional.emailVerifyExpires,
    emailVerifiedAt: professional.emailVerifiedAt,
    approvedAt: professional.approvedAt,
    approvedByAdministrator: mapAdministratorSummary(professional.approvedByAdministrator),
    rejectedAt: professional.rejectedAt,
    rejectedByAdministrator: mapAdministratorSummary(professional.rejectedByAdministrator),
    rejectionReason: professional.rejectionReason,
    suspendedAt: professional.suspendedAt,
    suspendedByAdministrator: mapAdministratorSummary(professional.suspendedByAdministrator),
    suspensionReason: professional.suspensionReason,
  },
});

const inferProfessionalState = (professional) => {
  if (professional.user.accountStatus === 'SUSPENDED' || professional.suspendedAt) {
    return 'SUSPENDED';
  }

  if (professional.rejectedAt || professional.user.accountStatus === 'INACTIVE') {
    return 'REJECTED';
  }

  if (professional.isVerified || professional.approvedAt || professional.user.accountStatus === 'ACTIVE') {
    return 'APPROVED';
  }

  return 'PENDING';
};

const getProfessionalOrThrow = async (userId) => {
  const professional = await prisma.professional.findUnique({
    where: { userId },
    select: professionalProfileSelect,
  });

  if (!professional) {
    throw new Error('PROFESSIONAL_PROFILE_NOT_FOUND');
  }

  return professional;
};

const cleanString = (value) => {
  if (value === undefined) return undefined;

  const normalized = String(value || '').trim();
  return normalized || null;
};

const mapPublicProfile = (portfolio) => {
  const student = portfolio.student;
  const skills = student.studentSkills.map((item) => item.skill.name);
  const projects = student.projects || [];
  const internships = student.internships || [];

  return {
    id: portfolio.id,
    title: portfolio.title,
    publicSlug: portfolio.publicSlug,
    description: portfolio.description || '',
    targetDomain: portfolio.targetDomain || student.careerObjective || '',
    generatedAt: portfolio.generatedAt,
    updatedAt: portfolio.updatedAt,
    student: {
      id: student.id,
      fullName: formatFullName(student.user),
      email: student.user.email,
      profilePicture: student.user.profilePicture || '',
      major: student.major,
      level: student.level,
      city: student.city || '',
      bio: student.bio || '',
      linkedinUrl: student.linkedinUrl || '',
    },
    skills,
    highlights: {
      projectsCount: projects.length,
      internshipsCount: internships.length,
      recommendationsCount:
        student.recommendations.length + student.recommendationLetters.length,
      latestProjects: projects.slice(0, 3).map((project) => ({
        id: project.id,
        title: project.title,
        technologies: project.technologies.map((item) => item.technology.name),
      })),
      latestInternships: internships.slice(0, 2).map((internship) => ({
        id: internship.id,
        title: internship.hostOrganization || 'Stage',
        company: internship.hostOrganization || '',
      })),
    },
  };
};

exports.getProfessionalProfile = async (userId) =>
  mapProfessionalProfile(await getProfessionalOrThrow(userId));

exports.updateProfessionalProfile = async (userId, payload = {}) => {
  const professional = await getProfessionalOrThrow(userId);
  const userData = {};
  const profileData = {};

  ['firstName', 'lastName', 'phone'].forEach((field) => {
    const value = cleanString(payload[field]);

    if (value !== undefined) {
      userData[field] = value;
    }
  });

  ['company', 'jobTitle', 'sector', 'bio'].forEach((field) => {
    const value = cleanString(payload[field]);

    if (value !== undefined) {
      profileData[field] = value;
    }
  });

  await prisma.$transaction([
    Object.keys(userData).length
      ? prisma.user.update({
          where: { id: professional.user.id },
          data: userData,
        })
      : prisma.user.findUnique({ where: { id: professional.user.id }, select: { id: true } }),
    Object.keys(profileData).length
      ? prisma.professional.update({
          where: { id: professional.id },
          data: profileData,
        })
      : prisma.professional.findUnique({ where: { id: professional.id }, select: { id: true } }),
  ]);

  return exports.getProfessionalProfile(userId);
};

exports.updateProfessionalProfilePicture = async (userId, file) => {
  if (!file) {
    throw new Error('PROFILE_PICTURE_UPLOAD_EMPTY');
  }

  const professional = await getProfessionalOrThrow(userId);
  const oldStoragePath = getStoragePathFromUrl(professional.user.profilePicture);
  const storedFile = await storeProfilePicture(file);

  try {
    await prisma.user.update({
      where: { id: professional.user.id },
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

exports.listPublicProfiles = async (filters = {}) => {
  const query = String(filters.q || '').trim();
  const domain = String(filters.domain || '').trim();
  const take = Math.min(Math.max(Number(filters.limit) || 24, 1), 50);

  const where = {
    status: 'ACTIVE',
    visibility: {
      not: 'PRIVATE',
    },
    ...(domain
      ? {
          targetDomain: {
            contains: domain,
            mode: 'insensitive',
          },
        }
      : {}),
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { targetDomain: { contains: query, mode: 'insensitive' } },
            {
              student: {
                is: {
                  major: { contains: query, mode: 'insensitive' },
                },
              },
            },
            {
              student: {
                is: {
                  user: {
                    is: {
                      firstName: { contains: query, mode: 'insensitive' },
                    },
                  },
                },
              },
            },
            {
              student: {
                is: {
                  user: {
                    is: {
                      lastName: { contains: query, mode: 'insensitive' },
                    },
                  },
                },
              },
            },
          ],
        }
      : {}),
  };

  const portfolios = await prisma.portfolio.findMany({
    where,
    orderBy: [{ updatedAt: 'desc' }, { generatedAt: 'desc' }],
    take,
    select: {
      id: true,
      title: true,
      publicSlug: true,
      description: true,
      targetDomain: true,
      generatedAt: true,
      updatedAt: true,
      student: {
        select: {
          id: true,
          major: true,
          level: true,
          city: true,
          bio: true,
          careerObjective: true,
          linkedinUrl: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              profilePicture: true,
            },
          },
          studentSkills: {
            orderBy: { updatedAt: 'desc' },
            take: 8,
            select: {
              skill: {
                select: {
                  name: true,
                },
              },
            },
          },
          projects: {
            where: { validationStatus: 'APPROVED' },
            orderBy: [{ submittedAt: 'desc' }, { createdAt: 'desc' }],
            take: 6,
            select: {
              id: true,
              title: true,
              technologies: {
                take: 4,
                select: {
                  technology: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
          internships: {
            where: { validationStatus: 'APPROVED' },
            orderBy: [{ endDate: 'desc' }, { startDate: 'desc' }],
            take: 4,
            select: {
              id: true,
              hostOrganization: true,
            },
          },
          recommendations: {
            where: { status: 'APPROVED' },
            select: { id: true },
          },
          recommendationLetters: {
            where: { validationStatus: 'APPROVED' },
            select: { id: true },
          },
        },
      },
    },
  });

  return {
    items: portfolios.map(mapPublicProfile),
    count: portfolios.length,
  };
};

exports.getProfessionalDashboard = async (userId) => {
  const professional = await getProfessionalOrThrow(userId);

  const completionFields = [
    professional.company,
    professional.jobTitle,
    professional.sector,
    professional.bio,
    professional.user.phone,
  ];
  const completedFields = completionFields.filter((value) => Boolean(String(value || '').trim())).length;
  const profileCompletion = Math.round((completedFields / completionFields.length) * 100);
  const currentState = inferProfessionalState(professional);

  const timeline = [
    {
      type: 'ACCOUNT_CREATED',
      label: 'Compte créé',
      date: professional.user.createdAt,
      actor: null,
      details: null,
    },
    professional.emailVerifiedAt
      ? {
          type: 'EMAIL_VERIFIED',
          label: 'Email vérifié',
          date: professional.emailVerifiedAt,
          actor: null,
          details: null,
        }
      : null,
    professional.approvedAt
      ? {
          type: 'ACCOUNT_APPROVED',
          label: 'Compte approuve',
          date: professional.approvedAt,
          actor: mapAdministratorSummary(professional.approvedByAdministrator),
          details: null,
        }
      : null,
    professional.rejectedAt
      ? {
          type: 'ACCOUNT_REJECTED',
          label: 'Compte rejete',
          date: professional.rejectedAt,
          actor: mapAdministratorSummary(professional.rejectedByAdministrator),
          details: professional.rejectionReason,
        }
      : null,
    professional.suspendedAt
      ? {
          type: 'ACCOUNT_SUSPENDED',
          label: 'Compte suspendu',
          date: professional.suspendedAt,
          actor: mapAdministratorSummary(professional.suspendedByAdministrator),
          details: professional.suspensionReason,
        }
      : null,
  ]
    .filter(Boolean)
    .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime());

  return {
    profileSnapshot: {
      id: professional.user.id,
      fullName: formatFullName(professional.user),
      email: professional.user.email,
      profilePicture: professional.user.profilePicture,
      company: professional.company,
      jobTitle: professional.jobTitle,
      sector: professional.sector,
      accountStatus: professional.user.accountStatus,
      currentState,
      lastLoginAt: professional.user.lastLoginAt,
    },
    summaryCards: {
      profileCompletion: { value: profileCompletion, label: 'Profil complet (%)' },
      emailVerified: { value: professional.isEmailVerified ? 1 : 0, label: 'Email vérifié' },
      adminVerified: { value: professional.isVerified ? 1 : 0, label: 'Validation admin' },
      accountSuspended: {
        value: professional.user.accountStatus === 'SUSPENDED' || professional.suspendedAt ? 1 : 0,
        label: 'Compte suspendu',
      },
    },
    accountOverview: {
      currentState,
      isEmailVerified: professional.isEmailVerified,
      emailVerifiedAt: professional.emailVerifiedAt,
      isVerified: professional.isVerified,
      approvedAt: professional.approvedAt,
      approvedByAdministrator: mapAdministratorSummary(professional.approvedByAdministrator),
      rejectedAt: professional.rejectedAt,
      rejectedByAdministrator: mapAdministratorSummary(professional.rejectedByAdministrator),
      rejectionReason: professional.rejectionReason,
      suspendedAt: professional.suspendedAt,
      suspendedByAdministrator: mapAdministratorSummary(professional.suspendedByAdministrator),
      suspensionReason: professional.suspensionReason,
    },
    timeline,
  };
};
