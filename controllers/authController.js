const passport = require('../config/oauth');

exports.login = passport.authenticate('google', {
  scope: ['profile', 'email'],
});

exports.callback = passport.authenticate('google', {
  failureRedirect: '/api/auth/login',
  successRedirect: '/api/capsules', // Redirect to capsules after login
});

exports.logout = (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.redirect('/');
  });
};