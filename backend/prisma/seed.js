const { PrismaClient } = require('../src/generated/prisma');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Password123!', 10);

  await prisma.utilisateur.create({
    data: {
      nom: 'Admin',
      prenom: 'Super',
      email: 'admin@genstudio.com',
      motDePasseHash: passwordHash,
      statutCompte: 'ACTIF',
      role: 'ADMINISTRATEUR',
      administrateur: {
        create: {
          matriculeAdmin: 'ADM-2026',
          service: 'Direction IT',
        },
      },
    },
  });

  await prisma.utilisateur.create({
    data: {
      nom: 'El Alaoui',
      prenom: 'Youssef',
      email: 'etudiant@genstudio.com',
      motDePasseHash: passwordHash,
      statutCompte: 'ACTIF',
      role: 'ETUDIANT',
      etudiant: {
        create: {
          codeApogee: 'APG123456',
          cne: 'K123456789',
          filiere: 'Génie Informatique',
          niveau: 'GINF1',
          ville: 'Tanger',
        },
      },
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });