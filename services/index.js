const AuthService = require('./auth');
const UserService = require('./user');
const EmailService = require('./email');
const CreateSenderNodemailer = require('./email-send');

module.exports = {
  AuthService,
  UserService,
  EmailService,
  CreateSenderNodemailer,
};
