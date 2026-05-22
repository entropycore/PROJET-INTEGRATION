'use strict';

const prisma = require('../../config/prisma');
const { getStudentOrThrow } = require('./studentData');

const safeNumber = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getStudentSoftSkills = async (userId) => {
  const student = await getStudentOrThrow(userId);

  return student.studentSkills
    .filter((studentSkill) => studentSkill.skill.type === 'SOFT_SKILL')
    .map((studentSkill) => ({
      id: studentSkill.id,
      name: studentSkill.skill.name,
    }));
};

const addStudentSoftSkill = async (userId, payload) => {
  const student = await getStudentOrThrow(userId);
  const name = String(payload.name || '').trim();

  if (!name) {
    throw new Error('SOFT_SKILL_NAME_REQUIRED');
  }

  const skill = await prisma.skill.upsert({
    where: { name },
    update: {
      type: 'SOFT_SKILL',
    },
    create: {
      name,
      type: 'SOFT_SKILL',
    },
  });

  await prisma.studentSkill.upsert({
    where: {
      studentId_skillId: {
        studentId: student.id,
        skillId: skill.id,
      },
    },
    update: {
      updatedAt: new Date(),
    },
    create: {
      studentId: student.id,
      skillId: skill.id,
      masteryLevel: '100',
      skillSource: 'PROFILE',
    },
  });

  return getStudentSoftSkills(userId);
};

const deleteStudentSoftSkill = async (userId, studentSkillId) => {
  const student = await getStudentOrThrow(userId);
  const studentSkill = await prisma.studentSkill.findFirst({
    where: {
      id: studentSkillId,
      studentId: student.id,
      skill: {
        type: 'SOFT_SKILL',
      },
    },
  });

  if (!studentSkill) {
    throw new Error('SOFT_SKILL_NOT_FOUND');
  }

  await prisma.studentSkill.delete({
    where: { id: studentSkill.id },
  });

  return {
    deleted: true,
    id: studentSkillId,
  };
};

const getStudentSkills = async (userId) => {
  const student = await getStudentOrThrow(userId);

  return student.studentSkills
    .filter((studentSkill) => studentSkill.skill.type !== 'SOFT_SKILL')
    .map((studentSkill) => ({
      id: studentSkill.id,
      skillId: studentSkill.skill.id,
      name: studentSkill.skill.name,
      type: studentSkill.skill.type,
      level: safeNumber(studentSkill.masteryLevel),
      source: studentSkill.skillSource || '',
    }));
};

const addStudentSkill = async (userId, payload) => {
  const student = await getStudentOrThrow(userId);

  const skill = await prisma.skill.findUnique({
    where: { id: payload.skillId },
  });

  if (!skill) {
    throw new Error('SKILL_NOT_FOUND');
  }

  await prisma.studentSkill.upsert({
    where: {
      studentId_skillId: {
        studentId: student.id,
        skillId: skill.id,
      },
    },
    update: {
      masteryLevel: String(payload.level ?? 0),
      skillSource: payload.source ?? null,
      updatedAt: new Date(),
    },
    create: {
      studentId: student.id,
      skillId: skill.id,
      masteryLevel: String(payload.level ?? 0),
      skillSource: payload.source ?? null,
    },
  });

  return getStudentSkills(userId);
};

const deleteStudentSkill = async (userId, studentSkillId) => {
  const student = await getStudentOrThrow(userId);
  const studentSkill = await prisma.studentSkill.findFirst({
    where: {
      id: studentSkillId,
      studentId: student.id,
    },
  });

  if (!studentSkill) {
    throw new Error('STUDENT_SKILL_NOT_FOUND');
  }

  await prisma.studentSkill.delete({
    where: { id: studentSkill.id },
  });

  return {
    deleted: true,
    id: studentSkillId,
  };
};

const listSkillsCatalog = async (search = '') =>
  prisma.skill.findMany({
    where: {
      type: {
        not: 'SOFT_SKILL',
      },
      name: {
        contains: search,
        mode: 'insensitive',
      },
    },
    orderBy: {
      name: 'asc',
    },
    select: {
      id: true,
      name: true,
      type: true,
      description: true,
    },
    take: 30,
  });

module.exports = {
  addStudentSkill,
  addStudentSoftSkill,
  deleteStudentSkill,
  deleteStudentSoftSkill,
  getStudentSkills,
  getStudentSoftSkills,
  listSkillsCatalog,
};
