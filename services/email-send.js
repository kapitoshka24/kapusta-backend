const nodemailer = require('nodemailer');
require('dotenv').config();

class CreateSenderNodemailer {
  async send(msg) {
    const config = {
      host: process.env.HOST_EMAIL ?? 'smtp.meta.ua',
      port: 465,
      secure: true,
      auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.PASS_EMAIL,
      },
    };
    const transporter = nodemailer.createTransport(config);
    return await transporter.sendMail({ ...msg, from: process.env.USER_EMAIL });
  }
}

module.exports = CreateSenderNodemailer;
