'use strict';

const crypto = require('crypto');

const USER_ROLES = ['STUDENT', 'PROFESSOR', 'ADMINISTRATOR', 'PROFESSIONAL'];
const ACCOUNT_STATUSES = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING'];
const ROLE_LABELS = {
  STUDENT: 'Étudiant',
  PROFESSOR: 'Professeur',
  ADMINISTRATOR: 'Administrateur',
  PROFESSIONAL: 'Professionnel',
};
const STATUS_LABELS = {
  ACTIVE: 'Actif',
  INACTIVE: 'Inactif',
  SUSPENDED: 'Suspendu',
  PENDING: 'En attente de validation',
};

const buildProfessionalProfileData = (payload, accountStatus) => {
  const isPendingApproval = accountStatus === 'PENDING';
  const now = new Date();

  return {
    company: payload.company || null,
    jobTitle: payload.jobTitle || null,
    sector: payload.sector || null,
    bio: payload.bio || null,
    isEmailVerified: true,
    emailVerifiedAt: now,
    isVerified: !isPendingApproval,
    approvedAt: isPendingApproval ? null : now,
  };
};

const ensureValidRole = (role) => {
  if (!USER_ROLES.includes(role)) {
    throw new Error('INVALID_ROLE');
  }
};

const ensureValidStatus = (status) => {
  if (!ACCOUNT_STATUSES.includes(status)) {
    throw new Error('INVALID_STATUS');
  }
};

const buildRoleCreateData = (role, payload, accountStatus) => {
  switch (role) {
    case 'STUDENT':
      if (!payload.major || !payload.level) {
        throw new Error('MISSING_STUDENT_FIELDS');
      }

      return {
        student: {
          create: {
            apogeeCode: payload.apogeeCode || null,
            cne: payload.cne || null,
            major: payload.major,
            level: payload.level,
            city: payload.city || null,
            bio: payload.bio || null,
            linkedinUrl: payload.linkedinUrl || null,
          },
        },
      };

    case 'PROFESSOR':
      return {
        professor: {
          create: {
            employeeId: payload.employeeId || null,
            grade: payload.grade || null,
            specialty: payload.specialty || null,
            department: payload.department || null,
          },
        },
      };

    case 'ADMINISTRATOR':
      return {
        administrator: {
          create: {
            employeeId: payload.employeeId || null,
            department: payload.department || null,
            adminLevel: payload.adminLevel || null,
          },
        },
      };

    case 'PROFESSIONAL':
      return {
        professional: {
          create: buildProfessionalProfileData(payload, accountStatus),
        },
      };

    default:
      throw new Error('INVALID_ROLE');
  }
};

const buildRoleUpdateData = (user, payload) => {
  if (user.role === 'STUDENT') {
    return {
      model: 'student',
      data: {
        apogeeCode: payload.apogeeCode,
        cne: payload.cne,
        major: payload.major,
        level: payload.level,
        city: payload.city,
        bio: payload.bio,
        linkedinUrl: payload.linkedinUrl,
      },
    };
  }

  if (user.role === 'PROFESSOR') {
    return {
      model: 'professor',
      data: {
        employeeId: payload.employeeId,
        grade: payload.grade,
        specialty: payload.specialty,
        department: payload.department,
      },
    };
  }

  if (user.role === 'ADMINISTRATOR') {
    return {
      model: 'administrator',
      data: {
        employeeId: payload.employeeId,
        department: payload.department,
        adminLevel: payload.adminLevel,
      },
    };
  }

  if (user.role === 'PROFESSIONAL') {
    return {
      model: 'professional',
      data: {
        company: payload.company,
        jobTitle: payload.jobTitle,
        sector: payload.sector,
        bio: payload.bio,
      },
    };
  }

  return null;
};

const buildTemporaryPassword = () => {
  const suffix = crypto.randomBytes(4).toString('hex');
  return `Temp${suffix}Aa!1`;
};

const buildUserCredentialsEmail = ({ firstName, email, password, role, accountStatus }) => {
  const loginUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/login`;
  const roleLabel = ROLE_LABELS[role] || role;
  const statusLabel = STATUS_LABELS[accountStatus] || accountStatus;

  return {
    subject: 'Vos identifiants Credencia',
    text: [
      `Bonjour ${firstName},`,
      '',
      'Un compte Credencia a été créé pour vous.',
      '',
      `Rôle : ${roleLabel}`,
      `Statut du compte : ${statusLabel}`,
      `Email : ${email}`,
      `Mot de passe initial : ${password}`,
      '',
      `Connexion : ${loginUrl}`,
      '',
      'Si vous recevez plusieurs emails de credentials, utilisez uniquement le mot de passe du dernier message reçu.',
      '',
      'Nous vous recommandons de changer votre mot de passe après votre première connexion.',
    ].join('\n'),
  };
};

const buildPasswordResetEmail = ({ firstName, email, password, role }) => {
  const loginUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/login`;
  const roleLabel = ROLE_LABELS[role] || role;

  return {
    subject: 'Votre mot de passe Credencia a été réinitialisé',
    text: [
      `Bonjour ${firstName},`,
      '',
      'Votre mot de passe Credencia a été réinitialisé par un administrateur.',
      '',
      `Rôle : ${roleLabel}`,
      `Email : ${email}`,
      `Nouveau mot de passe temporaire : ${password}`,
      '',
      `Connexion : ${loginUrl}`,
      '',
      'Si vous recevez plusieurs emails de réinitialisation, utilisez uniquement le mot de passe du dernier message reçu.',
      '',
      'Nous vous recommandons de changer votre mot de passe après votre prochaine connexion.',
    ].join('\n'),
  };
};

module.exports = {
  buildPasswordResetEmail,
  buildProfessionalProfileData,
  buildRoleCreateData,
  buildRoleUpdateData,
  buildTemporaryPassword,
  buildUserCredentialsEmail,
  ensureValidRole,
  ensureValidStatus,
};
