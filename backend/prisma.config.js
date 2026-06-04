'use strict';

require('./src/config/loadEnv');

const path = require('node:path');
const { defineConfig } = require('prisma/config');

module.exports = defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  migrations: {
    path: path.join('prisma', 'migrations'),
    seed: 'node prisma/seed.js',
  },
  datasource: {
    url: process.env.DATABASE_URL,
    directUrl: process.env.DIRECT_URL,
  },
});
