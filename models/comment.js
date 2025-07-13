const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  capsuleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Capsule', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Comment', commentSchema);
