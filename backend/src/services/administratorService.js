'use strict';

const prisma = require('../config/prisma');

const USER_ROLES = ['STUDENT', 'PROFESSOR', 'ADMINISTRATOR', 'PROFESSIONAL'];
const ACCOUNT_STATUSES = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING'];

const professionalRequestSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  role: true,
  accountStatus: true,
  createdAt: true,
  professional: {
    select: {
      id: true,
      company: true,
      jobTitle: true,
      sector: true,
      bio: true,
      isVerified: true,
      isEmailVerified: true,
    },
  },
};

const userListSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
  accountStatus: true,
  createdAt: true,
  student: {
    select: {
      id: true,
      major: true,
      level: true,
    },
  },
  professor: {
    select: {
      id: true,
      employeeId: true,
      department: true,
      specialty: true,
    },
  },
  administrator: {
    select: {
      id: true,
      employeeId: true,
      department: true,
      adminLevel: true,
    },
  },
  professional: {
    select: {
      id: true,
      company: true,
      jobTitle: true,
      isVerified: true,
      isEmailVerified: true,
    },
  },
};

const buildSearchClause = (search) => {
  if (!search) {
    return [];
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
    {
      professional: {
        is: {
          jobTitle: { contains: search, mode: 'insensitive' },
        },
      },
    },
  ];
};

const buildPagination = (page, limit, total) => ({
  page,
  limit,
  total,
  totalPages: Math.max(1, Math.ceil(total / limit)),
});

const formatFullName = (firstName, lastName) => `${firstName} ${lastName}`.trim();

const getRoleDetails = (user) => {
  if (user.student) {
    return {
      profileType: 'student',
      major: user.student.major,
      level: user.student.level,
    };
  }

  if (user.professor) {
    return {
      profileType: 'professor',
      employeeId: user.professor.employeeId,
      department: user.professor.department,
      specialty: user.professor.specialty,
    };
  }

  if (user.administrator) {
    return {
      profileType: 'administrator',
      employeeId: user.administrator.employeeId,
      department: user.administrator.department,
      adminLevel: user.administrator.adminLevel,
    };
  }

  if (user.professional) {
    return {
      profileType: 'professional',
      company: user.professional.company,
      jobTitle: user.professional.jobTitle,
      isVerified: user.professional.isVerified,
      isEmailVerified: user.professional.isEmailVerified,
    };
  }

  return { profileType: null };
};

const getProfessionalRequestOrThrow = async (userId) => {
  const request = await prisma.user.findFirst({
    where: {
      id: userId,
      role: 'PROFESSIONAL',
    },
    select: professionalRequestSelect,
  });

  if (!request || !request.professional) {
    throw new Error('PROFESSIONAL_REQUEST_NOT_FOUND');
  }

  return request;
};

exports.getDashboardData = async () => {
  const [
    totalUsers,
    totalStudents,
    totalProfessors,
    pendingRequests,
    recentProfessionalRequests,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.user.count({ where: { role: 'PROFESSOR' } }),
    prisma.user.count({
      where: {
        role: 'PROFESSIONAL',
        accountStatus: 'PENDING',
      },
    }),
    prisma.user.findMany({
      where: { role: 'PROFESSIONAL' },
      select: professionalRequestSelect,
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  return {
    summaryCards: {
      totalUsers: { value: totalUsers, variation: 'Total comptes' },
      totalStudents: { value: totalStudents, variation: 'Profils etudiants' },
      totalProfessors: { value: totalProfessors, variation: 'Profils professeurs' },
      pendingRequests: { value: pendingRequests, variation: 'Demandes professionnelles' },
    },
    urgentActions: {
      pendingAccessRequests: pendingRequests,
      pendingValidations: 0,
      reports: 0,
    },
    recentRequests: recentProfessionalRequests.map((request) => ({
      id: request.id,
      type: 'ACCESS_REQUEST',
      label: "Demande d'acces",
      requesterName: formatFullName(request.firstName, request.lastName),
      email: request.email,
      organization: request.professional.company,
      createdAt: request.createdAt,
      status: request.accountStatus,
      tone: request.accountStatus === 'PENDING' ? 'orange' : 'green',
      raw: {
        phone: request.phone,
        company: request.professional.company,
        jobTitle: request.professional.jobTitle,
        sector: request.professional.sector,
        bio: request.professional.bio,
        isVerified: request.professional.isVerified,
        isEmailVerified: request.professional.isEmailVerified,
      },
    })),
  };
};

exports.getAdministratorProfile = async (userId) => {
  return prisma.administrator.findUnique({
    where: { userId },
    select: {
      id: true,
      employeeId: true,
      department: true,
      adminLevel: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true,
          accountStatus: true,
          createdAt: true,
        },
      },
    },
  });
};

exports.listUsers = async ({ role, status, search, page, limit }) => {
  if (role && !USER_ROLES.includes(role)) {
    throw new Error('INVALID_ROLE_FILTER');
  }

  if (status && !ACCOUNT_STATUSES.includes(status)) {
    throw new Error('INVALID_STATUS_FILTER');
  }

  const where = {
    ...(role ? { role } : {}),
    ...(status ? { accountStatus: status } : {}),
    ...(search ? { OR: buildSearchClause(search) } : {}),
  };

  const skip = (page - 1) * limit;

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select: userListSelect,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
  ]);

  return {
    items: users.map((user) => ({
      id: user.id,
      fullName: formatFullName(user.firstName, user.lastName),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      accountStatus: user.accountStatus,
      createdAt: user.createdAt,
      roleDetails: getRoleDetails(user),
    })),
    pagination: buildPagination(page, limit, total),
  };
};

exports.getUserDetails = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: userListSelect,
  });

  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: formatFullName(user.firstName, user.lastName),
    email: user.email,
    role: user.role,
    accountStatus: user.accountStatus,
    createdAt: user.createdAt,
    roleDetails: getRoleDetails(user),
  };
};

exports.listProfessionalRequests = async ({ status, emailVerified, search, page, limit }) => {
  if (status && !ACCOUNT_STATUSES.includes(status)) {
    throw new Error('INVALID_STATUS_FILTER');
  }

  const where = {
    role: 'PROFESSIONAL',
    ...(status ? { accountStatus: status } : {}),
    professional:
      emailVerified === undefined
        ? { isNot: null }
        : {
            is: {
              isEmailVerified: emailVerified,
            },
          },
    ...(search ? { OR: buildSearchClause(search) } : {}),
  };

  const skip = (page - 1) * limit;

  const [total, requests] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select: professionalRequestSelect,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
  ]);

  return {
    items: requests.map((request) => ({
      id: request.id,
      fullName: formatFullName(request.firstName, request.lastName),
      firstName: request.firstName,
      lastName: request.lastName,
      email: request.email,
      phone: request.phone,
      accountStatus: request.accountStatus,
      createdAt: request.createdAt,
      professional: request.professional,
    })),
    pagination: buildPagination(page, limit, total),
  };
};

exports.getProfessionalRequest = async (userId) => {
  const request = await getProfessionalRequestOrThrow(userId);

  return {
    id: request.id,
    fullName: formatFullName(request.firstName, request.lastName),
    firstName: request.firstName,
    lastName: request.lastName,
    email: request.email,
    phone: request.phone,
    accountStatus: request.accountStatus,
    createdAt: request.createdAt,
    professional: request.professional,
  };
};

exports.approveProfessionalRequest = async (userId) => {
  const request = await getProfessionalRequestOrThrow(userId);

  if (!request.professional.isEmailVerified) {
    throw new Error('EMAIL_NOT_VERIFIED');
  }

  if (request.accountStatus === 'ACTIVE' && request.professional.isVerified) {
    throw new Error('REQUEST_ALREADY_APPROVED');
  }

  await prisma.$transaction([
    prisma.professional.update({
      where: { id: request.professional.id },
      data: { isVerified: true },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { accountStatus: 'ACTIVE' },
    }),
  ]);

  return exports.getProfessionalRequest(userId);
};

exports.rejectProfessionalRequest = async (userId) => {
  const request = await getProfessionalRequestOrThrow(userId);

  await prisma.$transaction([
    prisma.professional.update({
      where: { id: request.professional.id },
      data: { isVerified: false },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { accountStatus: 'INACTIVE' },
    }),
  ]);

  return exports.getProfessionalRequest(userId);
};
