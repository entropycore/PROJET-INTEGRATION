'use strict';

const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, 
      },
    });

    const mailOptions = {
      from: `"ValiDia Support" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      text: text,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email envoyé avec succès à : ${to}`);
  } catch (error) {
    console.error(`Erreur lors de l'envoi de l'email à ${to}:`, error.message);
    throw new Error("Échec de l'envoi de l'email de vérification.");
  }
};

module.exports = sendEmail;