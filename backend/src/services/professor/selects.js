'use strict';

const professorUserSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  profilePicture: true,
  accountStatus: true,
  createdAt: true,
  lastLoginAt: true,
};

const studentSummarySelect = {
  id: true,
  apogeeCode: true,
  cne: true,
  major: true,
  level: true,
  city: true,
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      profilePicture: true,
    },
  },
};

const technologySelect = {
  technology: {
    select: {
      name: true,
      version: true,
    },
  },
};

const professorBaseSelect = {
  id: true,
  userId: true,
  employeeId: true,
  grade: true,
  specialty: true,
  department: true,
  user: {
    select: professorUserSelect,
  },
};

const professorProfileSelect = {
  ...professorBaseSelect,
  supervisedInternships: {
    orderBy: [{ endDate: 'desc' }, { startDate: 'desc' }],
    take: 5,
    select: {
      id: true,
      hostOrganization: true,
      duration: true,
      startDate: true,
      endDate: true,
      validationStatus: true,
      student: {
        select: studentSummarySelect,
      },
    },
  },
  projectValidations: {
    orderBy: [{ decisionDate: 'desc' }],
    take: 5,
    select: {
      id: true,
      decision: true,
      comment: true,
      professorFeedback: true,
      decisionDate: true,
      project: {
        select: {
          id: true,
          title: true,
          validationStatus: true,
          student: {
            select: studentSummarySelect,
          },
        },
      },
    },
  },
  internshipValidations: {
    orderBy: [{ decisionDate: 'desc' }],
    take: 5,
    select: {
      id: true,
      decision: true,
      comment: true,
      decisionDate: true,
      internship: {
        select: {
          id: true,
          hostOrganization: true,
          validationStatus: true,
          student: {
            select: studentSummarySelect,
          },
        },
      },
    },
  },
};

const professorDashboardSelect = {
  ...professorBaseSelect,
  supervisedInternships: {
    orderBy: [{ endDate: 'desc' }, { startDate: 'desc' }],
    take: 3,
    select: {
      id: true,
      hostOrganization: true,
      validationStatus: true,
      startDate: true,
      endDate: true,
      student: {
        select: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  },
  projectValidations: {
    orderBy: [{ decisionDate: 'desc' }],
    take: 3,
    select: {
      id: true,
      decision: true,
      decisionDate: true,
      project: {
        select: {
          id: true,
          title: true,
          student: {
            select: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      },
    },
  },
  internshipValidations: {
    orderBy: [{ decisionDate: 'desc' }],
    take: 3,
    select: {
      id: true,
      decision: true,
      decisionDate: true,
      internship: {
        select: {
          id: true,
          hostOrganization: true,
          student: {
            select: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      },
    },
  },
};

const professorProjectValidationSelect = {
  id: true,
  title: true,
  description: true,
  type: true,
  teamRole: true,
  teamSize: true,
  validatorProfessorId: true,
  githubUrl: true,
  youtubeUrl: true,
  result: true,
  generalFeedback: true,
  createdAt: true,
  submittedAt: true,
  validationStatus: true,
  visibility: true,
  student: {
    select: studentSummarySelect,
  },
  technologies: {
    select: technologySelect,
  },
  media: {
    orderBy: { id: 'asc' },
    select: {
      id: true,
      mediaType: true,
      mediaUrl: true,
      description: true,
      fileName: true,
      mimeType: true,
      fileSize: true,
    },
  },
};

const professorInternshipValidationSelect = {
  id: true,
  supervisorProfessorId: true,
  hostOrganization: true,
  duration: true,
  startDate: true,
  endDate: true,
  missions: true,
  reportUrl: true,
  reportFileName: true,
  reportMimeType: true,
  reportFileSize: true,
  reportStoragePath: true,
  validationStatus: true,
  visibility: true,
  student: {
    select: studentSummarySelect,
  },
  technologies: {
    select: technologySelect,
  },
  media: {
    orderBy: { id: 'asc' },
    select: {
      id: true,
      mediaType: true,
      mediaUrl: true,
      description: true,
      fileName: true,
      mimeType: true,
      fileSize: true,
    },
  },
};

module.exports = {
  professorBaseSelect,
  professorDashboardSelect,
  professorInternshipValidationSelect,
  professorProfileSelect,
  professorProjectValidationSelect,
};
