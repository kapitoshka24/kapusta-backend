const { UsersRepository } = require('../repositories');
class UserService {
  constructor() {
    this.repositories = {
      users: new UsersRepository(),
    };
  }

  async create(body) {
    const data = await this.repositories.users.create(body);
    return data;
  }

  async findByEmail(email) {
    const data = await this.repositories.users.findByEmail(email);
    return data;
  }

  async findById(id) {
    const data = await this.repositories.users.findById(id);
    return data;
  }

  async findByVerifyToken(token) {
    return await this.repositories.users.findByVerifyToken(token);
  }

  async forgotten(id, token) {
    return await this.repositories.users.updateTokenVerify(id, true, token);
  }

  async resetPassword(id, password) {
    return await this.repositories.users.resetPassword(id, password);
  }
}
module.exports = UserService;
