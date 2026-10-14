'use strict';

const recommendationLetterValidationSelect = {
  id: true,
  validationStatus: true,
  createdAt: true,
  validatedAt: true,
  rejectionReason: true,
  title: true,
  content: true,
  type: true,
  documentUrl: true,
  student: {
    select: {
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
    },
  },
  authorUser: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      profilePicture: true,
    },
  },
  validatorUser: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  },
};

const commentValidationSelect = {
  id: true,
  status: true,
  createdAt: true,
  validatedAt: true,
  rejectionReason: true,
  targetType: true,
  targetId: true,
  content: true,
  authorUser: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      profilePicture: true,
    },
  },
  validatorUser: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  },
  portfolio: {
    select: {
      id: true,
      title: true,
      publicSlug: true,
      student: {
        select: {
          id: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
    },
  },
};

const recommendationValidationSelect = {
  id: true,
  status: true,
  createdAt: true,
  validatedAt: true,
  rejectionReason: true,
  title: true,
  content: true,
  organization: true,
  authorJobTitle: true,
  recommendationType: true,
  authorUser: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      profilePicture: true,
    },
  },
  validatorUser: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  },
  student: {
    select: {
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
        },
      },
    },
  },
  portfolio: {
    select: {
      id: true,
      title: true,
      publicSlug: true,
    },
  },
};

const certificateDetailSelect = {
  id: true,
  validationStatus: true,
  submittedAt: true,
  documentUrl: true,
  fileName: true,
  mimeType: true,
  fileSize: true,
  activity: {
    select: {
      id: true,
      title: true,
      description: true,
      type: true,
      organization: true,
      startDate: true,
      endDate: true,
      student: {
        select: {
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
        },
      },
    },
  },
};

const projectValidationSelect = {
  id: true,
  title: true,
  description: true,
  type: true,
  teamRole: true,
  githubUrl: true,
  youtubeUrl: true,
  result: true,
  generalFeedback: true,
  createdAt: true,
  submittedAt: true,
  validationStatus: true,
  visibility: true,
  student: {
    select: {
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
    },
  },
  technologies: {
    select: {
      technology: {
        select: {
          name: true,
          version: true,
        },
      },
    },
  },
  media: {
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

const internshipValidationSelect = {
  id: true,
  hostOrganization: true,
  duration: true,
  startDate: true,
  endDate: true,
  missions: true,
  reportUrl: true,
  reportFileName: true,
  reportMimeType: true,
  reportFileSize: true,
  validationStatus: true,
  visibility: true,
  student: {
    select: {
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
    },
  },
  supervisorProfessor: {
    select: {
      id: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  },
  technologies: {
    select: {
      technology: {
        select: {
          name: true,
          version: true,
        },
      },
    },
  },
};

module.exports = {
  certificateDetailSelect,
  commentValidationSelect,
  internshipValidationSelect,
  projectValidationSelect,
  recommendationLetterValidationSelect,
  recommendationValidationSelect,
};
