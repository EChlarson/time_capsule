const passport = require('../config/oauth');
const User = require('../models/user');

// Login with Google
exports.login = passport.authenticate('google', {
  scope: ['profile', 'email'],
});

// Google OAuth callback
exports.callback = passport.authenticate('google', {
  failureRedirect: '/login.html',
  successRedirect: '/dashboard.html',
});

// Get current logged-in user info
exports.getUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: Please log in' });
    }
    res.json({
      email: req.user.email,
      username: req.user.username,
    });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update username from settings page
exports.updateUsername = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: Please log in' });
    }

    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }

    // Optional: validate username format
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({
        message: 'Username must be 3–20 characters and only include letters, numbers, _ or -',
      });
    }

    // Ensure uniqueness across users
    const existingUser = await User.findOne({ username });
    if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { username },
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Username updated successfully',
      user: {
        email: updatedUser.email,
        username: updatedUser.username,
      },
    });
  } catch (err) {
    console.error('Update username error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Logout
exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect('/');
  });
};