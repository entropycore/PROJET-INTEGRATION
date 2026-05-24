'use strict';

const prisma = require('../../config/prisma');
const { getStudentOrThrow } = require('./studentData');

const safeNumber = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
};

const DOMAIN_RECOMMENDATIONS = {
  web: ['Vue.js', 'React', 'JavaScript'],
  backend: ['Node.js', 'Express.js', 'PostgreSQL'],
  devops: ['Docker', 'GitHub Actions', 'CI/CD'],
  security: ['JWT', 'OWASP', 'Secure API'],
  'ai-data': ['Python', 'Machine Learning', 'Data Analysis'],
  mobile: ['React Native', 'Flutter'],
};

const clampScore = (value) => Math.max(0, Math.min(100, safeNumber(value)));

const buildSuggestion = (domain) => {
  const recommendedSkills = DOMAIN_RECOMMENDATIONS[domain.slug] || [];
  const examples = recommendedSkills.slice(0, 2).join(' ou ');
  const message = examples
    ? `Ajoutez une compétence comme ${examples} pour améliorer ce profil.`
    : 'Ajoutez une compétence technique pour améliorer ce profil.';

  return {
    domain: domain.name,
    title: `Renforcer le domaine ${domain.name}`,
    message,
    recommendedSkills,
  };
};

const mapSkillDomain = (domain) => {
  if (!domain) return null;

  return {
    id: domain.id,
    name: domain.name,
    slug: domain.slug,
  };
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
      domain: mapSkillDomain(studentSkill.skill.domain),
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

const getStudentSkillStats = async (userId) => {
  const student = await getStudentOrThrow(userId);
  const [domains, studentSkills] = await Promise.all([
    prisma.skillDomain.findMany({
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        slug: true,
      },
    }),
    prisma.studentSkill.findMany({
      where: {
        studentId: student.id,
        skill: {
          type: 'TECHNICAL',
        },
      },
      orderBy: [{ updatedAt: 'desc' }],
      select: {
        id: true,
        masteryLevel: true,
        skill: {
          select: {
            id: true,
            name: true,
            domain: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    }),
  ]);

  const statsByDomain = new Map();
  domains.forEach((domain) => {
    statsByDomain.set(domain.id, {
      id: domain.id,
      name: domain.name,
      slug: domain.slug,
      score: 0,
      skillsCount: 0,
      totalScore: 0,
    });
  });

  let otherDomain = null;

  studentSkills.forEach((studentSkill) => {
    const score = clampScore(studentSkill.masteryLevel);
    const domain = studentSkill.skill.domain;

    let domainStats = domain ? statsByDomain.get(domain.id) : null;
    if (!domainStats) {
      if (!otherDomain) {
        otherDomain = {
          id: null,
          name: 'Autre',
          slug: 'other',
          score: 0,
          skillsCount: 0,
          totalScore: 0,
        };
      }
      domainStats = otherDomain;
    }

    domainStats.skillsCount += 1;
    domainStats.totalScore += score;
  });

  const domainsStats = Array.from(statsByDomain.values());
  if (otherDomain && otherDomain.skillsCount > 0) {
    domainsStats.push(otherDomain);
  }

  const domainsResult = domainsStats.map((domain) => ({
    id: domain.id,
    name: domain.name,
    slug: domain.slug,
    score: domain.skillsCount > 0 ? Math.round(domain.totalScore / domain.skillsCount) : 0,
    skillsCount: domain.skillsCount,
  }));

  const topSkills = studentSkills
    .map((studentSkill) => ({
      studentSkillId: studentSkill.id,
      skillId: studentSkill.skill.id,
      name: studentSkill.skill.name,
      domain: mapSkillDomain(studentSkill.skill.domain),
      score: clampScore(studentSkill.masteryLevel),
    }))
    .sort((first, second) => second.score - first.score)
    .slice(0, 5);

  const suggestions = domainsResult
    .filter((domain) => domain.slug !== 'other' && domain.skillsCount === 0)
    .slice(0, 3)
    .map(buildSuggestion);

  return {
    domains: domainsResult,
    topSkills,
    suggestions,
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
      domain: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    take: 30,
  });

module.exports = {
  addStudentSkill,
  addStudentSoftSkill,
  deleteStudentSkill,
  deleteStudentSoftSkill,
  getStudentSkillStats,
  getStudentSkills,
  getStudentSoftSkills,
  listSkillsCatalog,
};
