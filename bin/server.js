const app = require("../app");
const { db } = require("../model");

const PORT = process.env.PORT || 3000;

db.then(() => {
  app.listen(PORT, () => {
    console.log(`Server running. Use our API on port: ${PORT}`);
  });
}).catch((evt) => {
  console.log(`Error: ${evt.message}`);
});
