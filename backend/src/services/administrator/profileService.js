'use strict';

const prisma = require('../../config/prisma');

const getAdministratorProfile = async (userId) => {
  const profile = await prisma.administrator.findUnique({
    where: { userId },
    select: {
      id: true,
      employeeId: true,
      department: true,
      adminLevel: true,
      user: {
        select: {
          id: true,
          lastName: true,
          firstName: true,
          email: true,
          phone: true,
          profilePicture: true,
          accountStatus: true,
          createdAt: true,
          lastLoginAt: true,
        },
      },
    },
  });

  if (!profile) {
    throw new Error('ADMIN_PROFILE_NOT_FOUND');
  }

  return profile;
};

module.exports = {
  getAdministratorProfile,
};
