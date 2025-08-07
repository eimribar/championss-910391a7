const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const MicrosoftStrategy = require('passport-microsoft').Strategy;
const { prisma } = require('../lib/supabase');

// List of personal email domains to block
const PERSONAL_EMAIL_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'aol.com',
  'icloud.com',
  'me.com',
  'mac.com',
  'live.com',
  'msn.com',
  'mail.com',
  'ymail.com',
  'rocketmail.com',
  'gmx.com',
  'protonmail.com',
  'proton.me',
  'tutanota.com',
  'zoho.com',
  'fastmail.com',
  'hushmail.com',
  'mailfence.com',
  'runbox.com',
  'posteo.de',
  'disroot.org'
];

// Validate work email
function isWorkEmail(email) {
  const domain = email.split('@')[1].toLowerCase();
  return !PERSONAL_EMAIL_DOMAINS.includes(domain);
}

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      
      // Check if it's a work email
      if (!isWorkEmail(email)) {
        return done(new Error('Personal email addresses are not allowed. Please use your work email.'), null);
      }

      // Find or create user
      let user = await prisma.user.findUnique({ where: { email } });
      
      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            fullName: profile.displayName,
            googleId: profile.id,
            profilePicture: profile.photos[0]?.value,
            emailVerified: true,
            authProvider: 'GOOGLE'
          }
        });
      } else {
        // Update existing user
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: profile.id,
            profilePicture: profile.photos[0]?.value || user.profilePicture,
            emailVerified: true,
            lastLogin: new Date()
          }
        });
      }

      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));

// Microsoft OAuth Strategy
passport.use(new MicrosoftStrategy({
    clientID: process.env.MICROSOFT_CLIENT_ID,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
    callbackURL: "/api/auth/microsoft/callback",
    scope: ['user.read'],
    tenant: 'common',
    authorizationURL: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenURL: 'https://login.microsoftonline.com/common/oauth2/v2.0/token'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      
      // Check if it's a work email
      if (!isWorkEmail(email)) {
        return done(new Error('Personal email addresses are not allowed. Please use your work email.'), null);
      }

      // Find or create user
      let user = await prisma.user.findUnique({ where: { email } });
      
      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            fullName: profile.displayName,
            microsoftId: profile.id,
            profilePicture: profile.photos?.[0]?.value,
            emailVerified: true,
            authProvider: 'MICROSOFT'
          }
        });
      } else {
        // Update existing user
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            microsoftId: profile.id,
            profilePicture: profile.photos?.[0]?.value || user.profilePicture,
            emailVerified: true,
            lastLogin: new Date()
          }
        });
      }

      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));

module.exports = { passport, isWorkEmail };