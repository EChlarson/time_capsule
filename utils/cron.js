// utils/cron.js
const cron = require('node-cron');
const Capsule = require('../models/capsule');
const User = require('../models/user');
const { sendUnlockEmail } = require('./email');

const startEmailCron = () => {
  // Run every hour at minute 0 (e.g., 1:00, 2:00)
  cron.schedule('0 * * * *', async () => {
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
        } else {
          console.log(`No user found for capsule ${capsule._id}`);
        }
      }
      console.log(`Processed ${capsules.length} unlocked capsules`);
    } catch (err) {
      console.error('Cron job error:', err);
    }
  });
};

module.exports = { startEmailCron };