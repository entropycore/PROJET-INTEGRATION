'use strict';

const path = require('path');
const dotenv = require('dotenv');

const expandEnvValue = (value) =>
  value?.replace(/\$\{([^}]+)\}/g, (_, name) => process.env[name] || '');

dotenv.config({ quiet: true });
dotenv.config({
  path: path.resolve(__dirname, '../../../.env'),
  quiet: true,
});

['DATABASE_URL', 'DIRECT_URL'].forEach((key) => {
  if (process.env[key]) {
    process.env[key] = expandEnvValue(process.env[key]);
  }
});
