const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const logger = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { jsonLimit } = require('./config/rate-limit.json');
const boolParser = require('express-query-boolean');
const { httpCode, limiterAPI } = require('./helpers/constants');

require('dotenv').config();

const app = express();

const formatsLogger = app.get('env') === 'development' ? 'dev' : 'short';

app.use(helmet());
app.use(express.static('public'));
app.get('env') !== 'test' && app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json({ limit: jsonLimit }));
app.use(boolParser());

app.use('/api/', rateLimit(limiterAPI));
app.use('/api/', require('./routes/api'));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


app.use((_, res) => {
  res
    .status(httpCode.NOT_FOUND)
    .json({ status: 'error', code: httpCode.NOT_FOUND, message: 'Not found' });
});

app.use((err, req, res, next) => {
  err.status = err.status ? err.status : httpCode.INTERNAL_SERVER_ERROR;
  res.status(err.status).json({
    status: err.status === 500 ? 'fail' : 'error',
    code: err.status,
    message: err.message,
    data: err.status === 500 ? 'Internal server error' : err.data,
  });
});

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = app;
