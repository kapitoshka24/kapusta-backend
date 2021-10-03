const nodemailer = require('nodemailer')
require('dotenv').config()


console.log(process.env.USER_EMAIL)
console.log(process.env.PASS_EMAIL)

class CreateSenderNodemailer {
    async send(msg) {
        const config = {
            host: 'smtp.meta.ua',
            port: 465,
            secure: true,
            auth: {
                user: process.env.USER_EMAIL,
                pass: process.env.PASS_EMAIL
            }
        }
        const transporter = nodemailer.createTransport(config)
        return await transporter.sendMail({ ...msg, from: process.env.USER_EMAIL })
    }
}

module.exports = CreateSenderNodemailer