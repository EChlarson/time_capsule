const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  capsuleId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Capsule',
  },
  imageData: {
    type: Buffer,
    required: true,
  },
  contentType: {
    type: String,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Media', mediaSchema);
