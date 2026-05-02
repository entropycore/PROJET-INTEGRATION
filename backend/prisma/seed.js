const { PrismaClient } = require('../src/generated/prisma');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Password123!', 10);

  console.log(' Seeding database...');

  // ADMIN USER
  await prisma.user.create({
    data: {
      lastName: 'Admin',
      firstName: 'Super',
      email: 'admin@genstudio.com',
      passwordHash: passwordHash,
      accountStatus: 'ACTIVE',
      role: 'ADMINISTRATOR',
      administrator: {
        create: {
          employeeId: 'ADM-2026',
          department: 'Direction IT',
          adminLevel: 'SUPER_ADMIN',
        },
      },
    },
  });
  console.log('Admin créé: admin@genstudio.com');

  // STUDENT USER
  await prisma.user.create({
    data: {
      lastName: 'El Alaoui',
      firstName: 'Youssef',
      email: 'etudiant@genstudio.com',
      passwordHash: passwordHash,
      accountStatus: 'ACTIVE',
      role: 'STUDENT',
      student: {
        create: {
          apogeeCode: 'APG123456',
          cne: 'K123456789',
          major: 'Génie Informatique',
          level: 'GINF1',
          city: 'Tanger',
          birthDate: new Date('2004-01-15'),
          address: '123 Rue Test',
          bio: 'Étudiant passionné par la programmation',
          careerObjective: 'Développeur Full Stack',
          linkedinUrl: 'https://linkedin.com/in/youssef',
        },
      },
    },
  });
  console.log('Étudiant créé: etudiant@genstudio.com');

  // PROFESSOR USER
  await prisma.user.create({
    data: {
      lastName: 'Benani',
      firstName: 'Ahmed',
      email: 'professeur@genstudio.com',
      passwordHash: passwordHash,
      accountStatus: 'ACTIVE',
      role: 'PROFESSOR',
      professor: {
        create: {
          employeeId: 'PROF-2026',
          grade: 'Professeur Agrégé',
          specialty: 'Génie Logiciel',
          department: 'Informatique',
        },
      },
    },
  });
  console.log(' Professeur créé: professeur@genstudio.com');

  // PROFESSIONAL USER
  await prisma.user.create({
    data: {
      lastName: 'Benjelloun',
      firstName: 'Sarah',
      email: 'professional@genstudio.com',
      passwordHash: passwordHash,
      accountStatus: 'ACTIVE',
      role: 'PROFESSIONAL',
      professional: {
        create: {
          company: 'TechStart Solutions',
          jobTitle: 'Senior Developer',
          sector: 'Technologie',
          bio: 'Développeuse expérimentée avec 8 ans d\'expérience',
          isVerified: true,
          isEmailVerified: true,
        },
      },
    },
  });
  console.log(' Professionnel créé: professional@genstudio.com');

  console.log('\n Base de données seedée avec succès !');
  console.log('\n Identifiants de test:');
  console.log('   Admin: admin@genstudio.com / Password123!');
  console.log('   Étudiant: etudiant@genstudio.com / Password123!');
  console.log('   Professeur: professeur@genstudio.com / Password123!');
  console.log('   Professionnel: professional@genstudio.com / Password123!');
}

main()
  .catch((e) => {
    console.error(' Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });