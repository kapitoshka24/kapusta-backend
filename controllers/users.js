const {
  AuthService,
  UserService,
  EmailService,
  CreateSenderNodemailer,
} = require('../services');
const UsersRepository = require('../repositories');
const { httpCode } = require('../helpers/constants');

require('dotenv').config();

const serviceUser = new UserService();
const serviceAuth = new AuthService();

const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const user = await new UsersRepository().findByEmail(email);
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
    const token = await serviceAuth.login({ email, password });
    if (token) {
      return res.status(httpCode.OK).json({
        status: 'success',
        code: httpCode.OK,
        data: {
          token,
        },
      });
    }
    return res.status(httpCode.UNAUTHORIZED).json({
      status: 'error',
      code: httpCode.UNAUTHORIZED,
      message: 'Invalid credentials',
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const id = req.user.id;
    await serviceAuth.logout(id);
    return res.status(httpCode.NO_CONTENT).json({
      status: 'success',
      code: httpCode.NO_CONTENT,
      data: 'Not authorized',
    });
  } catch (error) {
    next(error);
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    const id = req.user.id;

    if (!id) {
      return res.status(httpCode.UNAUTHORIZED).json({
        status: 'error',
        code: httpCode.UNAUTHORIZED,
        message: 'Not authorized',
      });
    }

    const { name, email } = await serviceUser.findById(id);

    return res.status(httpCode.OK).json({
      status: 'success',
      code: httpCode.OK,
      data: {
        name,
        email,
      },
    });
  } catch (error) {
    next(error);
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
  logout,
  getCurrentUser,
  verify,
  repeatEmailVerification,
};
