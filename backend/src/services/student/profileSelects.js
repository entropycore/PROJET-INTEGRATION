'use strict';

const studentProfileSelect = {
  id: true,
  userId: true,
  apogeeCode: true,
  cne: true,
  major: true,
  level: true,
  birthDate: true,
  address: true,
  city: true,
  bio: true,
  careerObjective: true,
  linkedinUrl: true,
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      profilePicture: true,
      accountStatus: true,
      createdAt: true,
      lastLoginAt: true,
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
  },
  portfolio: {
    select: {
      id: true,
      title: true,
      publicSlug: true,
      description: true,
      visibility: true,
      status: true,
      targetDomain: true,
      generatedAt: true,
      updatedAt: true,
    },
  },
};

const studentDashboardSelect = {
  id: true,
  userId: true,
  major: true,
  level: true,
  city: true,
  bio: true,
  careerObjective: true,
  linkedinUrl: true,
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      profilePicture: true,
      accountStatus: true,
      createdAt: true,
      lastLoginAt: true,
    },
  },
  portfolio: {
    select: {
      id: true,
      title: true,
      publicSlug: true,
      visibility: true,
      status: true,
      targetDomain: true,
      updatedAt: true,
    },
  },
  projects: {
    orderBy: [{ submittedAt: 'desc' }, { createdAt: 'desc' }],
    take: 4,
    select: {
      id: true,
      title: true,
      description: true,
      type: true,
      validationStatus: true,
      visibility: true,
      githubUrl: true,
      youtubeUrl: true,
      createdAt: true,
      submittedAt: true,
      technologies: {
        select: {
          technology: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  },
  internships: {
    orderBy: [{ endDate: 'desc' }, { startDate: 'desc' }],
    take: 4,
    select: {
      id: true,
      hostOrganization: true,
      validationStatus: true,
      visibility: true,
      startDate: true,
      endDate: true,
    },
  },
  activities: {
    orderBy: [{ endDate: 'desc' }, { startDate: 'desc' }],
    take: 4,
    select: {
      id: true,
      title: true,
      type: true,
      organization: true,
      visibility: true,
      startDate: true,
      endDate: true,
    },
  },
};

module.exports = {
  studentDashboardSelect,
  studentProfileSelect,
};
