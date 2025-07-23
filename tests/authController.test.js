const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const session = require('express-session');
const passport = require('passport');
const authRoutes = require('../routes/authRoutes');
const User = require('../models/user');

// Mock Google OAuth setup
jest.mock('../config/oauth', () => ({
  authenticate: jest.fn(() => (req, res, next) => next()),
  initialize: jest.fn(() => (req, res, next) => next()),
  session: jest.fn(() => (req, res, next) => next()),
  serializeUser: jest.fn((user, done) => done(null, user.id)),
  deserializeUser: jest.fn((id, done) => done(null, null)),
  touch: jest.fn(),
}));

let mongoServer, user;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Auth Controller', () => {
  beforeEach(async () => {
    await User.deleteMany({});
    user = await User.create({
      googleId: `test-google-id-${Date.now()}`,
      email: `test-${Date.now()}@example.com`,
      username: `testuser-${Date.now()}`,
      name: 'Test User',
    });
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  function createApp(mockUser = null, extraSetup = null) {
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(
      session({
        secret: 'test-secret',
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false },
      })
    );
    app.use(passport.initialize());
    app.use(passport.session());

    app.use((req, res, next) => {
      req.user = mockUser;
      req.isAuthenticated = () => !!mockUser;
      if (extraSetup) extraSetup(req);
      next();
    });

    app.use('/api/auth', authRoutes);
    app.use((err, req, res, next) => {
      console.error('Test server error:', err.stack);
      res.status(500).json({ message: 'Test server error', error: err.message });
    });
    return app;
  }

  test('GET /api/auth/user - returns user profile if authenticated', async () => {
    const app = createApp(user);
    const res = await request(app).get('/api/auth/user');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('email', user.email);
    expect(res.body).toHaveProperty('username', user.username);
  });

  test('GET /api/auth/user - returns 401 if not authenticated', async () => {
    const app = createApp(null);
    const res = await request(app).get('/api/auth/user');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized: Please log in');
  });

  test('PUT /api/auth/update - updates username with valid data', async () => {
    const app = createApp(user);
    const res = await request(app)
      .put('/api/auth/update')
      .send({ username: 'newuser123' });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Username updated successfully');
    expect(res.body.user.username).toBe('newuser123');

    const updatedUser = await User.findById(user._id);
    expect(updatedUser.username).toBe('newuser123');
  });

  test('PUT /api/auth/update - returns 400 for missing username', async () => {
    const app = createApp(user);
    const res = await request(app).put('/api/auth/update').send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Username is required');
  });

  test('PUT /api/auth/update - returns 400 for invalid username format', async () => {
    const app = createApp(user);
    const res = await request(app)
      .put('/api/auth/update')
      .send({ username: 'ab' });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Username must be 3–20 characters and only include letters, numbers, _ or -');
  });

  test('PUT /api/auth/update - returns 400 if username is already taken', async () => {
    await User.create({
      googleId: `other-google-id-${Date.now()}`,
      email: `other-${Date.now()}@example.com`,
      username: 'takenuser',
    });

    const app = createApp(user);
    const res = await request(app)
      .put('/api/auth/update')
      .send({ username: 'takenuser' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Username already taken');
  });

  test('PUT /api/auth/update - returns 401 if not authenticated', async () => {
    const app = createApp(null);
    const res = await request(app)
      .put('/api/auth/update')
      .send({ username: 'newuser123' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized: Please log in');
  });

test('GET /api/auth/logout - should log out user and redirect to "/"', async () => {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(session({
    secret: 'test-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
  }));
  app.use(passport.initialize());
  app.use(passport.session());

  const destroyMock = jest.fn(cb => cb(null));
  const saveMock = jest.fn(cb => cb(null));
  const logoutMock = jest.fn(function (cb) {
    cb(null); // simulate successful logout
    // simulate side-effect that the controller expects
    this.session.destroy(() => {});
  });

  app.use((req, res, next) => {
    req.user = { _id: 'mock-user-id' };
    req.isAuthenticated = () => true;
    req.logout = logoutMock;
    req.session = {
      destroy: destroyMock,
      save: saveMock,
      touch: jest.fn(),
      cookie: {},
    };
    next();
  });

  app.use('/api/auth', authRoutes);
  app.use((err, req, res, next) => {
    console.error('Test server error:', err.stack);
    res.status(500).json({ message: 'Test server error', error: err.message });
  });

  const res = await request(app).get('/api/auth/logout');

  expect(res.status).toBe(302);
  expect(res.headers.location).toBe('/');
  expect(logoutMock).toHaveBeenCalled();
  expect(destroyMock).toHaveBeenCalled();
  expect(saveMock).toHaveBeenCalled();
});
});