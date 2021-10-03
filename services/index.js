const AuthService = require('./auth')
const UserService = require('./user')
const CreateSenderNodemailer = require('./email-send')
const EmailService = require('./email')

module.exports = { AuthService, UserService, CreateSenderNodemailer, EmailService }