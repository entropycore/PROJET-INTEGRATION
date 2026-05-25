require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');


const corsOptions = require('./middlewares/corsOptions');
const securityHeaders = require('./middlewares/securityHeaders');
const redirectHttps = require('./middlewares/redirectHttps');
const { handleErrors, notFound } = require('./middlewares/handleErrors');
const { globalLimiter } = require('./middlewares/rateLimiter');
const { sanitizeInputs } = require('./middlewares/sanitize');
const logger = require('./logs/logger');


const authRoutes = require('./routes/authRoutes');
const professionalRoutes = require('./routes/professionalRoutes');
const studentRoutes = require('./routes/studentRoutes');
const professorRoutes = require('./routes/professorRoutes');
const administratorRoutes = require('./routes/administratorRoutes');
const reportRoutes = require('./routes/reportRoutes');
const githubRoutes = require('./routes/githubRoutes');
const fileRoutes = require('./routes/fileRoutes');
const projectRoutes = require('./routes/projectRoutes');
const studentsRoutes = require('./routes/studentsRoutes');
const academicPathRoutes = require('./routes/academicPathRoutes');
const skillRoutes = require('./routes/skillRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

if (process.env.NODE_ENV === 'production' || process.env.TRUST_PROXY === 'true') {
  app.set('trust proxy', 1);
}

app.use(securityHeaders);
app.use(corsOptions);
app.use(redirectHttps);
app.use(globalLimiter);


app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || '1mb' }));
app.use(express.urlencoded({ extended: true, limit: process.env.JSON_BODY_LIMIT || '1mb' }));
app.use(cookieParser());
app.use(sanitizeInputs);

app.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'API Credencia operationnelle.',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      files: '/api/files',
    },
  });
});

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend operationnel.',
    timestamp: new Date().toISOString(),
  });
});


app.use('/api/auth', authRoutes);

app.use('/api/professional', professionalRoutes);

app.use('/api/student/github', githubRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/academic-paths', academicPathRoutes);
app.use('/api/skills', skillRoutes);



app.use('/api/professor', professorRoutes);

app.use('/api/admin', administratorRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/recommendations', recommendationRoutes);

app.use('/api/files', fileRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/notifications', notificationRoutes);



app.use(notFound);
app.use(handleErrors);


const PORT = process.env.PORT || process.env.BACKEND_PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => {
    logger.info(`Serveur demarre sur le port ${PORT}`);
    console.log(`Serveur demarre avec succes sur http://localhost:${PORT}`);
  });
}

module.exports = app;
