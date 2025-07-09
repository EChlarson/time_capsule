const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Time Capsule API',
      version: '1.0.0',
      description: 'API for managing time capsules with Google OAuth authentication.',
    },
    servers: [
      { url: 'http://localhost:3000' },
      { url: 'https://time-capsule-3kgt.onrender.com' },
    ],
    tags: [
      { name: 'Capsules', description: 'Endpoints for managing time capsules' },
    ],
    paths: {
      '/api/capsules': {
        get: {
          tags: ['Capsules'],
          summary: 'Get all capsules for the logged-in user',
          description: 'Returns all capsules created by the authenticated user.',
          security: [{ OAuth2: ['profile', 'email'] }],
          responses: {
            200: {
              description: 'A list of user-created capsules',
              content: {
                'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Capsule' } } },
              },
            },
            401: { description: 'Unauthorized if not logged in' },
            500: { description: 'Server error' },
          },
        },
        post: {
          tags: ['Capsules'],
          summary: 'Create a new capsule',
          description: 'Creates a new capsule for the authenticated user.',
          security: [{ OAuth2: ['profile', 'email'] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/CapsuleInput' } } },
          },
          responses: {
            201: { description: 'Capsule created successfully' },
            400: { description: 'Validation errors' },
            401: { description: 'Unauthorized if not logged in' },
            500: { description: 'Server error' },
          },
        },
      },
      '/api/capsules/{id}': {
        get: {
          tags: ['Capsules'],
          summary: 'Get a capsule by ID',
          description: 'Returns a capsule if it is revealed or owned by the authenticated user.',
          security: [{ OAuth2: ['profile', 'email'] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Capsule ID',
              schema: { type: 'string' },
            },
          ],
          responses: {
            200: { description: 'The capsule data', content: { 'application/json': { schema: { $ref: '#/components/schemas/Capsule' } } } },
            403: { description: 'Capsule is still locked' },
            404: { description: 'Capsule not found' },
            401: { description: 'Unauthorized if not logged in' },
            500: { description: 'Server error' },
          },
        },
        put: {
          tags: ['Capsules'],
          summary: 'Update a capsule by ID',
          description: 'Updates a capsule if owned by the authenticated user.',
          security: [{ OAuth2: ['profile', 'email'] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Capsule ID',
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            required: false,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/CapsuleInput' } } },
          },
          responses: {
            200: {
              description: 'Capsule updated successfully',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Capsule' } } },
            },
            400: { description: 'Validation errors' },
            403: { description: 'Unauthorized to update this capsule' },
            404: { description: 'Capsule not found' },
            401: { description: 'Unauthorized if not logged in' },
            500: { description: 'Server error' },
          },
        },
        delete: {
          tags: ['Capsules'],
          summary: 'Delete a capsule by ID',
          description: 'Deletes a capsule if owned by the authenticated user.',
          security: [{ OAuth2: ['profile', 'email'] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Capsule ID',
              schema: { type: 'string' },
            },
          ],
          responses: {
            200: { description: 'Capsule deleted successfully' },
            403: { description: 'Unauthorized to delete this capsule' },
            404: { description: 'Capsule not found' },
            401: { description: 'Unauthorized if not logged in' },
            500: { description: 'Server error' },
          },
        },
      },
    },
    components: {
      schemas: {
        Capsule: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '60d5f483f8a7b1234567890' },
            userId: { type: 'string', example: '60d5f483f8a7b0987654321' },
            title: { type: 'string', example: 'My Future Message' },
            message: { type: 'string', example: 'Hello future self!' },
            imageUrl: { type: 'string', example: 'https://example.com/image.jpg' },
            revealDate: { type: 'string', format: 'date-time', example: '2025-12-31T00:00:00.000Z' },
            isPrivate: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time', example: '2025-06-25T21:04:00.000Z' },
          },
        },
        CapsuleInput: {
          type: 'object',
          required: ['title', 'message', 'revealDate'],
          properties: {
            title: { type: 'string', example: 'My Future Message' },
            message: { type: 'string', example: 'Hello future self!' },
            imageUrl: { type: 'string', example: 'https://example.com/image.jpg' },
            revealDate: { type: 'string', format: 'date', example: '2025-12-31' },
            isPrivate: { type: 'boolean', example: true },
          },
        },
      },
      securitySchemes: {
        OAuth2: {
          type: 'oauth2',
          flows: {
            authorizationCode: {
              authorizationUrl: 'https://accounts.google.com/o/oauth2/auth',
              tokenUrl: 'https://oauth2.googleapis.com/token',
              scopes: { profile: 'Access user profile', email: 'Access user email' },
            },
          },
        },
      },
    },
    security: [
      {OAuth2: ['profile', 'email']}
],
  },
  apis: ['./routes/*.js', './controllers/*.js'],
};

module.exports = swaggerJSDoc(options);