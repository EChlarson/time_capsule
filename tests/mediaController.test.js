const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mediaRoutes = require('../routes/mediaRoutes');
const Media = require('../models/media');
const User = require('../models/user');

let mongoServer, user, mediaId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Media Controller', () => {
  beforeEach(async () => {
    await User.deleteMany({});
    await Media.deleteMany({});

    user = await User.create({
      googleId: `test-google-id-${Date.now()}`,
      email: `test-${Date.now()}@example.com`,
      username: `testuser-${Date.now()}`,
      name: 'Test User',
    });

    // Create test media document
    const media = await Media.create({
      userId: user._id,
      filename: 'test-image.jpg',
      url: '/uploads/test-image.jpg',
      mimeType: 'image/jpeg',
    });
    mediaId = media._id.toString();
  });

  afterEach(async () => {
    await Media.deleteMany({});
    await User.deleteMany({});
  });

  test('POST /api/media - should upload a media file', async () => {
    const app = express();
    app.use(express.json());
    app.use((req, res, next) => {
      req.user = user;
      req.isAuthenticated = () => true;
      next();
    });
    app.use('/api/media', mediaRoutes);
    app.use((err, req, res, next) => {
      res.status(500).json({ message: err.message });
    });

    const testFilePath = path.join(__dirname, 'fixtures', 'test-image.jpg');

    const res = await request(app)
      .post('/api/media')
      .attach('file', testFilePath);

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Media uploaded successfully');
    expect(res.body.media).toHaveProperty('filename', 'test-image.jpg');
    expect(res.body.media).toHaveProperty('userId', user._id.toString());
  });

  test('POST /api/media - should return 401 if unauthenticated', async () => {
    const app = express();
    app.use(express.json());
    app.use((req, res, next) => {
      req.user = null;
      req.isAuthenticated = () => false;
      next();
    });
    app.use('/api/media', mediaRoutes);
    app.use((err, req, res, next) => {
      res.status(500).json({ message: err.message });
    });

    const testFilePath = path.join(__dirname, 'fixtures', 'test-image.jpg');

    const res = await request(app)
      .post('/api/media')
      .attach('file', testFilePath);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized: Please log in');
  });

  test('GET /api/media/:id - should return media info', async () => {
    const app = express();
    app.use(express.json());
    app.use((req, res, next) => {
      req.user = user;
      req.isAuthenticated = () => true;
      next();
    });
    app.use('/api/media', mediaRoutes);
    app.use((err, req, res, next) => {
      res.status(500).json({ message: err.message });
    });

    const res = await request(app).get(`/api/media/${mediaId}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('filename', 'test-image.jpg');
    expect(res.body).toHaveProperty('userId', user._id.toString());
  });

  test('GET /api/media/:id - should return 404 if not found', async () => {
    const app = express();
    app.use(express.json());
    app.use((req, res, next) => {
      req.user = user;
      req.isAuthenticated = () => true;
      next();
    });
    app.use('/api/media', mediaRoutes);
    app.use((err, req, res, next) => {
      res.status(500).json({ message: err.message });
    });

    const nonExistentId = new mongoose.Types.ObjectId().toString();

    const res = await request(app).get(`/api/media/${nonExistentId}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Media not found');
  });

  test('DELETE /api/media/:id - should delete media if owner', async () => {
    const app = express();
    app.use(express.json());
    app.use((req, res, next) => {
      req.user = user;
      req.isAuthenticated = () => true;
      next();
    });
    app.use('/api/media', mediaRoutes);
    app.use((err, req, res, next) => {
      res.status(500).json({ message: err.message });
    });

    const res = await request(app).delete(`/api/media/${mediaId}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Media deleted successfully');

    const deleted = await Media.findById(mediaId);
    expect(deleted).toBeNull();
  });

  test('DELETE /api/media/:id - should return 403 if not owner', async () => {
    const otherUser = await User.create({
      googleId: `other-google-id-${Date.now()}`,
      email: `other-${Date.now()}@example.com`,
      username: `otheruser-${Date.now()}`,
    });

    const media = await Media.create({
      userId: otherUser._id,
      filename: 'other-image.jpg',
      url: '/uploads/other-image.jpg',
      mimeType: 'image/jpeg',
    });

    const app = express();
    app.use(express.json());
    app.use((req, res, next) => {
      req.user = user; // logged in as user, but media owned by otherUser
      req.isAuthenticated = () => true;
      next();
    });
    app.use('/api/media', mediaRoutes);
    app.use((err, req, res, next) => {
      res.status(500).json({ message: err.message });
    });

    const res = await request(app).delete(`/api/media/${media._id}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Unauthorized to delete this media');
  });
});