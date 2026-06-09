const fs = require("fs");
const path = require("path");
const { defineConfig } = require("cypress");

const loadRootEnvIfNeeded = () => {
  const envPath = path.resolve(__dirname, "../.env");
  if (!process.env.DATABASE_URL && !fs.existsSync(envPath)) return;

  const envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";

  envContent.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) return;

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed
      .slice(separatorIndex + 1)
      .trim()
      .replace(/^['"]|['"]$/g, "");

    if (!process.env[key]) {
      process.env[key] = value;
    }
  });

  if (
    process.env.DB_USER &&
    process.env.DB_PASSWORD &&
    process.env.DB_NAME &&
    process.env.DB_PORT
  ) {
    process.env.DATABASE_URL =
      `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}` +
      `@localhost:${process.env.DB_PORT}/${process.env.DB_NAME}?schema=public`;
  }
};

const createDbTasks = () => {
  loadRootEnvIfNeeded();

  const { PrismaClient } = require("../backend/src/generated/prisma");
  const prisma = new PrismaClient();

  return {
    async "db:isAvailable"() {
      try {
        await prisma.$queryRaw`SELECT 1`;
        return true;
      } catch (error) {
        return false;
      }
    },

    async "db:findUserByEmail"(email) {
      return prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          role: true,
          accountStatus: true,
          student: { select: { id: true, major: true, level: true } },
          professional: {
            select: {
              id: true,
              company: true,
              jobTitle: true,
              isEmailVerified: true,
              isVerified: true,
            },
          },
        },
      });
    },

    async "db:countRefreshSessionsByEmail"(email) {
      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });

      if (!user) return 0;

      return prisma.refreshTokenSession.count({
        where: { userId: user.id },
      });
    },

    async "db:countActiveRefreshSessionsByEmail"(email) {
      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });

      if (!user) return 0;

      return prisma.refreshTokenSession.count({
        where: {
          userId: user.id,
          isRevoked: false,
        },
      });
    },

    async "db:deleteRefreshSessionsByEmail"(email) {
      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });

      if (!user) return { count: 0 };

      return prisma.refreshTokenSession.deleteMany({
        where: { userId: user.id },
      });
    },
  };
};

module.exports = defineConfig({
  allowCypressEnv: true,

  e2e: {
    baseUrl: "http://localhost:5173",
    setupNodeEvents(on, config) {
      on("task", createDbTasks());
      return config;
    },
    env: {
      API_BASE_URL: "http://localhost:3000",
    },
  },
});
