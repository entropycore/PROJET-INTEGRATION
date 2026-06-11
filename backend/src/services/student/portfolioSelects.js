'use strict';

const portfolioSelect = {
  id: true,
  title: true,
  publicSlug: true,
  description: true,
  visibility: true,
  status: true,
  targetDomain: true,
  theme: true,
  includedSections: true,
  includedItems: true,
  generatedAt: true,
  updatedAt: true,
};

const skillSelect = {
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
      domain: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  },
};

const projectSelect = {
  id: true,
  title: true,
  description: true,
  type: true,
  teamRole: true,
  teamSize: true,
  githubUrl: true,
  youtubeUrl: true,
  result: true,
  visibility: true,
  validationStatus: true,
  createdAt: true,
  submittedAt: true,
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
  technologies: {
    orderBy: { id: 'asc' },
    select: {
      technology: {
        select: {
          id: true,
          name: true,
          version: true,
          category: true,
        },
      },
    },
  },
};

const internshipSelect = {
  id: true,
  hostOrganization: true,
  duration: true,
  startDate: true,
  endDate: true,
  missions: true,
  reportUrl: true,
  validationStatus: true,
  visibility: true,
  technologies: {
    orderBy: { id: 'asc' },
    select: {
      technology: {
        select: {
          id: true,
          name: true,
        },
      },
    },
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

const activitySelect = {
  id: true,
  type: true,
  title: true,
  description: true,
  organization: true,
  startDate: true,
  endDate: true,
  duration: true,
  location: true,
  validationStatus: true,
  visibility: true,
  certificates: {
    orderBy: { submittedAt: 'desc' },
    take: 1,
    select: {
      id: true,
      documentUrl: true,
      fileName: true,
      mimeType: true,
      fileSize: true,
      validationStatus: true,
      submittedAt: true,
    },
  },
};

const recommendationAuthorSelect = {
  id: true,
  firstName: true,
  lastName: true,
  role: true,
  profilePicture: true,
};

const studentDataSelect = {
  id: true,
  userId: true,
  major: true,
  level: true,
  city: true,
  bio: true,
  careerObjective: true,
  linkedinUrl: true,
  githubAccessToken: true,
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      profilePicture: true,
      preferences: true,
    },
  },
  academicPaths: {
    orderBy: [{ endDate: 'desc' }, { startDate: 'desc' }],
    select: {
      id: true,
      institution: true,
      degree: true,
      major: true,
      startDate: true,
      endDate: true,
      honor: true,
    },
  },
  studentSkills: {
    orderBy: [{ updatedAt: 'desc' }],
    select: skillSelect,
  },
  projects: {
    where: { validationStatus: 'APPROVED' },
    orderBy: [{ submittedAt: 'desc' }, { createdAt: 'desc' }],
    select: projectSelect,
  },
  internships: {
    where: { validationStatus: 'APPROVED' },
    orderBy: [{ endDate: 'desc' }, { startDate: 'desc' }],
    select: internshipSelect,
  },
  activities: {
    where: { validationStatus: 'APPROVED' },
    orderBy: [{ endDate: 'desc' }, { startDate: 'desc' }],
    select: activitySelect,
  },
  recommendationLetters: {
    where: { validationStatus: 'APPROVED' },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      content: true,
      type: true,
      documentUrl: true,
      visibility: true,
      downloadable: true,
      createdAt: true,
      validatedAt: true,
      authorUser: {
        select: recommendationAuthorSelect,
      },
    },
  },
  recommendations: {
    where: { status: 'APPROVED' },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      content: true,
      organization: true,
      authorJobTitle: true,
      recommendationType: true,
      status: true,
      visibility: true,
      createdAt: true,
      validatedAt: true,
      authorUser: {
        select: recommendationAuthorSelect,
      },
    },
  },
};

const studentWithPortfolioSelect = {
  ...studentDataSelect,
  portfolio: {
    select: portfolioSelect,
  },
};


module.exports = {
  portfolioSelect,
  studentDataSelect,
  studentWithPortfolioSelect,
};
