require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');


const corsOptions = require('./middlewares/corsOptions');
const securityHeaders = require('./middlewares/securityHeaders');
const redirectHttps = require('./middlewares/redirectHttps');
const { handleErrors, notFound } = require('./middlewares/handleErrors');
const logger = require('./logs/logger');


const authRoutes = require('./routes/authRoutes');

const app = express();


app.use(securityHeaders);
app.use(corsOptions);
app.use(redirectHttps);


app.use(express.json());
app.use(cookieParser());


app.use('/api/auth', authRoutes);


app.use(notFound);
app.use(handleErrors);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Serveur démarré sur le port ${PORT}`);
  console.log(`Serveur démarré avec succès sur http://localhost:${PORT}`);
});