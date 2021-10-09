const jwt = require('jsonwebtoken');
const {
  AuthService,
  UserService,
  EmailService,
  CreateSenderNodemailer,
} = require('../services');
const { SessionModel, UserSchema } = require('../model')
const { UsersRepository } = require('../repositories');
const { httpCode } = require('../helpers');
require('dotenv').config();


const serviceUser = new UserService();
const serviceAuth = new AuthService();


const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const user = await serviceUser.findByEmail(email);
    if (user) {
      return res.status(httpCode.CONFLICT).json({
        status: 'error',
        code: httpCode.CONFLICT,
        message: 'This email is already use',
      });
    }

    const newUser = await serviceUser.create({
      name,
      email,
      password,
    });

    try {
      const emailService = new EmailService(
        process.env.NODE_ENV,
        new CreateSenderNodemailer(),
      );
      await emailService.sendVerifyEmail(
        newUser.verifyToken,
        newUser.email,
        newUser.name,
      );
    } catch (error) {
      console.log(error.message);
    }

    return res.status(httpCode.CREATED).json({
      status: 'success',
      code: httpCode.CREATED,
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await serviceAuth.login({ email, password });
    if (!user) {
      return res.status(httpCode.UNAUTHORIZED).json({
        status: 'error',
        code: httpCode.UNAUTHORIZED,
        message: 'Invalid credentials',
      });
    }
    try {
      const newSession = await SessionModel.create({
        uid: user._id,
      });

      const accessToken = jwt.sign(
        { uid: user._id, sid: newSession._id },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.JWT_ACCESS_EXPIRE_TIME,
        }
      );
      const refreshToken = jwt.sign(
        { uid: user._id, sid: newSession._id },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.JWT_REFRESH_EXPIRE_TIME,
        }
      );
      return UserSchema.findOne({ email }).exec((err, data) => {
        if (err) {
          next(err);
        }
        return res.status(200).send({
          accessToken,
          refreshToken,
          sid: newSession._id,
          data: {
            email: data.email,
            name: data.name,
            id: data._id
          },
        });
      });
    } catch (e) {
      next(e)
    }
  } catch (error) {
    next(error);
  }
};
const authorize = async (req, res, next) => {
  try {
    const authorizationHeader = req.get("Authorization");
    if (authorizationHeader) {
      const accessToken = authorizationHeader.replace("Bearer ", "");
      let payload;
      try {
        payload = jwt.verify(accessToken, process.env.JWT_SECRET);
      } catch (err) {
        return res.status(401).send({ message: "Unauthorized" });
      }
      const user = await UserSchema.findById((payload).uid);
      const session = await SessionModel.findById((payload).sid);
      if (!user) {
        return res.status(404).send({ message: "Invalid user" });
      }
      if (!session) {
        return res.status(404).send({ message: "Invalid session" });
      }
      req.user = user;
      req.session = session;
      next();
    } else return res.status(400).send({ message: "No token provided" });
  } catch (e) {
    next(e.message)
  }

};
const logout = async (req, res) => {
  const currentSession = req.session;
  await SessionModel.deleteOne({ _id: (currentSession)._id });
  req.user = null;
  req.session = null;
  return res.status(204).end();
};
const refreshTokens = async (req, res) => {
  const authorizationHeader = req.get("Authorization");
  if (authorizationHeader) {
    const activeSession = await SessionModel.findById(req.body.sid);
    if (!activeSession) {
      return res.status(404).send({ message: "Invalid session" });
    }
    const reqRefreshToken = authorizationHeader.replace("Bearer ", "");
    let payload;
    try {
      payload = jwt.verify(reqRefreshToken, process.env.JWT_SECRET);
    } catch (err) {
      await SessionModel.findByIdAndDelete(req.body.sid);
      return res.status(401).send({ message: "Unauthorized" });
    }
    const user = await UserSchema.findById((payload).uid);
    const session = await SessionModel.findById((payload).sid);
    if (!user) {
      return res.status(404).send({ message: "Invalid user" });
    }
    if (!session) {
      return res.status(404).send({ message: "Invalid session" });
    }
    await SessionModel.findByIdAndDelete((payload).sid);
    const newSession = await SessionModel.create({
      uid: user._id,
    });
    const newAccessToken = jwt.sign(
      { uid: user._id, sid: newSession._id },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_ACCESS_EXPIRE_TIME,
      }
    );
    const newRefreshToken = jwt.sign(
      { uid: user._id, sid: newSession._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRE_TIME }
    );
    return res
      .status(200)
      .send({ newAccessToken, newRefreshToken, newSid: newSession._id });
  }
  return res.status(400).send({ message: "No token provided" });
};

const getCurrentUser = async (req, res, next) => {
  try {
    const authorizationHeader = req.get("Authorization");
    if (authorizationHeader) {
      const accessToken = authorizationHeader.replace("Bearer ", "");
      let payload;
      try {
        payload = jwt.verify(accessToken, process.env.JWT_SECRET);
      } catch (err) {
        return res.status(401).send({ message: "Unauthorized" });
      }
      const user = await UserSchema.findById((payload).uid);
      const session = await SessionModel.findById((payload).sid);
      if (!user) {
        return res.status(404).send({ message: "Invalid user" });
      }
      if (!session) {
        return res.status(404).send({ message: "Invalid session" });
      }
      return res.status(200).send({
        status: 'success',
        code: 200,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });


    } else return res.status(400).send({ message: "No token provided" });
  } catch (e) {
    next(e.message)
  }
};
const verify = async (req, res, next) => {
  try {
    const user = await new UsersRepository().findByVerifyToken(
      req.params.token,
    );

    if (!user) {
      return res.status(httpCode.BAD_REQUEST).json({
        status: 'error',
        code: httpCode.BAD_REQUEST,
        message: 'Verification token is valid',
      });
    }

    await new UsersRepository().updateTokenVerify(user.id, true, null);

    return res.status(httpCode.OK).json({
      status: 'success',
      code: httpCode.OK,
      data: {
        message: 'Verification successful!',
      },
    });
  } catch (error) {
    next(error);
  }
};
const repeatEmailVerification = async (req, res, next) => {
  try {
    const user = await new UsersRepository().findByEmail(req.body.email);

    if (!user) {
      return res.status(httpCode.NOT_FOUND).json({
        status: 'error',
        code: httpCode.NOT_FOUND,
        message: 'User not found',
      });
    }

    const { name, email, isVerified, verifyToken } = user;
    if (!isVerified) {
      const emailService = new EmailService(
        process.env.NODE_ENV,
        new CreateSenderNodemailer(),
      );
      await emailService.sendVerifyEmail(verifyToken, email, name);
      return res.status(httpCode.OK).json({
        status: 'success',
        code: httpCode.OK,
        data: { message: 'Verification email sent' },
      });
    }
    return res.status(httpCode.BAD_REQUEST).json({
      status: 'error',
      code: httpCode.BAD_REQUEST,
      message: 'Verification has already been passed',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login,
  authorize,
  refreshTokens,
  logout,
  getCurrentUser,
  verify,
  repeatEmailVerification,
};
