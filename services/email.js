const Mailgen = require('mailgen');
require('dotenv').config();

class EmailService {
  constructor(env, sender) {
    this.sender = sender;
    switch (env) {
      case 'development':
        this.link = 'http://localhost:3000';
        break;
      case 'production':
        this.link = process.env.LINK_THIS_APP;
        break;
      default:
        this.link = 'http://localhost:3000';
        break;
    }
  }

  #createTemplateVerificationEmail(verifyToken, name) {
    const mailGenerator = new Mailgen({
      theme: 'cerberus',
      product: {
        name: 'Kapusta System',
        link: this.link,
      },
    });
    const email = {
      body: {
        name,
        intro:
          "Welcome to Kapusta system! We're very excited to have you on board.",
        action: {
          instructions: 'To get started with Kapusta, please click here:',
          button: {
            color: '#22BC66',
            text: 'Confirm your account',
            link: `${this.link}/api/users/verify/${verifyToken}`,
          },
        },
        outro:
          "Need help, or have questions? Just reply to this email, we'd love to help.",
      },
    };
    return mailGenerator.generate(email);
  }

  #createTemplateForgottenEmail(name, token) {
    const mailGenerator = new Mailgen({
      theme: 'cerberus',
      product: {
        name: 'Kapusta System',
        link: this.link,
      },
    });
    const email = {
      body: {
        name,
        intro:
          'There was a request to change your password! <br/>If you did not make this request then please ignore this email.',
        action: {
          instructions:
            'Otherwise, please click this button to change your password:',
          button: {
            color: '#22BC66',
            text: 'Change',
            link: `${process.env.LINK_THIS_APP_FRONT}resetPassword/${token}`,
          },
        },
        outro:
          "Need help, or have questions? Just reply to this email, we'd love to help.",
      },
    };
    return mailGenerator.generate(email);
  }

  async sendVerifyEmail(verifyToken, email, name) {
    const emailHtml = this.#createTemplateVerificationEmail(verifyToken, name);
    const msg = {
      to: email,
      subject: 'Verify your contact',
      html: emailHtml,
    };
    await this.sender.send(msg);
  }

  async sendForgottenEmail(email, name, token) {
    const emailHtml = this.#createTemplateForgottenEmail(name, token);
    const msg = {
      to: email,
      subject: 'Reset password',
      html: emailHtml,
    };
    await this.sender.send(msg);
  }
}

module.exports = EmailService;
