const express = require('express');
const logger = require('morgan');
const cors = require('cors');

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { HttpCode } = require('./helpers');
const { apiLimit, jsonLimit } = require('./config/rate-limit.json');
const { ErrorHandler } = require('./helpers/error-handler');

const usersRouter = require('./routes/api/');

require('dotenv').config();

const app = express();

const formatsLogger = app.get('env') === 'development' ? 'dev' : 'short';

app.use(helmet());

app.get('env') !== 'test' && app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json({ limit: jsonLimit }));

app.use(
  '/api/',
  rateLimit({
    windowMs: apiLimit.windowMs,
    max: apiLimit.max,
    handler: (req, res, next) => {
      next(
        new ErrorHandler(
          HttpCode.BAD_REQUEST,
          'Исчерпано количество запросов за 15 минут',
        ),
      );
    },
  }),
);
app.use('/api/users', usersRouter);

app.use('/', (req, res) => {
  res.status(HttpCode.OK).json({
    status: 'success',
    code: HttpCode.Ok,
    message: `Use api on routes ${process.env.LINK_THIS_APP}/api/users`,
    data: 'Hello World',
  });
});

app.use((req, res) => {
  res.status(HttpCode.NOT_FOUND).json({
    status: 'error',
    code: HttpCode.NOT_FOUND,
    message: `Use api on routes ${req.baseUrl}/api/users`,
    data: 'Not found',
  });
});

app.use((err, req, res, next) => {
  err.status = err.status ? err.status : HttpCode.INTERNAL_SERVER_ERROR;
  res.status(err.status).json({
    status: err.status === 500 ? 'fail' : 'error',
    code: err.status,
    message: err.message,
    data: err.status === 500 ? 'Internal server error' : err.data,
  });
});

module.exports = app;
