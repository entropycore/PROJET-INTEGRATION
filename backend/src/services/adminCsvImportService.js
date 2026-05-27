'use strict';

const administratorService = require('./administratorService');

const REQUIRED_COLUMNS = ['firstName', 'lastName', 'email', 'role'];
const SUPPORTED_COLUMNS = [
  'firstName',
  'lastName',
  'email',
  'role',
  'phone',
  'accountStatus',
  'profilePicture',
  'apogeeCode',
  'cne',
  'major',
  'level',
  'city',
  'bio',
  'linkedinUrl',
  'employeeId',
  'grade',
  'specialty',
  'department',
  'adminLevel',
  'company',
  'jobTitle',
  'sector',
];

const CSV_COLUMN_ALIASES = {
  firstname: 'firstName',
  first_name: 'firstName',
  prenom: 'firstName',
  'prénom': 'firstName',
  lastname: 'lastName',
  last_name: 'lastName',
  nom: 'lastName',
  mail: 'email',
  e_mail: 'email',
  telephone: 'phone',
  téléphone: 'phone',
  tel: 'phone',
  status: 'accountStatus',
  statut: 'accountStatus',
  account_status: 'accountStatus',
  profile_picture: 'profilePicture',
  apogee: 'apogeeCode',
  apogee_code: 'apogeeCode',
  code_apogee: 'apogeeCode',
  'code_apogée': 'apogeeCode',
  filiere: 'major',
  'filière': 'major',
  niveau: 'level',
  ville: 'city',
  linkedin: 'linkedinUrl',
  linkedin_url: 'linkedinUrl',
  employee_id: 'employeeId',
  matricule: 'employeeId',
  specialite: 'specialty',
  'spécialité': 'specialty',
  departement: 'department',
  'département': 'department',
  admin_level: 'adminLevel',
  company_name: 'company',
  entreprise: 'company',
  job_title: 'jobTitle',
  poste: 'jobTitle',
  secteur: 'sector',
};

const normalizeHeader = (header) => {
  const normalized = String(header || '')
    .trim()
    .replace(/^\uFEFF/, '')
    .replace(/\s+/g, '_');

  return CSV_COLUMN_ALIASES[normalized.toLowerCase()] || normalized;
};

const detectDelimiter = (headerLine) => {
  const commaCount = (headerLine.match(/,/g) || []).length;
  const semicolonCount = (headerLine.match(/;/g) || []).length;

  return semicolonCount > commaCount ? ';' : ',';
};

const parseCsvLine = (line, delimiter) => {
  const values = [];
  let current = '';
  let insideQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"' && insideQuotes && nextChar === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (char === delimiter && !insideQuotes) {
      values.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
};

const parseCsv = (content) => {
  const lines = String(content || '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .filter((line) => line.trim());

  if (lines.length < 2) {
    throw new Error('CSV_EMPTY');
  }

  const delimiter = detectDelimiter(lines[0]);
  const headers = parseCsvLine(lines[0], delimiter).map(normalizeHeader);
  const missingColumns = REQUIRED_COLUMNS.filter((column) => !headers.includes(column));

  if (missingColumns.length) {
    throw new Error('CSV_MISSING_REQUIRED_COLUMNS');
  }

  return lines.slice(1).map((line, index) => {
    const values = parseCsvLine(line, delimiter);
    const row = {};

    headers.forEach((header, headerIndex) => {
      if (!SUPPORTED_COLUMNS.includes(header)) return;

      const value = values[headerIndex];
      row[header] = typeof value === 'string' && value.trim() ? value.trim() : undefined;
    });

    return {
      line: index + 2,
      payload: row,
    };
  });
};

const getErrorMessage = (err) => {
  const messages = {
    MISSING_REQUIRED_FIELDS: 'Champs obligatoires manquants.',
    MISSING_STUDENT_FIELDS: 'major et level sont obligatoires pour un étudiant.',
    INVALID_ROLE: 'Rôle invalide.',
    INVALID_STATUS: 'Statut invalide.',
    EMAIL_ALREADY_EXISTS: 'Email déjà utilisé.',
    USER_EMAIL_SEND_FAILED: "L'email des identifiants n'a pas pu être envoyé.",
  };

  return messages[err.message] || err.message || 'Erreur inconnue.';
};

exports.importUsersFromCsv = async (fileBuffer) => {
  if (!fileBuffer) {
    throw new Error('CSV_FILE_REQUIRED');
  }

  const rows = parseCsv(fileBuffer.toString('utf8'));
  const created = [];
  const errors = [];

  for (const row of rows) {
    try {
      const result = await administratorService.createUser(row.payload);
      created.push({
        line: row.line,
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
      });
    } catch (err) {
      errors.push({
        line: row.line,
        email: row.payload.email || null,
        message: getErrorMessage(err),
      });
    }
  }

  return {
    totalRows: rows.length,
    createdCount: created.length,
    failedCount: errors.length,
    created,
    errors,
  };
};

exports.REQUIRED_COLUMNS = REQUIRED_COLUMNS;
