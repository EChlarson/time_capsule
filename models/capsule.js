const mongoose = require('mongoose');

const capsuleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String,
  message: String,
  imageUrl: String,
  revealDate: Date,
  isPrivate: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Capsule', capsuleSchema);
