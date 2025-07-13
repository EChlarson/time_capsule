// utils/email.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendUnlockEmail = async (user, capsule) => {
  const dashboardUrl = 'https://time-capsule-3kgt.onrender.com/dashboard.html';
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: 'Your FutureMail Message Is Unlocked!',
    html: `
      <h3>Hello ${user.username || 'User'},</h3>
      <p>Your time capsule message "<strong>${capsule.title}</strong>" is now unlocked!</p>
      <p><strong>Reveal Date:</strong> ${new Date(capsule.revealDate).toLocaleDateString()}</p>
      <p>View it on your <a href="${dashboardUrl}">FutureMail Dashboard</a>.</p>
      <p>Thank you for using FutureMail!</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${user.email} for capsule ${capsule.title}`);
  } catch (err) {
    console.error(`Error sending email to ${user.email}:`, err);
    throw err;
  }
};

module.exports = { sendUnlockEmail };