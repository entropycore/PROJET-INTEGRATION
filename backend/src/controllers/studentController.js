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