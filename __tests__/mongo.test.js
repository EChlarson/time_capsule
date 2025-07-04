const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

describe('MongoDB Tests', () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  test('should save a document', async () => {
    const Model = mongoose.model('Test', new mongoose.Schema({ name: String }));
    const doc = new Model({ name: 'test' });
    await doc.save();
    expect(doc.name).toBe('test');
  });
});
