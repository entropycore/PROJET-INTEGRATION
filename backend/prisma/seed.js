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
  await upsertAdministratorProfile(adminUser.id);

  const studentUser = await upsertUser({
    email: 'etudiant@credencia.ma',
    lastName: 'Zaaboul',
    firstName: 'Mohamed',
    passwordHash,
    accountStatus: 'ACTIVE',
    role: 'STUDENT',
  });
  await upsertStudentProfile(studentUser.id);

  const professorUser = await upsertUser({
    email: 'professeur@credencia.ma',
    lastName: 'Ghailani',
    firstName: 'Mohamed',
    passwordHash,
    accountStatus: 'ACTIVE',
    role: 'PROFESSOR',
  });
  await upsertProfessorProfile(professorUser.id);

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

  console.log('Base de donnees seedee avec succes avec les roles principaux et une demande pro en attente.');
}

main()
  .catch((e) => {
    console.error('Erreur lors du seed :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
