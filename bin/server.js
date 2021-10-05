const app = require('../app');

const db = require('../model/db');

require('dotenv').config();
const { PORT = 3000 } = process.env;

db.then(() => {
  return app.listen(PORT, async () => {
    console.log(`Server running. Use our API on port: ${PORT}`);
  });
}).catch(error => console.log(error.message));
