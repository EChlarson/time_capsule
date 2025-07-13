// scripts/updateCapsules.js
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Capsule = require('../models/capsule');

async function updateCapsules() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Find capsules with revealDate <= now and notificationSent: false
    const now = new Date();
    const result = await Capsule.updateMany(
      {
        revealDate: { $lte: now },
        notificationSent: false,
      },
      { $set: { notificationSent: true } }
    );

    console.log(`Updated ${result.nModified} capsules`);
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (err) {
    console.error('Error updating capsules:', err);
  }
}

updateCapsules();