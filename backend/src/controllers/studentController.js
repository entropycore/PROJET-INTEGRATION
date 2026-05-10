'use strict';

const { success, error } = require('../utils/apiResponse');
const fs = require('fs');
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
exports.createActivity = async (req, res, next) => {
  try {
    const {
      type,
      title,
      description,
      organization,
      startDate,
      endDate,
      visibility,
    } = req.body;

    if (!type || !title) {
      if (req.file) fs.unlinkSync(req.file.path);
      return error(res, 400, 'Le type et le titre de l activite sont obligatoires');
    }

    if (!req.file) {
      return error(res, 400, 'L attestation de participation est obligatoire');
    }

    const allowedTypes = [
      'CLUB',
      'EVENT',
      'HACKATHON',
      'COMPETITION',
      'ASSOCIATIVE_ENGAGEMENT',
      'CONFERENCE',
    ];

    const allowedVisibilities = ['PUBLIC', 'PRIVATE', 'TEACHERS', 'SHARED_LINK'];

    if (!allowedTypes.includes(type)) {
      fs.unlinkSync(req.file.path);
      return error(res, 400, 'Type d activite invalide');
    }

    if (visibility && !allowedVisibilities.includes(visibility)) {
      fs.unlinkSync(req.file.path);
      return error(res, 400, 'Visibilite invalide');
    }

    const documentUrl = `/uploads/attestations/${req.file.filename}`;

    const activity = await prisma.extracurricularActivity.create({
      data: {
        studentId: req.user.roleId,
        type,
        title,
        description: description || null,
        organization: organization || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        visibility: visibility || 'PRIVATE',
        certificates: {
          create: {
            documentUrl,
          },
        },
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
        certificates: {
          select: {
            id: true,
            documentUrl: true,
            validationStatus: true,
            submittedAt: true,
          },
        },
      },
    });

    return success(res, 201, 'Activite creee avec attestation de participation', {
      activity,
    });
  } catch (err) {
    if (req.file) fs.unlinkSync(req.file.path);
    next(err);
  }
};