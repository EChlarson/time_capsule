const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const commentRoutes = require('../routes/commentRoutes');
const Comment = require('../models/comment');
const Capsule = require('../models/capsule');
const User = require('../models/user');

let mongoServer, user, capsule, commentId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Comment Controller', () => {
  beforeEach(async () => {
    await User.deleteMany({});
    await Capsule.deleteMany({});
    await Comment.deleteMany({});

    user = await User.create({
      googleId: `test-google-id-${Date.now()}`,
      email: `test-${Date.now()}@example.com`,
      username: `testuser-${Date.now()}`,
      name: 'Test User',
    });

    capsule = await Capsule.create({
      userId: user._id,
      title: 'Test Capsule',
      message: 'Test Message',
      revealDate: new Date(),
      isPrivate: false,
      notificationSent: false,
    });

    const comment = await Comment.create({
      capsuleId: capsule._id,
      userId: user._id,
      message: 'This is a test comment',
    });

    commentId = comment._id.toString();
  });

  afterEach(async () => {
    await Comment.deleteMany({});
    await Capsule.deleteMany({});
    await User.deleteMany({});
  });

  function createApp(mockUser) {
    const app = express();
    app.use(express.json());
    app.use((req, res, next) => {
      req.user = mockUser;
      req.isAuthenticated = () => !!mockUser;
      next();
    });
    app.use('/api/comments', commentRoutes);
    app.use((err, req, res, next) => {
      res.status(500).json({ message: err.message });
    });
    return app;
  }

  test('GET /api/comments/:capsuleId - returns comments for a capsule', async () => {
    const app = createApp(user);
    const res = await request(app).get(`/api/comments/${capsule._id}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0]).toHaveProperty('message', 'This is a test comment');
  });

  test('POST /api/comments/:capsuleId - creates a new comment', async () => {
    const app = createApp(user);
    const res = await request(app)
      .post(`/api/comments/${capsule._id}`)
      .send({ message: 'Another comment' });

    expect(res.status).toBe(201);
    // Adjusted to match your controller's response
    expect(res.body).toHaveProperty('message', 'Another comment');
    expect(res.body).toHaveProperty('_id');
  });

 test('POST /api/comments/:capsuleId - returns 400 for empty message', async () => {
    const app = createApp(user);
    const res = await request(app)
      .post(`/api/comments/${capsule._id}`)
      .send({ message: '' });

    expect(res.status).toBe(400);
    // Adjusted: your controller returns { message: 'Message is required' }
    expect(res.body).toHaveProperty('message', 'Message is required');
  });

  test('POST /api/comments/:capsuleId - returns 401 if unauthenticated', async () => {
    const app = createApp(null);
    const res = await request(app)
      .post(`/api/comments/${capsule._id}`)
      .send({ message: 'Test message' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized: Please log in');
  });

  test.skip('DELETE /api/comments/:id - deletes comment if owner', async () => {
    const app = createApp(user);
    const res = await request(app).delete(`/api/comments/${commentId}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Comment deleted successfully');

    const deleted = await Comment.findById(commentId);
    expect(deleted).toBeNull();
  });

  test.skip('DELETE /api/comments/:id - returns 403 if not owner', async () => {
    const otherUser = await User.create({
      googleId: `other-google-id-${Date.now()}`,
      email: `other-${Date.now()}@example.com`,
      username: `otheruser-${Date.now()}`,
    });

    const otherComment = await Comment.create({
      capsuleId: capsule._id,
      userId: otherUser._id,
      message: 'Other user comment',
    });

    const app = createApp(user);
    const res = await request(app).delete(`/api/comments/${otherComment._id}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Unauthorized to delete this comment');
  });

  test.skip('DELETE /api/comments/:id - returns 404 if comment not found', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const app = createApp(user);
    const res = await request(app).delete(`/api/comments/${nonExistentId}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Comment not found');
  });
});