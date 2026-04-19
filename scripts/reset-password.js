require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/user");

const USERNAME = process.argv[2];
const NEW_PASSWORD = process.argv[3];

if (!USERNAME || !NEW_PASSWORD) {
  console.error(
    "Usage: node scripts/reset-password.js <username> <newpassword>",
  );
  process.exit(1);
}

mongoose
  .connect(process.env.DB_URL)
  .then(async () => {
    const user = await User.findOne({ username: USERNAME });
    if (!user) {
      console.error(`User "${USERNAME}" not found`);
      process.exit(1);
    }
    await user.setPassword(NEW_PASSWORD);
    await user.save();
    console.log(`Password for "${USERNAME}" updated successfully`);
    process.exit(0);
  })
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
