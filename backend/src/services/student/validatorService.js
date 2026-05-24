'use strict';

const prisma = require('../../config/prisma');

const formatFullName = (user) => `${user.firstName} ${user.lastName}`.trim();

const listStudentValidators = async () => {
  const professors = await prisma.professor.findMany({
    orderBy: [
      {
        user: {
          lastName: 'asc',
        },
      },
      {
        user: {
          firstName: 'asc',
        },
      },
    ],
    select: {
      id: true,
      department: true,
      specialty: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          profilePicture: true,
        },
      },
    },
  });

  return professors.map((professor) => ({
    id: professor.id,
    fullName: formatFullName(professor.user),
    email: professor.user.email,
    department: professor.department || '',
    specialty: professor.specialty || '',
    profilePicture: professor.user.profilePicture || '',
  }));
};

module.exports = {
  listStudentValidators,
};
