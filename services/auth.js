const { UsersRepository } = require('../repositories');
const { SessionModel } = require('../model')
const jwt = require('jsonwebtoken');
require('dotenv').config();
const SECRET_KEY = process.env.SECRET_KEY;

class AuthService {
  constructor() {
    this.repositories = {
      users: new UsersRepository(),
    };
  }

  async login({ email, password }) {
    const user = await this.repositories.users.findByEmail(email);

    if (!user || !(await user.validPassword(password)) || !user.isVerified) {
      return null;
    }
    return user;
  }

  async logout(id) {
    const data = await this.repositories.users.updateToken(id, null);
    return data;
  }
}
module.exports = AuthService;
