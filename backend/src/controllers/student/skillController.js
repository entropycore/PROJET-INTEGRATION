'use strict';

const studentSkillService = require('../../services/student/skillService');
const { handleStudentError } = require('../studentHelpers');
const { success } = require('../../utils/apiResponse');

exports.getSoftSkills = async (req, res, next) => {
  try {
    const softSkills = await studentSkillService.getStudentSoftSkills(req.user.userId);
    return success(res, 200, 'Compétences comportementales chargées.', softSkills);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.addSoftSkill = async (req, res, next) => {
  try {
    const softSkills = await studentSkillService.addStudentSoftSkill(
      req.user.userId,
      req.body,
    );
    return success(res, 201, 'Compétence comportementale ajoutée.', softSkills);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.deleteSoftSkill = async (req, res, next) => {
  try {
    const result = await studentSkillService.deleteStudentSoftSkill(
      req.user.userId,
      req.params.studentSkillId,
    );
    return success(res, 200, 'Compétence comportementale supprimée.', result);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.getSkills = async (req, res, next) => {
  try {
    const skills = await studentSkillService.getStudentSkills(req.user.userId);
    return success(res, 200, 'Compétences étudiantes chargées.', skills);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.addSkill = async (req, res, next) => {
  try {
    const skills = await studentSkillService.addStudentSkill(req.user.userId, req.body);
    return success(res, 201, 'Compétence ajoutée.', skills);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.deleteSkill = async (req, res, next) => {
  try {
    const result = await studentSkillService.deleteStudentSkill(
      req.user.userId,
      req.params.studentSkillId,
    );
    return success(res, 200, 'Compétence supprimée.', result);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};

exports.listSkillsCatalog = async (req, res, next) => {
  try {
    const skills = await studentSkillService.listSkillsCatalog(req.query.search || '');
    return success(res, 200, 'Catalogue des compétences chargé.', skills);
  } catch (err) {
    if (handleStudentError(res, err)) return;
    next(err);
  }
};
