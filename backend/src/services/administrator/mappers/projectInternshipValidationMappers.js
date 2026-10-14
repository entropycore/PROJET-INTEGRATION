'use strict';

const { formatFullName } = require('./userMappers');

const mapProjectValidationItem = (project) => {
  const studentUser = project.student?.user;

  return {
    id: project.id,
    type: 'PROJECT',
    label: 'Project validation',
    requesterName: studentUser ? formatFullName(studentUser) : 'Étudiant inconnu',
    email: studentUser?.email || null,
    organization: null,
    createdAt: project.submittedAt || project.createdAt,
    tone: 'green',
    status: project.validationStatus,
    raw: {
      title: project.title,
      description: project.description,
      projectType: project.type,
      teamRole: project.teamRole,
      githubUrl: project.githubUrl,
      youtubeUrl: project.youtubeUrl,
      result: project.result,
      generalFeedback: project.generalFeedback,
      submittedAt: project.submittedAt,
      createdAt: project.createdAt,
      visibility: project.visibility,
      student: project.student,
      technologies: project.technologies,
      media: project.media,
    },
  };
};

const mapInternshipValidationItem = (internship) => {
  const studentUser = internship.student?.user;

  return {
    id: internship.id,
    type: 'INTERNSHIP',
    label: 'Internship validation',
    requesterName: studentUser ? formatFullName(studentUser) : 'Étudiant inconnu',
    email: studentUser?.email || null,
    organization: internship.hostOrganization || null,
    createdAt: internship.startDate || internship.endDate || null,
    tone: 'green',
    status: internship.validationStatus,
    raw: {
      title: internship.hostOrganization ? `Stage - ${internship.hostOrganization}` : 'Stage',
      description: internship.missions || null,
      hostOrganization: internship.hostOrganization,
      duration: internship.duration,
      startDate: internship.startDate,
      endDate: internship.endDate,
      missions: internship.missions,
      reportUrl: internship.reportUrl,
      reportFileName: internship.reportFileName,
      reportMimeType: internship.reportMimeType,
      reportFileSize: internship.reportFileSize,
      visibility: internship.visibility,
      student: internship.student,
      supervisorProfessor: internship.supervisorProfessor,
      technologies: internship.technologies,
    },
  };
};

module.exports = {
  mapInternshipValidationItem,
  mapProjectValidationItem,
};
