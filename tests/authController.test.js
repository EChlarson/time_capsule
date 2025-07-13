// tests/authController.test.js
const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const session = require('express-session');
const passport = require('passport');
const authRoutes = require('../routes/authRoutes');
const User = require('../models/user');

// Mock config/oauth.js to prevent GoogleStrategy initialization
jest.mock('../config/oauth', () => {
  const passportMock = {
    authenticate: jest.fn().mockImplementation(() => (req, res, next) => next()),
    initialize: jest.fn().mockReturnValue((req, res, next) => next()),
    session: jest.fn().mockReturnValue((req, res, next) => next()),
    serializeUser: jest.fn((user, done) => done(null, user.id)),
    deserializeUser: jest.fn((id, done) => done(null, null)),
  };
  return passportMock;
});

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

    // Create a test user
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

  test('GET /api/auth/user - should return user profile for authenticated user', async () => {
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
      req.user = user;
      req.isAuthenticated = () => !!req.user;
      next();
    });
    app.use('/api/auth', authRoutes);
    app.use((err, req, res, next) => {
      console.error('Test server error:', err.stack);
      res.status(500).json({ message: 'Test server error', error: err.message });
    });

    const res = await request(app).get('/api/auth/user');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('email', user.email);
    expect(res.body).toHaveProperty('username', user.username);
  });

  test('GET /api/auth/user - should return 401 if not authenticated', async () => {
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
      req.user = null;
      req.isAuthenticated = () => false;
      next();
    });
    app.use('/api/auth', authRoutes);
    app.use((err, req, res, next) => {
      console.error('Test server error:', err.stack);
      res.status(500).json({ message: 'Test server error', error: err.message });
    });

    const res = await request(app).get('/api/auth/user');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized: Please log in');
  });

  test('PUT /api/auth/update - should update username with valid data', async () => {
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
      req.user = user;
      req.isAuthenticated = () => !!req.user;
      next();
    });
    app.use('/api/auth', authRoutes);
    app.use((err, req, res, next) => {
      console.error('Test server error:', err.stack);
      res.status(500).json({ message: 'Test server error', error: err.message });
    });

    const newUsername = 'newuser123';
    const res = await request(app)
      .put('/api/auth/update')
      .send({ username: newUsername });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Username updated successfully');
    expect(res.body.user.username).toBe(newUsername);
    const updatedUser = await User.findById(user._id);
    expect(updatedUser.username).toBe(newUsername);
  });

  test('PUT /api/auth/update - should return 400 for missing username', async () => {
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
      req.user = user;
      req.isAuthenticated = () => !!req.user;
      next();
    });
    app.use('/api/auth', authRoutes);
    app.use((err, req, res, next) => {
      console.error('Test server error:', err.stack);
      res.status(500).json({ message: 'Test server error', error: err.message });
    });

    const res = await request(app)
      .put('/api/auth/update')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Username is required');
  });

  test('PUT /api/auth/update - should return 400 for invalid username format', async () => {
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
      req.user = user;
      req.isAuthenticated = () => !!req.user;
      next();
    });
    app.use('/api/auth', authRoutes);
    app.use((err, req, res, next) => {
      console.error('Test server error:', err.stack);
      res.status(500).json({ message: 'Test server error', error: err.message });
    });

    const res = await request(app)
      .put('/api/auth/update')
      .send({ username: 'ab' });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Username must be 3-20 characters and contain only letters, numbers, underscores, or hyphens');
  });

  test('PUT /api/auth/update - should return 400 for taken username', async () => {
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
      req.user = user;
      req.isAuthenticated = () => !!req.user;
      next();
    });
    app.use('/api/auth', authRoutes);
    app.use((err, req, res, next) => {
      console.error('Test server error:', err.stack);
      res.status(500).json({ message: 'Test server error', error: err.message });
    });

    await User.create({
      googleId: `other-google-id-${Date.now()}`,
      email: `other-${Date.now()}@example.com`,
      username: 'takenuser',
    });
    const res = await request(app)
      .put('/api/auth/update')
      .send({ username: 'takenuser' });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Username already taken');
  });

  test('PUT /api/auth/update - should return 401 if not authenticated', async () => {
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
      req.user = null;
      req.isAuthenticated = () => false;
      next();
    });
    app.use('/api/auth', authRoutes);
    app.use((err, req, res, next) => {
      console.error('Test server error:', err.stack);
      res.status(500).json({ message: 'Test server error', error: err.message });
    });

    const res = await request(app)
      .put('/api/auth/update')
      .send({ username: 'newuser123' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized: Please log in');
  });

  test('GET /api/auth/logout - should log out user', async () => {
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
    let mockReq;
    app.use((req, res, next) => {
      mockReq = req;
      req.user = user;
      req.isAuthenticated = () => !!req.user;
      req.logout = jest.fn((callback) => process.nextTick(() => callback(null)));
      req.session = {
        destroy: jest.fn((callback) => process.nextTick(() => callback(null))),
        touch: jest.fn(),
        save: jest.fn((callback) => process.nextTick(() => callback(null))),
        cookie: { secure: false },
      };
      next();
    });
    app.use('/api/auth', authRoutes);
    app.use((err, req, res, next) => {
      console.error('Test server error:', err.stack);
      res.status(500).json({ message: 'Test server error', error: err.message });
    });

    const server = app.listen();
    const res = await request(server).get('/api/auth/logout');
    server.close();
    expect(res.status).toBe(302);
    expect(res.header.location).toBe('/');
    expect(mockReq.logout).toHaveBeenCalled();
  });
});