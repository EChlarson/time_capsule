// config/oauth.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          // Generate a default username from displayName or email
          let username = profile.displayName
            ? profile.displayName.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase() // Sanitize displayName
            : profile.emails[0].value.split('@')[0]; // Fallback to email prefix
          
          // If displayName is empty or results in an invalid username, use email prefix
          if (!username) {
            username = profile.emails[0].value.split('@')[0];
          }

          // Ensure username is unique
          let suffix = 1;
          let baseUsername = username;
          while (await User.findOne({ username })) {
            username = `${baseUsername}${suffix}`; // e.g., "johndoe1", "johndoe2"
            suffix++;
          }

          user = new User({
            googleId: profile.id,
            email: profile.emails[0].value,
            username, // Set generated username
            accessToken,
          });
          await user.save();
          console.log('New user created:', user);
        } else {
          user.accessToken = accessToken;
          await user.save();
          console.log('User updated:', user);
        }
        return done(null, user);
      } catch (err) {
        console.error('OAuth error:', err);
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;