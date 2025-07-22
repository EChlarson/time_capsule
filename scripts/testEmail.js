// scripts/testEmail.js
require('dotenv').config();
const { sendUnlockEmail } = require('../utils/email');

async function testEmail() {
  try {
    await sendUnlockEmail(

      // Replace with a valid user email for testing      
      { email: 'enter email here', username: 'testuser' },
      { title: 'Test Capsule', revealDate: new Date() }
    );
    console.log('Test email sent');
  } catch (err) {
    console.error('Test email failed:', err);
  }
}

testEmail();

// To run this script, use the command: node scripts/testEmail.js