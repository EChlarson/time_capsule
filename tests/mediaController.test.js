const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const path = require('path');
const multer = require('multer'); // to mock upload middleware

const mediaRoutes = require('../routes/mediaRoutes'); // adjust if needed
const Media = require('../models/media');
const User = require('../models/user');

let mongoServer;
let app;
let testUser;
let testMedia;

// Setup multer storage for tests (memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Create express app with middleware and mocked auth
function createApp(mockUser) {
  const app = express();

  // Middleware to mock authentication
  app.use((req, res, next) => {
    req.user = mockUser;
    req.isAuthenticated = () => !!mockUser;
    next();
  });

  // For file upload routes, use multer middleware
  app.post('/api/media/:capsuleId', upload.single('file'), mediaRoutes);

  // Other routes without file upload middleware
  app.get('/api/media/:capsuleId', mediaRoutes);
  app.delete('/api/media/:id', mediaRoutes);

  // Error handler
  app.use((err, req, res, next) => {
    res.status(500).json({ message: err.message });
  });

  return app;
}

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri);

  // Create a test user
  testUser = await User.create({
    googleId: 'test-google-id',
    email: 'test@example.com',
    username: 'testuser',
  });

  // Initialize app with mocked user
  app = createApp(testUser);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Media.deleteMany({});
});

describe('Media Controller', () => {
  test.skip('POST /api/media/:capsuleId - uploads a media file', async () => {
    const capsuleId = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .post(`/api/media/${capsuleId}`)
      .attach('file', Buffer.from('fake file content'), {
        filename: 'test.png',
        contentType: 'image/png',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('message', 'Media uploaded');
    expect(res.body).toHaveProperty('mediaId');

    const savedMedia = await Media.findById(res.body.mediaId);
    expect(savedMedia).not.toBeNull();
    expect(savedMedia.capsuleId.toString()).toBe(capsuleId);
    expect(savedMedia.contentType).toBe('image/png');
  });

  test.skip('POST /api/media/:capsuleId - returns 400 if no file uploaded', async () => {
    const capsuleId = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .post(`/api/media/${capsuleId}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'No file uploaded');
  });

  test.skip('GET /api/media/:capsuleId - returns media info', async () => {
    const capsuleId = new mongoose.Types.ObjectId();

    // Create media record first
    const media = await Media.create({
      capsuleId,
      mediaData: Buffer.from('some image data'),
      contentType: 'image/jpeg',
    });

    const res = await request(app).get(`/api/media/${capsuleId.toString()}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe(media.contentType);
    expect(res.body).toBeInstanceOf(Buffer); // response body is a buffer (binary data)
  });

  test.skip('GET /api/media/:capsuleId - returns 404 if no media found', async () => {
    const capsuleId = new mongoose.Types.ObjectId();

    const res = await request(app).get(`/api/media/${capsuleId.toString()}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message', 'No media found');
  });

  test.skip('DELETE /api/media/:id - deletes media if owner', async () => {
    // Create a media linked to testUser
    const media = await Media.create({
      capsuleId: new mongoose.Types.ObjectId(),
      mediaData: Buffer.from('dummy data'),
      contentType: 'image/png',
      userId: testUser._id,
    });

    const res = await request(app).delete(`/api/media/${media._id}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Media deleted successfully');

    const deleted = await Media.findById(media._id);
    expect(deleted).toBeNull();
  });

  test.skip('DELETE /api/media/:id - returns 403 if not owner', async () => {
    // Create a different user
    const otherUser = await User.create({
      googleId: 'other-google-id',
      email: 'other@example.com',
      username: 'otheruser',
    });

    // Create media owned by otherUser
    const media = await Media.create({
      capsuleId: new mongoose.Types.ObjectId(),
      mediaData: Buffer.from('dummy data'),
      contentType: 'image/png',
      userId: otherUser._id,
    });

    const res = await request(app).delete(`/api/media/${media._id}`);

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('message', 'Unauthorized to delete this media');
  });

  test.skip('DELETE /api/media/:id - returns 404 if media not found', async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app).delete(`/api/media/${fakeId}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message', 'Media not found');
  });
});