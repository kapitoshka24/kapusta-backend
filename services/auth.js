const { UsersRepository } = require('../repositories');
require('dotenv').config();

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
