'use strict';

const { success } = require('../utils/apiResponse');
const prisma = require('../config/prisma');


exports.getDashboard = (req, res) => {
  return success(
    res,
    200,
    'Acces autorise a l espace etudiant',
    {
      area: 'student',
      user: req.user,
    }
  );
};

exports.getProfile = (req, res) => {
  return success(
    res,
    200,
    'Profil etudiant accessible',
    {
      user: req.user,
    }
  );
};

exports.getActivities = async (req, res, next) => {
  try {
    const activities = await prisma.extracurricularActivity.findMany({
      where: {
        studentId: req.user.roleId,
      },
      select: {
        id: true,
        type: true,
        title: true,
        description: true,
        organization: true,
        startDate: true,
        endDate: true,
        visibility: true,
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    return success(res, 200, 'Activites parascolaires recuperees avec succes', {
      activities,
    });
  } catch (err) {
    next(err);
  }
};
exports.getSkillsByCategory = async (req, res, next) => {
  try {
    const studentSkills = await prisma.studentSkill.findMany({
      where: {
        studentId: req.user.roleId,
      },
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
    });

    const groupedSkills = studentSkills.reduce((groups, studentSkill) => {
      const category = studentSkill.skill.type;

      if (!groups[category]) {
        groups[category] = {
          category,
          count: 0,
          skills: [],
        };
      }

      groups[category].count += 1;
      groups[category].skills.push({
        id: studentSkill.skill.id,
        name: studentSkill.skill.name,
        description: studentSkill.skill.description,
        masteryLevel: studentSkill.masteryLevel,
        skillSource: studentSkill.skillSource,
        updatedAt: studentSkill.updatedAt,
      });

      return groups;
    }, {});

    return success(res, 200, 'Competences regroupees par categorie', {
      categories: Object.values(groupedSkills),
    });
  } catch (err) {
    next(err);
  }
};