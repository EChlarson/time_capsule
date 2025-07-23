const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const capsuleRoutes = require('../routes/capsuleRoutes');
const Capsule = require('../models/capsule');
const User = require('../models/user');

let mongoServer, user, capsuleId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Capsule Controller', () => {
  beforeEach(async () => {
    await User.deleteMany({});
    await Capsule.deleteMany({});

    user = await User.create({
      googleId: `test-google-id-${Date.now()}`,
      email: `test-${Date.now()}@example.com`,
      username: `testuser-${Date.now()}`,
      name: 'Test User',
    });

    const capsule = await Capsule.create({
      userId: user._id,
      title: 'Test Capsule',
      message: 'Test Message',
      revealDate: new Date(),
      isPrivate: true,
      notificationSent: false,
    });
    capsuleId = capsule._id.toString();
  });

  afterEach(async () => {
    await Capsule.deleteMany({});
    await User.deleteMany({});
  });

  function createApp(authUser = null) {
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use((req, res, next) => {
      req.user = authUser;
      req.isAuthenticated = () => !!req.user;
      next();
    });
    app.use('/api/capsules', capsuleRoutes);
    app.use((err, req, res, next) => {
      console.error('Test server error:', err.stack);
      res.status(500).json({ message: 'Test server error', error: err.message });
    });
    return app;
  }

  test('GET /api/capsules - should return all capsules for authenticated user', async () => {
    const app = createApp(user);
    const res = await request(app).get('/api/capsules');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('Test Capsule');
    expect(res.body[0].userId._id || res.body[0].userId).toEqual(user._id.toString());
    expect(res.body[0].isPrivate).toBe(true);
  });

  test('GET /api/capsules - should return 401 if not authenticated', async () => {
    const app = createApp(null);
    const res = await request(app).get('/api/capsules');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized: Please log in');
  });

  test('GET /api/capsules/:id - should return a capsule by ID for owner', async () => {
    const app = createApp(user);
    const res = await request(app).get(`/api/capsules/${capsuleId}`);
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Test Capsule');
    expect(res.body.userId).toEqual(user._id.toString());
    expect(res.body.isPrivate).toBe(true);
  });

  test('GET /api/capsules/:id - should return 404 for non-existent capsule', async () => {
    const app = createApp(user);
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const res = await request(app).get(`/api/capsules/${nonExistentId}`);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Capsule not Found');
  });

  test('GET /api/capsules/:id - should return 403 for non-owner and locked capsule', async () => {
    const app = createApp(user);
    const otherUser = await User.create({
      googleId: `other-google-id-${Date.now()}`,
      email: `other-${Date.now()}@example.com`,
      username: `otheruser-${Date.now()}`,
    });
    const capsule = await Capsule.create({
      userId: otherUser._id,
      title: 'Other Capsule',
      message: 'Other Message',
      revealDate: new Date(Date.now() + 1000 * 60 * 60 * 24),
      isPrivate: true,
    });
    const res = await request(app).get(`/api/capsules/${capsule._id}`);
    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Capsule is still locked');
  });

  test('POST /api/capsules - should create a new capsule', async () => {
    const app = createApp(user);
    const newCapsule = {
      title: 'New Capsule',
      message: 'New Message',
      revealDate: new Date().toISOString(),
      isPrivate: false,
    };
    const res = await request(app).post('/api/capsules').send(newCapsule);
    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Capsule created successfully');
    expect(res.body.capsule.title).toBe('New Capsule');
    expect(res.body.capsule.isPrivate).toBe(false);
    expect(res.body.capsule.userId).toEqual(user._id.toString());
  });

  test('POST /api/capsules - should return 400 for invalid data', async () => {
    const app = createApp(user);
    const res = await request(app)
      .post('/api/capsules')
      .send({
        title: '',
        message: '',
        revealDate: 'invalid-date',
        isPrivate: 'not-a-boolean',
      });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors.some((e) => e.msg === 'Title is required')).toBe(true);
    expect(res.body.errors.some((e) => e.msg === 'Message is required')).toBe(true);
    expect(res.body.errors.some((e) => e.msg.includes('Reveal date'))).toBe(true);
    expect(res.body.errors.some((e) => e.msg === 'isPrivate must be a boolean')).toBe(true);
  });

  test('POST /api/capsules - should return 401 if not authenticated', async () => {
    const app = createApp(null);
    const res = await request(app).post('/api/capsules').send({
      title: 'New Capsule',
      message: 'New Message',
      revealDate: new Date().toISOString(),
    });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized: Please log in');
  });

  test('PUT /api/capsules/:id - should update a capsule', async () => {
    const app = createApp(user);
    const res = await request(app).put(`/api/capsules/${capsuleId}`).send({
      title: 'Updated Capsule',
      message: 'Updated Message',
      revealDate: new Date().toISOString(),
      isPrivate: false,
    });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Capsule updated successfully');
    expect(res.body.capsule.title).toBe('Updated Capsule');
    expect(res.body.capsule.isPrivate).toBe(false);
  });

  test('PUT /api/capsules/:id - should return 404 for non-existent capsule', async () => {
    const app = createApp(user);
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const res = await request(app).put(`/api/capsules/${nonExistentId}`).send({ title: 'Updated' });
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Capsule not found');
  });

  test('PUT /api/capsules/:id - should return 403 for non-owner', async () => {
    const app = createApp(user);
    const otherUser = await User.create({
      googleId: `other-google-id-${Date.now()}`,
      email: `other-${Date.now()}@example.com`,
      username: `otheruser-${Date.now()}`,
    });
    const capsule = await Capsule.create({
      userId: otherUser._id,
      title: 'Other Capsule',
      message: 'Other Message',
      revealDate: new Date(),
    });
    const res = await request(app).put(`/api/capsules/${capsule._id}`).send({ title: 'Updated' });
    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Unauthorized to update this capsule');
  });

  test('PUT /api/capsules/:id - should return 400 for invalid data', async () => {
    const app = createApp(user);
    const res = await request(app).put(`/api/capsules/${capsuleId}`).send({
      title: '',
      isPrivate: 'not-a-boolean',
    });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors.some((e) => e.msg === 'Title cannot be empty')).toBe(true);
    expect(res.body.errors.some((e) => e.msg === 'isPrivate must be a boolean')).toBe(true);
  });

  test('DELETE /api/capsules/:id - should delete a capsule', async () => {
    const app = createApp(user);
    const res = await request(app).delete(`/api/capsules/${capsuleId}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Capsule deleted successfully');
    const capsule = await Capsule.findById(capsuleId);
    expect(capsule).toBeNull();
  });

  test('DELETE /api/capsules/:id - should return 404 for non-existent capsule', async () => {
    const app = createApp(user);
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const res = await request(app).delete(`/api/capsules/${nonExistentId}`);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Capsule not found');
  });

  test('DELETE /api/capsules/:id - should return 403 for non-owner', async () => {
    const app = createApp(user);
    const otherUser = await User.create({
      googleId: `other-google-id-${Date.now()}`,
      email: `other-${Date.now()}@example.com`,
      username: `otheruser-${Date.now()}`,
    });
    const capsule = await Capsule.create({
      userId: otherUser._id,
      title: 'Other Capsule',
      message: 'Other Message',
      revealDate: new Date(),
    });
    const res = await request(app).delete(`/api/capsules/${capsule._id}`);
    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Unauthorized to delete this capsule');
  });
});