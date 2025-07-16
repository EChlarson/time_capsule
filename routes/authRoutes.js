const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth'); // middleware to protect user routes

// Google OAuth login flow
router.get('/login', authController.login);
router.get('/callback', authController.callback);

// Get the currently logged-in user's info (requires auth)
router.get('/user', auth, authController.getUser);

// Update the current user's username (requires auth)
router.put('/update', auth, authController.updateUsername);

// Log out
router.get('/logout', authController.logout);

module.exports = router;
