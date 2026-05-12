'use strict';

const { success } = require('../utils/apiResponse');

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


const studentService = require('../services/studentService');

exports.updateProfile = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const updateData = req.body;

    const updatedStudent = await studentService.updateStudentProfile(studentId, updateData);

    res.status(200).json({
      success: true,
      message: 'Profil mis à jour avec succès',
      data: updatedStudent
    });
  } catch (error) {
    if (error.message === 'Student not found') {
      return res.status(404).json({ success: false, message: 'Étudiant non trouvé' });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};
