const mongoose = require('mongoose');
require('dotenv').config();
let uriDb = null;

if (process.env.NODE_ENV === 'test') {
  uriDb = process.env.URI_DB_TEST;
} else {
  uriDb = process.env.URI_DB;
}

const db = mongoose.connect(uriDb);

mongoose.connection.on('connected', () => {
  console.log('Database connection successful');
});

mongoose.connection.on('error', evt => {
  console.log(`Error database connection: ${evt.message}`);
});

mongoose.connection.on('disconnected', () => {
  console.log('Database connection terminated');
});

process.on('SIGINT', async () => {
  mongoose.connection.close(() => {
    console.log('Database connection terminated');
    process.exit(1);
  });
});

module.exports = db;
