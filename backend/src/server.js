require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');


const corsOptions = require('./middlewares/corsOptions');
const securityHeaders = require('./middlewares/securityHeaders');
const redirectHttps = require('./middlewares/redirectHttps');
const { handleErrors, notFound } = require('./middlewares/handleErrors');
const logger = require('./logs/logger');


const authRoutes = require('./routes/authRoutes');
const professionalRoutes = require('./routes/professionalRoutes');
const studentRoutes = require('./routes/studentRoutes');
const professorRoutes = require('./routes/professorRoutes');
const administratorRoutes = require('./routes/administratorRoutes');

const app = express();


app.use(securityHeaders);
app.use(corsOptions);
app.use(redirectHttps);


app.use(express.json());
app.use(cookieParser());


app.use('/api/auth', authRoutes);
app.use('/api/professional', professionalRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/professor', professorRoutes);
app.use('/api/admin', administratorRoutes);


app.use(notFound);
app.use(handleErrors);


const PORT = process.env.BACKEND_PORT;
app.listen(PORT, () => {
  logger.info(`Serveur démarré sur le port ${PORT}`);
  console.log(`Serveur démarré avec succès sur http://localhost:${PORT}`);
});
