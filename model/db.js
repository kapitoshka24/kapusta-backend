const mongoose = require('mongoose');
const { message } = require('../helpers/constants');
require('dotenv').config();
let uriDb = null;

if (process.env.NODE_ENV === 'test') {
  uriDb = process.env.URI_DB_TEST;
} else {
  uriDb = process.env.URI_DB;
}

const db = mongoose.connect(uriDb, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.on('connected', () =>
  console.log(message.DB_CONNECT_SUCCESS),
);
mongoose.connection.on('error', e => {
  console.log(`${message.DB_CONNECT_ERROR} ${e.message}`);
  process.exit(1);
});
mongoose.connection.on('disconnected', () =>
  console.log(message.DB_CONNECT_TERMINATED),
);
process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.log('Connection for DB disconnected and terminated')
    process.exit(1)
  })
})
module.exports = db;
