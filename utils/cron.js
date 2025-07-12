// utils/cron.js
const cron = require('node-cron');
const Capsule = require('../models/capsule');
const User = require('../models/user');
const { sendUnlockEmail } = require('./email');

const startEmailCron = () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('Email cron job disabled in non-production environment');
    return;
  }
  // checks every day at midnight
  cron.schedule('0 0 * * *', async () => {
    try {
      console.log('Checking for unlocked capsules...');
      const now = new Date();
      const capsules = await Capsule.find({
        revealDate: { $lte: now },
        notificationSent: false,
      });
      for (const capsule of capsules) {
        const user = await User.findById(capsule.userId);
        if (user) {
          await sendUnlockEmail(user, capsule);
          capsule.notificationSent = true;
          await capsule.save();
          console.log(`Notification sent for capsule ${capsule._id} to ${user.email}`);
        }
      }
      console.log(`Processed ${capsules.length} unlocked capsules`);
    } catch (err) {
      console.error('Cron job error:', err);
    }
  });
};

module.exports = { startEmailCron };