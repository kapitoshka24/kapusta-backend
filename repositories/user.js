const { UserSchema } = require('../model');

class UsersRepository {
  constructor() {
    this.Model = UserSchema;
  }

  async findById(id) {
    const result = await this.Model.findOne({ _id: id });
    return result;
  }

  async findByEmail(email) {
    const result = await this.Model.findOne({ email });
    return result;
  }

  async findByVerifyToken(verifyToken) {
    const result = await this.Model.findOne({ verifyToken });
    return result;
  }

  async create(body) {
    const user = new this.Model(body);
    return user.save();
  }

  async updateTokenVerify(_id, isVerified, verifyToken) {
    return await this.Model.updateOne({ _id }, { isVerified, verifyToken });
  }

  async resetPassword(_id, password) {
    return await this.Model.updateOne({ _id }, { password, verifyToken: null });
  }
}

module.exports = UsersRepository;
