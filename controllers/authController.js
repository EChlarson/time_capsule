// controllers/authController.js
const passport = require('../config/oauth');
const User = require('../models/user');

exports.login = passport.authenticate('google', {
  scope: ['profile', 'email'],
});

exports.callback = passport.authenticate('google', {
  failureRedirect: '/login.html',
  successRedirect: '/dashboard.html',
});

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

exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
};

exports.updateUsername = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: Please log in' });
    }
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }
    // Validate username format (e.g., 3-20 characters, alphanumeric with underscores/hyphens)
    if (!/^[a-zA-Z0-9_-]{3,20}$/.test(username)) {
      return res.status(400).json({ message: 'Username must be 3-20 characters and contain only letters, numbers, underscores, or hyphens' });
    }
    // Check if username is already taken by another user
    const existingUser = await User.findOne({ username });
    if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
      return res.status(400).json({ message: 'Username already taken' });
    }
    // Update the user's username
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { username },
      { new: true, runValidators: true }
    );
    res.json({
      message: 'Username updated successfully',
      user: { email: user.email, username: user.username },
    });
  } catch (err) {
    console.error('Update username error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};