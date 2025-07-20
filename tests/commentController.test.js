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
      content: 'This is a test comment',
    });
    commentId = comment._id.toString();
  });

  afterEach(async () => {
    await Comment.deleteMany({});
    await Capsule.deleteMany({});
    await User.deleteMany({});
  });

  test('GET /api/comments/:capsuleId - should return all comments for a capsule', async () => {
    const app = express();
    app.use(express.json());
    app.use((req, res, next) => {
      req.user = user;
      req.isAuthenticated = () => true;
      next();
    });
    app.use('/api/comments', commentRoutes);
    app.use((err, req, res, next) => {
      res.status(500).json({ message: err.message });
    });

    const res = await request(app).get(`/api/comments/${capsule._id}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0]).toHaveProperty('content', 'This is a test comment');
  });

  test('POST /api/comments/:capsuleId - should create a new comment', async () => {
    const app = express();
    app.use(express.json());
    app.use((req, res, next) => {
      req.user = user;
      req.isAuthenticated = () => true;
      next();
    });
    app.use('/api/comments', commentRoutes);
    app.use((err, req, res, next) => {
      res.status(500).json({ message: err.message });
    });

    const newComment = { content: 'Another comment' };
    const res = await request(app)
      .post(`/api/comments/${capsule._id}`)
      .send(newComment);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('message', 'Comment added successfully');
    expect(res.body.comment).toHaveProperty('content', 'Another comment');

    // Verify saved in DB
    const dbComment = await Comment.findById(res.body.comment._id);
    expect(dbComment).not.toBeNull();
    expect(dbComment.content).toBe('Another comment');
  });

  test('POST /api/comments/:capsuleId - should return 400 for empty content', async () => {
    const app = express();
    app.use(express.json());
    app.use((req, res, next) => {
      req.user = user;
      req.isAuthenticated = () => true;
      next();
    });
    app.use('/api/comments', commentRoutes);
    app.use((err, req, res, next) => {
      res.status(500).json({ message: err.message });
    });

    const res = await request(app)
      .post(`/api/comments/${capsule._id}`)
      .send({ content: '' });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors.some(e => e.msg === 'Content is required')).toBe(true);
  });

  test('POST /api/comments/:capsuleId - should return 401 if unauthenticated', async () => {
    const app = express();
    app.use(express.json());
    app.use((req, res, next) => {
      req.user = null;
      req.isAuthenticated = () => false;
      next();
    });
    app.use('/api/comments', commentRoutes);
    app.use((err, req, res, next) => {
      res.status(500).json({ message: err.message });
    });

    const res = await request(app)
      .post(`/api/comments/${capsule._id}`)
      .send({ content: 'test' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized: Please log in');
  });

  test('DELETE /api/comments/:id - should delete comment if owner', async () => {
    const app = express();
    app.use(express.json());
    app.use((req, res, next) => {
      req.user = user;
      req.isAuthenticated = () => true;
      next();
    });
    app.use('/api/comments', commentRoutes);
    app.use((err, req, res, next) => {
      res.status(500).json({ message: err.message });
    });

    const res = await request(app).delete(`/api/comments/${commentId}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Comment deleted successfully');

    const deleted = await Comment.findById(commentId);
    expect(deleted).toBeNull();
  });

  test('DELETE /api/comments/:id - should return 403 if not owner', async () => {
    const otherUser = await User.create({
      googleId: `other-google-id-${Date.now()}`,
      email: `other-${Date.now()}@example.com`,
      username: `otheruser-${Date.now()}`,
    });

    // Create a comment owned by otherUser
    const otherComment = await Comment.create({
      capsuleId: capsule._id,
      userId: otherUser._id,
      content: 'Other user comment',
    });

    const app = express();
    app.use(express.json());
    app.use((req, res, next) => {
      req.user = user; // logged in as original user, not owner
      req.isAuthenticated = () => true;
      next();
    });
    app.use('/api/comments', commentRoutes);
    app.use((err, req, res, next) => {
      res.status(500).json({ message: err.message });
    });

    const res = await request(app).delete(`/api/comments/${otherComment._id}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Unauthorized to delete this comment');
  });

  test('DELETE /api/comments/:id - should return 404 if comment not found', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();

    const app = express();
    app.use(express.json());
    app.use((req, res, next) => {
      req.user = user;
      req.isAuthenticated = () => true;
      next();
    });
    app.use('/api/comments', commentRoutes);
    app.use((err, req, res, next) => {
      res.status(500).json({ message: err.message });
    });

    const res = await request(app).delete(`/api/comments/${nonExistentId}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Comment not found');
  });
});