const id = require('shortid');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const queryString = require('query-string');
const {
  AuthService,
  UserService,
  EmailService,
  CreateSenderNodemailer,
} = require('../services');
const { SessionModel, UserSchema } = require('../model');
const { UsersRepository } = require('../repositories');
const { httpCode } = require('../helpers');

require('dotenv').config();

const serviceUser = new UserService();
const serviceAuth = new AuthService();
const userRepository = new UsersRepository();

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
        },
      );
      const refreshToken = jwt.sign(
        { uid: user._id, sid: newSession._id },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.JWT_REFRESH_EXPIRE_TIME,
        },
      );
      return UserSchema.findOne({ email }).exec((err, data) => {
        if (err) {
          next(err);
        }
        return res.status(httpCode.OK).send({
          status: 'success',
          code: httpCode.OK,
          data: {
            headers: {
              accessToken,
              refreshToken,
              sid: newSession._id,
            },
            email: data.email,
            name: data.name,
            picture: data.picture,
            id: data._id,
            createdAt: data.createdAt,
          },
        });
      });
    } catch (e) {
      next(e);
    }
  } catch (e) {
    next(e);
  }
};
const authorize = async (req, res, next) => {
  try {
    const authorizationHeader = req.get('Authorization');
    if (authorizationHeader) {
      const accessToken = authorizationHeader.replace('Bearer ', '');
      let payload;
      try {
        payload = jwt.verify(accessToken, process.env.JWT_SECRET);
      } catch (err) {
        return res
          .status(httpCode.UNAUTHORIZED)
          .send({ message: 'Unauthorized' });
      }
      const user = await UserSchema.findById(payload.uid);
      const session = await SessionModel.findById(payload.sid);
      if (!user) {
        return res.status(httpCode.NOT_FOUND).send({ message: 'Invalid user' });
      }
      if (!session) {
        return res
          .status(httpCode.NOT_FOUND)
          .send({ message: 'Invalid session' });
      }
      req.user = user;
      req.session = session;
      next();
    } else
      return res
        .status(httpCode.BAD_REQUEST)
        .send({ message: 'No token provided' });
  } catch (e) {
    next(e.message);
  }
};
const logout = async (req, res) => {
  const currentSession = req.session;
  await SessionModel.deleteOne({ _id: currentSession._id });
  req.user = null;
  req.session = null;
  return res.status(httpCode.NO_CONTENT).end();
};
const refreshTokens = async (req, res) => {
  const authorizationHeader = req.get('Authorization');
  if (authorizationHeader) {
    const activeSession = await SessionModel.findById(req.body.sid);
    if (!activeSession) {
      return res
        .status(httpCode.NOT_FOUND)
        .send({ message: 'Invalid session' });
    }
    const reqRefreshToken = authorizationHeader.replace('Bearer ', '');
    let payload;
    try {
      payload = jwt.verify(reqRefreshToken, process.env.JWT_SECRET);
    } catch (err) {
      await SessionModel.findByIdAndDelete(req.body.sid);
      return res
        .status(httpCode.UNAUTHORIZED)
        .send({ message: 'Unauthorized' });
    }
    const user = await UserSchema.findById(payload.uid);
    const session = await SessionModel.findById(payload.sid);
    if (!user) {
      return res.status(httpCode.NOT_FOUND).send({ message: 'Invalid user' });
    }
    if (!session) {
      return res
        .status(httpCode.NOT_FOUND)
        .send({ message: 'Invalid session' });
    }
    await SessionModel.findByIdAndDelete(payload.sid);
    const newSession = await SessionModel.create({
      uid: user._id,
    });
    const accessToken = jwt.sign(
      { uid: user._id, sid: newSession._id },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_ACCESS_EXPIRE_TIME,
      },
    );
    const refreshToken = jwt.sign(
      { uid: user._id, sid: newSession._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRE_TIME },
    );
    return res.status(httpCode.OK).json({
      status: 'success',
      code: httpCode.OK,
      headers: { accessToken, refreshToken, sid: newSession._id },
    });
  }
  return res
    .status(httpCode.BAD_REQUEST)
    .send({ message: 'No token provided' });
};
const getCurrentUser = async (req, res, next) => {
  try {
    const authorizationHeader = req.get('Authorization');
    if (authorizationHeader) {
      const accessToken = authorizationHeader.replace('Bearer ', '');
      let payload;
      try {
        payload = jwt.verify(accessToken, process.env.JWT_SECRET);
      } catch (err) {
        return res
          .status(httpCode.UNAUTHORIZED)
          .send({ message: 'Unauthorized' });
      }
      const user = await UserSchema.findById(payload.uid);
      const session = await SessionModel.findById(payload.sid);
      if (!user) {
        return res.status(httpCode.NOT_FOUND).send({ message: 'Invalid user' });
      }
      if (!session) {
        return res
          .status(httpCode.NOT_FOUND)
          .send({ message: 'Invalid session' });
      }
      return res.status(httpCode.OK).send({
        status: 'success',
        code: httpCode.OK,
        data: {
          id: user.id,
          picture: user.picture,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
      });
    } else
      return res
        .status(httpCode.BAD_REQUEST)
        .send({ message: 'No token provided' });
  } catch (e) {
    next(e.message);
  }
};
const verify = async (req, res, next) => {
  try {
    const user = await userRepository.findByVerifyToken(req.params.token);

    if (!user) {
      return res.redirect(
        `${process.env.LINK_THIS_APP_FRONT}?verifyToken=false`,
      );
    }

    await new UsersRepository().updateTokenVerify(user.id, true, null);

    return res.redirect(`${process.env.LINK_THIS_APP_FRONT}?verifyToken=true`);
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
const googleAuth = async (req, res) => {
  const stringifiedParams = queryString.stringify({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: `${process.env.LINK_THIS_APP}/api/users/google-redirect`,
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ].join(' '),
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
  });
  return res.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${stringifiedParams}`,
  );
};
const googleRedirect = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
  const urlObj = new URL(fullUrl);
  const urlParams = queryString.parse(urlObj.search);
  const code = urlParams.code;
  const tokenData = await axios({
    url: `https://oauth2.googleapis.com/token`,
    method: 'post',
    data: {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${process.env.LINK_THIS_APP}/api/users/google-redirect`,
      grant_type: 'authorization_code',
      code,
    },
  });
  const userData = await axios({
    url: 'https://www.googleapis.com/oauth2/v2/userinfo',
    method: 'get',
    headers: {
      Authorization: `Bearer ${tokenData.data.access_token}`,
    },
  });

  const existingParent = await UserSchema.findOne({
    email: userData.data.email,
  });

  if (!existingParent) {
    return res.status(403).send({
      message:
        'You should register from front-end first (not postman). Google are only for sign-in',
    });
  }
  const newSession = await SessionModel.create({
    uid: existingParent._id,
  });
  const accessToken = jwt.sign(
    { uid: existingParent._id, sid: newSession._id },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRE_TIME,
    },
  );
  const refreshToken = jwt.sign(
    { uid: existingParent._id, sid: newSession._id },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRE_TIME,
    },
  );
  return res.redirect(
    `${process.env.LINK_THIS_APP_FRONT}login?accessToken=${accessToken}&refreshToken=${refreshToken}&sid=${newSession._id}`,
  );
};
const googleRegister = async (req, res, next) => {
  try {
    const { name, email, googleId, picture } = req.body;
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
      googleId,
      picture,
      isVerified: true,
      verifyToken: null,
    });
    try {
      const newSession = await SessionModel.create({
        uid: newUser._id,
      });

      const accessToken = jwt.sign(
        { uid: newUser._id, sid: newSession._id },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.JWT_ACCESS_EXPIRE_TIME,
        },
      );
      const refreshToken = jwt.sign(
        { uid: newUser._id, sid: newSession._id },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.JWT_REFRESH_EXPIRE_TIME,
        },
      );
      return await UserSchema.findOne({ email: newUser.email }).exec(
        (err, data) => {
          if (err) {
            next(err);
          }
          return res.status(httpCode.OK).send({
            status: 'success',
            code: httpCode.OK,
            data: {
              headers: {
                accessToken,
                refreshToken,
                sid: newSession._id,
              },
              email: data.email,
              name: data.name,
              id: data._id,
              picture: data.picture,
              createdAt: data.createdAt,
            },
          });
        },
      );
    } catch (e) {
      next(e);
    }
  } catch (error) {
    next(error);
  }
};

const forgotten = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await serviceUser.findByEmail(email);

    if (!user) {
      return res.status(httpCode.NOT_FOUND).json({
        status: 'error',
        code: httpCode.CONFLICT,
        message: 'Email not found',
      });
    }

    const newToken = id();

    await serviceUser.forgotten(user.id, newToken);

    try {
      const emailService = new EmailService(
        process.env.NODE_ENV,
        new CreateSenderNodemailer(),
      );
      await emailService.sendForgottenEmail(email, user.name, newToken);
    } catch (error) {
      console.log(error.message);
    }
    return res.status(httpCode.OK).json({
      status: 'success',
      code: httpCode.CREATED,
      data: { email },
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { password, verifyToken } = req.body;

    const user = await serviceUser.findByVerifyToken(verifyToken);

    if (!user) {
      return res.status(httpCode.NOT_FOUND).json({
        status: 'error',
        code: httpCode.CONFLICT,
        message: 'User not found',
      });
    }

    await serviceUser.resetPassword(user.id, password);

    return res.status(httpCode.OK).json({
      status: 'success',
      code: httpCode.CREATED,
      message: 'Password reset success',
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
  googleAuth,
  googleRedirect,
  forgotten,
  resetPassword,
  googleRegister,
};
