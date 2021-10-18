const { Schema, model } = require('mongoose');
const bcrypt = require('bcryptjs');
const id = require('shortid');

const SALT_FACTOR = 6;

const userSchema = new Schema(
  {
    name: {
      type: String,
      minlength: 3,
      default: 'Guest',
    },
    password: {
      type: String,
      default: null
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      validate(value) {
        const re = /\S+@\S+\.\S+/;
        return re.test(String(value).toLowerCase());
      },
    },
    googleId: {
      type: String,
      default: null
    },
    picture: {
      type: String,
      default: null
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifyToken: {
      type: String,
      default: id(),
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(
    this.password,
    bcrypt.genSaltSync(SALT_FACTOR),
  );
  next();
});

userSchema.pre('updateOne', async function (next) {
  if (this._update.password) {
    this._update.password = await bcrypt.hash(
      this._update.password,
      bcrypt.genSaltSync(SALT_FACTOR),
    );
  }
  next();
});

userSchema.methods.validPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = model('user', userSchema);

module.exports = User;
