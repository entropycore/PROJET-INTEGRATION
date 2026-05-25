'use strict';

const {
  bcrypt,
  crypto,
  prisma,
  VALID_VISIBILITIES,
  VALID_RECOMMENDATION_STATUSES,
  VALID_PROJECT_TYPES,
  VALID_ACTIVITY_TYPES,
  serviceError,
  toEnum,
  toDate,
  normalizePreferences,
  requireBoolean,
  fromRecommendationUiStatus,
  getStudentOrThrow,
  ensureProjectOwner,
  ensureInternshipOwner,
  ensureActivityOwner,
  projectInclude,
  internshipInclude,
  activityInclude,
  fullName,
  recommendationInclude,
  mapStudentRecommendation,
  mapProject,
  mapInternship,
  mapInternshipMedia,
  mapActivity,
  syncTechnologies,
} = require('./shared');

exports.listSkillsCatalog = async (search = '') =>
  prisma.skill.findMany({
    where: search
      ? { name: { contains: search, mode: 'insensitive' } }
      : undefined,
    include: { domain: true },
    orderBy: { name: 'asc' },
    take: 50,
  });

exports.listStudentSkills = async (userId, type = null) => {
  const student = await getStudentOrThrow(userId);
  const skills = await prisma.studentSkill.findMany({
    where: {
      studentId: student.id,
      ...(type ? { skill: { type } } : {}),
    },
    include: { skill: { include: { domain: true } } },
    orderBy: { updatedAt: 'desc' },
  });
  return skills.map((item) => ({
    id: item.id,
    masteryLevel: item.masteryLevel,
    skillSource: item.skillSource,
    skill: item.skill,
    name: item.skill.name,
    type: item.skill.type,
  }));
};

exports.addStudentSkill = async (userId, payload, forcedType = null) => {
  const student = await getStudentOrThrow(userId);
  const name = String(payload.name || payload.skillName || '').trim();
  if (!name) throw serviceError('SKILL_NAME_REQUIRED', 400);

  const skill = await prisma.skill.upsert({
    where: { name },
    update: {},
    create: {
      name,
      type: forcedType || toEnum(payload.type, 'TECHNICAL', new Set(['TECHNICAL', 'SOFT_SKILL'])),
      description: payload.description || null,
    },
  });

  return prisma.studentSkill.upsert({
    where: { studentId_skillId: { studentId: student.id, skillId: skill.id } },
    update: {
      masteryLevel: payload.masteryLevel || payload.level || null,
      skillSource: payload.skillSource || null,
    },
    create: {
      studentId: student.id,
      skillId: skill.id,
      masteryLevel: payload.masteryLevel || payload.level || null,
      skillSource: payload.skillSource || null,
    },
    include: { skill: true },
  });
};

exports.deleteStudentSkill = async (userId, id) => {
  const student = await getStudentOrThrow(userId);
  await prisma.studentSkill.deleteMany({ where: { id, studentId: student.id } });
  return { deleted: true, id };
};

exports.getSkillStats = async (userId) => {
  const skills = await exports.listStudentSkills(userId);
  return {
    total: skills.length,
    technical: skills.filter((item) => item.type === 'TECHNICAL').length,
    soft: skills.filter((item) => item.type === 'SOFT_SKILL').length,
  };
};

exports.getCareerGoal = async (userId) => {
  const student = await getStudentOrThrow(userId);
  return { careerObjective: student.careerObjective };
};

exports.updateCareerGoal = async (userId, payload) => {
  const student = await getStudentOrThrow(userId);
  return prisma.student.update({
    where: { id: student.id },
    data: { careerObjective: payload.careerObjective || payload.goal || null },
  });
};
