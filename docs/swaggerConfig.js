const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Time Capsule API',
      version: '1.0.0',
      description: 'API for managing time capsules (messages to your future self)',
    },
    servers: [
      {
        url: 'http://localhost:3000', // Change to your deployed URL when ready
      },
    ],
    tags: [
      {
        name: 'Capsules',
        description: 'Endpoints related to time capsules',
      },
    ],
    paths: {
      '/api/capsules': {
        get: {
          tags: ['Capsules'],
          summary: 'Get all capsules for the logged-in user',
          responses: {
            200: {
              description: 'A list of user-created capsules',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        _id: { type: 'string' },
                        title: { type: 'string' },
                        message: { type: 'string' },
                        revealDate: { type: 'string', format: 'date-time' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/capsules/{id}': {
        get: {
          tags: ['Capsules'],
          summary: 'Get a capsule by ID (only if revealed or owned)',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Capsule ID',
              schema: {
                type: 'string',
              },
            },
          ],
          responses: {
            200: {
              description: 'The capsule data',
            },
            403: {
              description: 'Capsule is still locked',
            },
            404: {
              description: 'Capsule not found',
            },
          },
        },
      },
    },
  },
  apis: [],
};

const swaggerDocument = swaggerJSDoc(options);
module.exports = swaggerDocument;