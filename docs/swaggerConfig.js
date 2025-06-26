const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Time Capsule API',
      version: '1.0.0',
      description: 'API for managing time capsules (messages to your future self) with Google OAuth authentication.',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
      {
        url: 'https://time-capsule-3kgt.onrender.com/',
      },
    ],
    tags: [
      {
        name: 'Auth',
        description: 'Endpoints for Google OAuth authentication',
      },
      {
        name: 'Capsules',
        description: 'Endpoints for managing time capsules',
      },
    ],
    paths: {
      '/': {
        get: {
          tags: ['Root'],
          summary: 'Root endpoint',
          description: 'Returns a welcome message for the Time Capsule API.',
          responses: {
            200: {
              description: 'Successful response',
              content: {
                'text/plain': {
                  schema: {
                    type: 'string',
                    example: 'Time Capsule API',
                  },
                },
              },
            },
          },
        },
      },
      '/api/auth/login': {
        get: {
          tags: ['Auth'],
          summary: 'Initiate Google OAuth login',
          description: 'Redirects to Google OAuth login page.',
          responses: {
            302: {
              description: 'Redirects to Google OAuth login page',
            },
          },
        },
      },
      '/api/auth/callback': {
        get: {
          tags: ['Auth'],
          summary: 'Handle Google OAuth callback',
          description: 'Processes Google OAuth callback, redirects to /api/capsules on success or /api/auth/login on failure.',
          responses: {
            302: {
              description: 'Redirects to /api/capsules (success) or /api/auth/login (failure)',
            },
          },
        },
      },
      '/api/auth/logout': {
        get: {
          tags: ['Auth'],
          summary: 'Log out user',
          description: 'Logs out the authenticated user and redirects to /.',
          responses: {
            302: {
              description: 'Redirects to root (/)',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      error: {
                        type: 'string',
                        example: 'Logout failed',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
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
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/Capsule',
                    },
                  },
                },
              },
            },
            401: {
              description: 'Unauthorized if not logged in',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      error: { type: 'string', example: 'Unauthorized: Please log in' },
                    },
                  },
                },
              },
            },
            500: {
              description: 'Server error',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string', example: 'Error Retrieving Capsules' },
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ['Capsules'],
          summary: 'Create a new capsule',
          description: 'Creates a new capsule for the authenticated user.',
          security: [{ OAuth2: ['profile', 'email'] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/CapsuleInput',
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Capsule created successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string', example: 'Capsule created successfully' },
                      capsule: { $ref: '#/components/schemas/Capsule' },
                    },
                  },
                },
              },
            },
            400: {
              description: 'Validation errors',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      errors: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            msg: { type: 'string', example: 'Title is required' },
                            param: { type: 'string', example: 'title' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            401: {
              description: 'Unauthorized if not logged in',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      error: { type: 'string', example: 'Unauthorized: Please log in' },
                    },
                  },
                },
              },
            },
            500: {
              description: 'Server error',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string', example: 'Error creating capsule' },
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
          summary: 'Get a capsule by ID',
          description: 'Returns a capsule if it is revealed or owned by the authenticated user.',
          security: [{ OAuth2: ['profile', 'email'] }],
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
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Capsule',
                  },
                },
              },
            },
            403: {
              description: 'Capsule is still locked',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string', example: 'Capsule is still locked' },
                    },
                  },
                },
              },
            },
            404: {
              description: 'Capsule not found',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string', example: 'Capsule not Found' },
                    },
                  },
                },
              },
            },
            401: {
              description: 'Unauthorized if not logged in',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      error: { type: 'string', example: 'Unauthorized: Please log in' },
                    },
                  },
                },
              },
            },
            500: {
              description: 'Server error',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string', example: 'Error fetching capsule' },
                    },
                  },
                },
              },
            },
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
              tokenUrl: 'https://accounts.google.com/o/oauth2/token',
              scopes: {
                profile: 'Access user profile information',
                email: 'Access user email address',
              },
            },
          },
        },
      },
    },
  },
  apis: ['./routes/*.js', './controllers/*.js'], // Optional: parse JSDoc comments
};

const swaggerDocument = swaggerJSDoc(options);
module.exports = swaggerDocument;