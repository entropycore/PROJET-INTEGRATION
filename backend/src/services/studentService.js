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
