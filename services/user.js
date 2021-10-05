const usersRepository = require('../repositories/user');

class UserService {
  constructor() {
    this.repositories = {
      users: usersRepository,
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
}
module.exports = UserService;
