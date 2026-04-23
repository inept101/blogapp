const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  emailVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  verificationTokenExpiry: { type: Date },
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.models.User || mongoose.model('User', userSchema);
module.exports = User;
