const capsuleController = require('../controllers/capsuleController');
const Capsule = require('../models/capsule');
const httpMocks = require('node-mocks-http');
const { validationResult } = require('express-validator');

// Mock Capsule model
jest.mock('../models/capsule');
jest.mock('express-validator');

// Mock user object
const mockUser = { _id: 'user123' };

describe('Capsule Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test: getAllCapsules
  test('getAllCapsules returns capsules for logged-in user', async () => {
    const mockCapsules = [{ title: 'Time Capsule 1' }, { title: 'Time Capsule 2' }];
    Capsule.find.mockResolvedValue(mockCapsules);

    const req = httpMocks.createRequest({ user: mockUser });
    const res = httpMocks.createResponse();

    await capsuleController.getAllCapsules(req, res);
    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data).toEqual(mockCapsules);
    expect(Capsule.find).toHaveBeenCalledWith({ userId: mockUser._id });
  });

  // Test: getCapsuleById returns capsule if revealed or owned
  test('getCapsuleById returns capsule if user is owner', async () => {
    const mockCapsule = {
      _id: 'abc',
      title: 'My Capsule',
      revealDate: new Date(Date.now() + 10000), // unrevealed
      userId: mockUser._id,
      toObject: () => this,
    };
    Capsule.findById.mockResolvedValue({
      ...mockCapsule,
      userId: { equals: jest.fn().mockReturnValue(true) }
    });

    const req = httpMocks.createRequest({
      user: mockUser,
      params: { id: 'abc' },
    });
    const res = httpMocks.createResponse();

    await capsuleController.getCapsuleById(req, res);
    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data.title).toBe('My Capsule');
  });

  // Test: createCapsule saves and returns capsule
  test('createCapsule saves capsule when data is valid', async () => {
    const mockSavedCapsule = {
      _id: 'cap789',
      title: 'New Capsule',
      message: 'Hello future!',
      revealDate: new Date(),
    };

    validationResult.mockReturnValue({ isEmpty: () => true }); // no validation errors
    Capsule.mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(mockSavedCapsule),
    }));

    const req = httpMocks.createRequest({
      user: mockUser,
      body: {
        title: 'New Capsule',
        message: 'Hello future!',
        imageUrl: '',
        revealDate: new Date(),
        isPrivate: true,
      },
    });
    const res = httpMocks.createResponse();

    await capsuleController.createCapsule(req, res);
    const data = res._getJSONData();

    expect(res.statusCode).toBe(201);
    expect(data.message).toBe('Capsule created successfully');
  });
});