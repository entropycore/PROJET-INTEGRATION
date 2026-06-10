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
<<<<<<< HEAD
      from: process.env.MAIL_FROM || `"Credencia Support" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
=======
      from: `"ValiDia Support" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      text: text,
>>>>>>> ec494d43e1efa6db5265096db1c1b6edae1faaa5
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email envoyé avec succès à : ${to}`);
  } catch (error) {
    console.error(`Erreur lors de l'envoi de l'email à ${to}:`, error.message);
    throw new Error("Échec de l'envoi de l'email de vérification.");
  }
};

module.exports = sendEmail;