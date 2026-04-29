const { PrismaClient } = require('../src/generated/prisma');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Password123!', 10);

  
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
        },
      },
    },
  });

  
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
        },
      },
    },
  });

  console.log('Base de données seedée avec succès !');
}

main()
  .catch((e) => {
    console.error(' Erreur lors du seed :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });