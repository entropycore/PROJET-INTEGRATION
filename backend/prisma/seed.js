const { PrismaClient } = require('../src/generated/prisma');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const upsertUser = async ({
  email,
  lastName,
  firstName,
  passwordHash,
  accountStatus,
  role,
}) =>
  prisma.user.upsert({
    where: { email },
    update: {
      lastName,
      firstName,
      passwordHash,
      accountStatus,
      role,
    },
    create: {
      email,
      lastName,
      firstName,
      passwordHash,
      accountStatus,
      role,
    },
  });

const upsertAdministratorProfile = async (userId) =>
  prisma.administrator.upsert({
    where: { employeeId: 'ADM-CRED-2026' },
    update: {
      userId,
      employeeId: 'ADM-CRED-2026',
      department: 'Direction IT - ENSA Tanger',
    },
    create: {
      userId,
      employeeId: 'ADM-CRED-2026',
      department: 'Direction IT - ENSA Tanger',
    },
  });

const upsertStudentProfile = async (userId) =>
  prisma.student.upsert({
    where: { apogeeCode: 'APG123456' },
    update: {
      userId,
      apogeeCode: 'APG123456',
      cne: 'K123456789',
      major: 'Genie Informatique',
      level: 'GINF1',
      city: 'Tanger',
    },
    create: {
      userId,
      apogeeCode: 'APG123456',
      cne: 'K123456789',
      major: 'Genie Informatique',
      level: 'GINF1',
      city: 'Tanger',
    },
  });

const upsertProfessorProfile = async (userId) =>
  prisma.professor.upsert({
    where: { employeeId: 'PROF-ENSA-01' },
    update: {
      userId,
      employeeId: 'PROF-ENSA-01',
    },
    create: {
      userId,
      employeeId: 'PROF-ENSA-01',
    },
  });

const upsertProfessionalProfile = async (
  userId,
  { company, jobTitle, isEmailVerified, isVerified, emailVerifiedAt }
) =>
  prisma.professional.upsert({
    where: { userId },
    update: {
      company,
      jobTitle,
      isEmailVerified,
      isVerified,
      emailVerifyToken: null,
      emailVerifyExpires: null,
      emailVerifiedAt,
    },
    create: {
      userId,
      company,
      jobTitle,
      isEmailVerified,
      isVerified,
      emailVerifyToken: null,
      emailVerifyExpires: null,
      emailVerifiedAt,
    },
  });

const upsertBadge = async ({ name, description, rule, tone = 'blue', iconUrl = '' }) =>
  prisma.badge.upsert({
    where: { name },
    update: {
      description,
      rule,
      tone,
      iconUrl,
    },
    create: {
      name,
      description,
      rule,
      tone,
      iconUrl,
    },
  });

const ensureProject = async (studentId) => {
  const existingProject = await prisma.project.findFirst({
    where: {
      studentId,
      title: 'Plateforme Portfolio Credencia',
    },
  });

  if (existingProject) {
    return prisma.project.update({
      where: { id: existingProject.id },
      data: {
        description: 'Projet d integration pour gerer les portfolios et validations.',
        type: 'INTEGRATION',
        githubUrl: 'https://github.com/entropycore/PROJET-INTEGRATION',
        validationStatus: 'PENDING',
        visibility: 'PUBLIC',
        submittedAt: new Date(),
      },
    });
  }

  return prisma.project.create({
    data: {
      studentId,
      title: 'Plateforme Portfolio Credencia',
      description: 'Projet d integration pour gerer les portfolios et validations.',
      type: 'INTEGRATION',
      githubUrl: 'https://github.com/entropycore/PROJET-INTEGRATION',
      validationStatus: 'PENDING',
      visibility: 'PUBLIC',
      submittedAt: new Date(),
    },
  });
};

const ensureInternship = async (studentId, supervisorProfessorId) => {
  const existingInternship = await prisma.internship.findFirst({
    where: {
      studentId,
      hostOrganization: 'Capgemini Tanger',
    },
  });

  if (existingInternship) {
    return prisma.internship.update({
      where: { id: existingInternship.id },
      data: {
        supervisorProfessorId,
        duration: '4 mois',
        startDate: new Date('2026-02-01'),
        endDate: new Date('2026-05-31'),
        missions: 'Developpement web et suivi des integrations.',
        validationStatus: 'PENDING',
        visibility: 'PUBLIC',
      },
    });
  }

  return prisma.internship.create({
    data: {
      studentId,
      supervisorProfessorId,
      hostOrganization: 'Capgemini Tanger',
      duration: '4 mois',
      startDate: new Date('2026-02-01'),
      endDate: new Date('2026-05-31'),
      missions: 'Developpement web et suivi des integrations.',
      validationStatus: 'PENDING',
      visibility: 'PUBLIC',
    },
  });
};

const ensureActivity = async (studentId) => {
  const existingActivity = await prisma.extracurricularActivity.findFirst({
    where: {
      studentId,
      title: 'Hackathon ENSA Tanger 2026',
    },
  });

  if (existingActivity) {
    return prisma.extracurricularActivity.update({
      where: { id: existingActivity.id },
      data: {
        type: 'HACKATHON',
        description: 'Participation a un hackathon avec remise de certificat.',
        organization: 'ENSA Tanger',
        startDate: new Date('2026-04-15'),
        endDate: new Date('2026-04-17'),
        visibility: 'PUBLIC',
      },
    });
  }

  return prisma.extracurricularActivity.create({
    data: {
      studentId,
      type: 'HACKATHON',
      title: 'Hackathon ENSA Tanger 2026',
      description: 'Participation a un hackathon avec remise de certificat.',
      organization: 'ENSA Tanger',
      startDate: new Date('2026-04-15'),
      endDate: new Date('2026-04-17'),
      visibility: 'PUBLIC',
    },
  });
};

const ensureCertificate = async (activityId) => {
  const existingCertificate = await prisma.certificate.findFirst({
    where: { activityId },
  });

  if (existingCertificate) {
    return prisma.certificate.update({
      where: { id: existingCertificate.id },
      data: {
        documentUrl: 'https://example.com/certificates/hackathon-ensa-2026.pdf',
        validationStatus: 'PENDING',
      },
    });
  }

  return prisma.certificate.create({
    data: {
      activityId,
      documentUrl: 'https://example.com/certificates/hackathon-ensa-2026.pdf',
      validationStatus: 'PENDING',
    },
  });
};

const upsertReport = async ({
  reporterUserId,
  reviewedByAdministratorId = null,
  targetType,
  targetId = null,
  reason,
  description,
  status = 'PENDING',
}) => {
  const existingReport = await prisma.report.findFirst({
    where: {
      reporterUserId,
      targetType,
      targetId,
      reason,
    },
  });

  if (existingReport) {
    return prisma.report.update({
      where: { id: existingReport.id },
      data: {
        reviewedByAdministratorId,
        description,
        status,
        reviewedAt: status === 'PENDING' ? null : new Date(),
        resolutionNote: status === 'PENDING' ? null : 'Signalement traite.',
      },
    });
  }

  return prisma.report.create({
    data: {
      reporterUserId,
      reviewedByAdministratorId,
      targetType,
      targetId,
      reason,
      description,
      status,
    },
  });
};

const upsertNotification = async ({
  administratorId = null,
  type,
  title,
  message,
  relatedType = null,
  relatedId = null,
}) => {
  const existingNotification = await prisma.notification.findFirst({
    where: {
      administratorId,
      type,
      title,
      relatedType,
      relatedId,
    },
  });

  if (existingNotification) {
    return prisma.notification.update({
      where: { id: existingNotification.id },
      data: {
        message,
        isRead: false,
        readAt: null,
      },
    });
  }

  return prisma.notification.create({
    data: {
      administratorId,
      type,
      title,
      message,
      relatedType,
      relatedId,
      isRead: false,
    },
  });
};

async function main() {
  const passwordHash = await bcrypt.hash('Password123!', 10);
  const verifiedAt = new Date();

  const adminUser = await upsertUser({
    email: 'admin@credencia.ma',
    lastName: 'Admin',
    firstName: 'Credencia',
    passwordHash,
    accountStatus: 'ACTIVE',
    role: 'ADMINISTRATOR',
  });
  const administratorProfile = await upsertAdministratorProfile(adminUser.id);

  const studentUser = await upsertUser({
    email: 'etudiant@credencia.ma',
    lastName: 'Zaaboul',
    firstName: 'Mohamed',
    passwordHash,
    accountStatus: 'ACTIVE',
    role: 'STUDENT',
  });
  const studentProfile = await upsertStudentProfile(studentUser.id);

  const professorUser = await upsertUser({
    email: 'professeur@credencia.ma',
    lastName: 'Ghailani',
    firstName: 'Mohamed',
    passwordHash,
    accountStatus: 'ACTIVE',
    role: 'PROFESSOR',
  });
  const professorProfile = await upsertProfessorProfile(professorUser.id);

  const activeProfessionalUser = await upsertUser({
    email: 'pro@entreprise.com',
    lastName: 'Tech',
    firstName: 'Recruiter',
    passwordHash,
    accountStatus: 'ACTIVE',
    role: 'PROFESSIONAL',
  });
  await upsertProfessionalProfile(activeProfessionalUser.id, {
    company: 'Capgemini Tanger',
    jobTitle: 'Senior Tech Lead',
    isEmailVerified: true,
    isVerified: true,
    emailVerifiedAt: verifiedAt,
  });

  const pendingProfessionalUser = await upsertUser({
    email: 'pending.pro@entreprise.com',
    lastName: 'Pending',
    firstName: 'Professional',
    passwordHash,
    accountStatus: 'PENDING',
    role: 'PROFESSIONAL',
  });
  await upsertProfessionalProfile(pendingProfessionalUser.id, {
    company: 'Accenture Maroc',
    jobTitle: 'HR Recruiter',
    isEmailVerified: true,
    isVerified: false,
    emailVerifiedAt: verifiedAt,
  });

  const project = await ensureProject(studentProfile.id);
  const internship = await ensureInternship(studentProfile.id, professorProfile.id);
  const activity = await ensureActivity(studentProfile.id);
  await ensureCertificate(activity.id);

  await upsertBadge({
    name: 'Web Developer',
    description: 'Badge pour les etudiants actifs en developpement web.',
    rule: '3 projets web valides.',
    tone: 'blue',
  });

  await upsertBadge({
    name: 'Hackathon Participant',
    description: 'Badge attribue apres validation d une participation a un hackathon.',
    rule: 'Une activite hackathon avec certificat valide.',
    tone: 'orange',
  });

  const projectReport = await upsertReport({
    reporterUserId: studentUser.id,
    targetType: 'PROJECT',
    targetId: project.id,
    reason: 'Contenu inapproprie',
    description: 'Le projet comporte une description qui doit etre reverifiee.',
  });

  await upsertReport({
    reporterUserId: studentUser.id,
    targetType: 'OTHER',
    reason: 'Probleme general',
    description: 'Signalement de test pour le workflow admin.',
  });

  await upsertNotification({
    administratorId: administratorProfile.id,
    type: 'ACCESS_REQUEST',
    title: 'Nouvelle demande professionnelle',
    message: 'Une demande professionnelle est en attente de validation.',
    relatedType: 'PROFESSIONAL',
    relatedId: pendingProfessionalUser.id,
  });

  await upsertNotification({
    administratorId: administratorProfile.id,
    type: 'REPORT',
    title: 'Nouveau signalement',
    message: 'Un signalement de projet est en attente de traitement.',
    relatedType: 'REPORT',
    relatedId: projectReport.id,
  });

  console.log('Base de donnees seedee avec succes avec des donnees de roles, validations, badges, reports et notifications.');
}

main()
  .catch((e) => {
    console.error('Erreur lors du seed :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
