const passport = require('../config/oauth');

exports.login = passport.authenticate('google', {
  scope: ['profile', 'email'],
});

exports.callback = passport.authenticate('google', {
  failureRedirect: '/api/auth/login',
  successRedirect: '/api/capsules',
});

exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      next(err); // Pass error to error handler
      return;
    }
    res.redirect('/');
  });
};
