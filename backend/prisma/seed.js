const { PrismaClient } = require('../src/generated/prisma');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  // Mot de passe unifié pour faciliter les tests : Password123!
  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Création de l'Administrateur (Chef d'équipe / Super Admin)
  await prisma.user.create({
    data: {
      lastName: 'Admin',
      firstName: 'Credencia',
      email: 'admin@credencia.ma',
      passwordHash: passwordHash,
      accountStatus: 'ACTIVE',
      role: 'ADMINISTRATOR',
      administrator: {
        create: {
          employeeId: 'ADM-CRED-2026',
          department: 'Direction IT - ENSA Tanger',
        },
      },
    },
  });

  // 2. Création de l'Étudiant (GINF1)
  await prisma.user.create({
    data: {
      lastName: 'Zaaboul',
      firstName: 'Mohamed',
      email: 'etudiant@credencia.ma',
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
        },
      },
    },
  });

  // 3. Création du Professeur (Encadrant)
  await prisma.user.create({
    data: {
      lastName: 'Ghailani',
      firstName: 'Mohamed',
      email: 'professeur@credencia.ma',
      passwordHash: passwordHash,
      accountStatus: 'ACTIVE',
      role: 'PROFESSOR',
      professor: {
        create: {
          employeeId: 'PROF-ENSA-01',
          // Note : Ajoute les champs exacts selon ton schema.prisma si 'department' n'existe pas
        },
      },
    },
  });

  // 4. Création du Professionnel (Entreprise externe)
  await prisma.user.create({
    data: {
      lastName: 'Tech',
      firstName: 'Recruiter',
      email: 'pro@entreprise.com',
      passwordHash: passwordHash,
      accountStatus: 'ACTIVE',
      role: 'PROFESSIONAL',
      professional: {
        create: {
          company: 'Capgemini Tanger',
          jobTitle: 'Senior Tech Lead',
          // On force la vérification pour qu'il puisse se connecter direct lors des tests
          isEmailVerified: true, 
          isVerified: true 
        },
      },
    },
  });

  console.log(' Base de données Credencia seedée avec succès avec les 4 rôles !');
}

main()
  .catch((e) => {
    console.error(' Erreur lors du seed :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });