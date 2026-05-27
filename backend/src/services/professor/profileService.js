'use strict';

const { getProfessorByUserId } = require('./data');
const { formatFullName } = require('./helpers');
const { mapProfessorSnapshot, mapUserSummary } = require('./mappers');
const { professorProfileSelect } = require('./selects');

const mapProfileInternship = (internship) => ({
  id: internship.id,
  hostOrganization: internship.hostOrganization,
  duration: internship.duration,
  startDate: internship.startDate,
  endDate: internship.endDate,
  validationStatus: internship.validationStatus,
  student: internship.student?.user
    ? {
        id: internship.student.id,
        fullName: formatFullName(internship.student.user),
        email: internship.student.user.email,
        major: internship.student.major,
        level: internship.student.level,
      }
    : null,
});

const mapProjectReview = (validation) => ({
  id: validation.id,
  decision: validation.decision,
  comment: validation.comment,
  professorFeedback: validation.professorFeedback,
  decisionDate: validation.decisionDate,
  project: validation.project
    ? {
        id: validation.project.id,
        title: validation.project.title,
        validationStatus: validation.project.validationStatus,
        studentName: validation.project.student?.user
          ? formatFullName(validation.project.student.user)
          : null,
      }
    : null,
});

const mapInternshipReview = (validation) => ({
  id: validation.id,
  decision: validation.decision,
  comment: validation.comment,
  decisionDate: validation.decisionDate,
  internship: validation.internship
    ? {
        id: validation.internship.id,
        hostOrganization: validation.internship.hostOrganization,
        validationStatus: validation.internship.validationStatus,
        studentName: validation.internship.student?.user
          ? formatFullName(validation.internship.student.user)
          : null,
      }
    : null,
});

const getProfessorProfile = async (userId) => {
  const professor = await getProfessorByUserId(userId, professorProfileSelect);

  return {
    user: mapUserSummary(professor.user),
    profile: mapProfessorSnapshot(professor),
    supervisedInternships:
      professor.supervisedInternships.map(mapProfileInternship),
    recentProjectValidations:
      professor.projectValidations.map(mapProjectReview),
    recentInternshipValidations:
      professor.internshipValidations.map(mapInternshipReview),
  };
};

module.exports = {
  getProfessorProfile,
};
