'use strict';

const nodemailer = require('nodemailer');

const buildTransportConfig = () => {
  const service = process.env.EMAIL_SERVICE || 'gmail';

  return {
    service,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  };
};

const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport(buildTransportConfig());

    const mailOptions = {
      from: process.env.MAIL_FROM || `"Credencia Support" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`Erreur lors de l'envoi de l'email à ${to}:`, error.message);
    throw new Error("Échec de l'envoi de l'email de vérification.", { cause: error });
  }
};

module.exports = sendEmail;
