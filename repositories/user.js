const User = require('../model/user');

const findById = async id => {
  return await User.findById(id);
};

const findByEmail = async email => {
  return await User.findOne({ email });
};

const create = async body => {
  const user = new User(body);
  return await user.save();
};

const updateToken = async (id, token) => {
  return await User.updateOne({ _id: id }, { token });
};

const findByVerifyToken = async verifyToken => {
  return await User.findOne({ verifyToken });
};

const updateTokenVerify = async (id, verify, verifyToken) => {
  return await User.updateOne({ _id: id }, { verify, verifyToken });
};

module.exports = {
  findById,
  findByEmail,
  create,
  updateToken,
  findByVerifyToken,
  updateTokenVerify,
};

// const { UserSchema } = require('../model');

// class UsersRepository {
//   constructor() {
//     this.Model = UserSchema;
//   }

//   async findById(id) {
//     const result = await this.Model.findOne({ _id: id });
//     return result;
//   }

//   async findByEmail(email) {
//     const result = await this.Model.findOne({ email });
//     return result;
//   }

//   async findByVerifyToken(verifyToken) {
//     const result = await this.Model.findOne({ verifyToken });
//     return result;
//   }

//   async create(body) {
//     const user = new this.Model(body);
//     return user.save();
//   }

//   async updateToken(id, token) {
//     await this.Model.updateOne({ _id: id }, { token });
//   }

//   async updateTokenVerify(id, isVerified, verifyToken) {
//     await this.Model.updateOne({ _id: id }, { isVerified, verifyToken });
//   }
// }

// module.exports = UsersRepository;
