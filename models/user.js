const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  accessToken: { type: String },
});

module.exports = mongoose.model('User', userSchema, 'tc_users');