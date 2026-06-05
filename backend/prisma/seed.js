const { PrismaClient } = require('../src/generated/prisma');
const bcrypt = require('bcrypt');
const storageService = require('../src/services/storage/storageService');

const prisma = new PrismaClient();
const SEED_CERTIFICATE_FILE_NAME = 'hackathon-ensa-2026.pdf';
const SEED_CERTIFICATE_OBJECT_KEY = `seed/certificates/${SEED_CERTIFICATE_FILE_NAME}`;
const SEED_CERTIFICATE_BUFFER = Buffer.from(
  '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n' +
    '2 0 obj\n<< /Type /Pages /Count 0 >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF\n',
  'utf8',
);

const SKILL_DOMAINS = [
  {
    name: 'Web',
    slug: 'web',
    description: 'Développement frontend et interfaces web.',
    displayOrder: 1,
  },
  {
    name: 'Backend',
    slug: 'backend',
    description: 'API, bases de données et logique serveur.',
    displayOrder: 2,
  },
  {
    name: 'DevOps',
    slug: 'devops',
    description: 'Déploiement, automatisation et intégration continue.',
    displayOrder: 3,
  },
  {
    name: 'Security',
    slug: 'security',
    description: 'Sécurité applicative et protection des systèmes.',
    displayOrder: 4,
  },
  {
    name: 'AI/Data',
    slug: 'ai-data',
    description: 'Analyse de données, IA et apprentissage automatique.',
    displayOrder: 5,
  },
  {
    name: 'Mobile',
    slug: 'mobile',
    description: 'Développement mobile et applications hybrides.',
    displayOrder: 6,
  },
];

const TECHNICAL_SKILLS_BY_DOMAIN = {
  web: ['Vue.js', 'React', 'HTML', 'CSS', 'JavaScript'],
  backend: ['Node.js', 'Express.js', 'Prisma', 'PostgreSQL'],
  devops: ['Docker', 'GitHub Actions', 'CI/CD', 'Kubernetes'],
  security: ['JWT', 'OWASP', 'Firewall', 'Secure API'],
  'ai-data': ['Python', 'Machine Learning', 'Data Analysis'],
  mobile: ['React Native', 'Flutter'],
};

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

const upsertSkillDomain = async ({ name, slug, description, displayOrder }) =>
  prisma.skillDomain.upsert({
    where: { slug },
    update: {
      name,
      description,
      displayOrder,
    },
    create: {
      name,
      slug,
      description,
      displayOrder,
    },
  });

const ensureSkillDomains = async () => {
  const domainsBySlug = {};

  for (const domain of SKILL_DOMAINS) {
    const savedDomain = await upsertSkillDomain(domain);
    domainsBySlug[domain.slug] = savedDomain;
  }

  return domainsBySlug;
};

const ensureTechnicalSkillCatalog = async (domainsBySlug) => {
  for (const [domainSlug, skillNames] of Object.entries(TECHNICAL_SKILLS_BY_DOMAIN)) {
    const domain = domainsBySlug[domainSlug];
    if (!domain) continue;

    for (const name of skillNames) {
      await prisma.skill.upsert({
        where: { name },
        update: {
          type: 'TECHNICAL',
          description: `Compétence technique du domaine ${domain.name}.`,
          domainId: domain.id,
        },
        create: {
          name,
          type: 'TECHNICAL',
          description: `Compétence technique du domaine ${domain.name}.`,
          domainId: domain.id,
        },
      });
    }
  }
};

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

const buildCertificateUrl = (activityId) =>
  `/api/student/activities/${activityId}/certificate/download`;

const storeSeedCertificateFile = async () => {
  const storedFile = await storageService.uploadObject({
    objectKey: SEED_CERTIFICATE_OBJECT_KEY,
    buffer: SEED_CERTIFICATE_BUFFER,
    mimeType: 'application/pdf',
    metadata: {
      source: 'seed',
      name: SEED_CERTIFICATE_FILE_NAME,
    },
  });

  return {
    fileName: SEED_CERTIFICATE_FILE_NAME,
    mimeType: 'application/pdf',
    fileSize: SEED_CERTIFICATE_BUFFER.length,
    storagePath: storedFile.objectKey,
  };
};

const ensureCertificate = async (activityId) => {
  const storedFile = await storeSeedCertificateFile();
  const existingCertificate = await prisma.certificate.findFirst({
    where: { activityId },
  });

  if (existingCertificate) {
    return prisma.certificate.update({
      where: { id: existingCertificate.id },
      data: {
        documentUrl: buildCertificateUrl(activityId),
        fileName: storedFile.fileName,
        mimeType: storedFile.mimeType,
        fileSize: storedFile.fileSize,
        storagePath: storedFile.storagePath,
        validationStatus: 'PENDING',
      },
    });
  }

  return prisma.certificate.create({
    data: {
      activityId,
      documentUrl: buildCertificateUrl(activityId),
      fileName: storedFile.fileName,
      mimeType: storedFile.mimeType,
      fileSize: storedFile.fileSize,
      storagePath: storedFile.storagePath,
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
        resolutionNote: status === 'PENDING' ? null : 'Signalement traité.',
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
  const skillDomains = await ensureSkillDomains();
  await ensureTechnicalSkillCatalog(skillDomains);

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
    description: 'Badge pour les étudiants actifs en développement web.',
    rule: '3 projets web validés.',
    tone: 'blue',
  });

  await upsertBadge({
    name: 'Hackathon Participant',
    description: "Badge attribué après validation d'une participation à un hackathon.",
    rule: 'Une activité hackathon avec certificat valide.',
    tone: 'orange',
  });

  const projectReport = await upsertReport({
    reporterUserId: studentUser.id,
    targetType: 'PROJECT',
    targetId: project.id,
    reason: 'Contenu inapproprié',
    description: 'Le projet comporte une description qui doit être revérifiée.',
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

  console.log('Base de données seedée avec succès avec des données de rôles, validations, badges, reports et notifications.');
}

main()
  .catch((e) => {
    console.error('Erreur lors du seed :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
