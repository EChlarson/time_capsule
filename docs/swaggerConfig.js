// docs/swaggerConfig.js
const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Time Capsule API',
      version: '1.0.0',
      description: 'API for managing time capsules, media, and comments with session-based authentication.',
    },
    servers: [
      { url: 'http://localhost:3000' },
      { url: 'https://time-capsule-3kgt.onrender.com' },
    ],
    tags: [
      { name: 'Auth', description: 'Endpoints for user authentication' },
      { name: 'Capsules', description: 'Endpoints for managing time capsules' },
      { name: 'Comments', description: 'Endpoints for managing comments' },
      { name: 'Media', description: 'Endpoints for managing media' },
    ],
    paths: {
      // Auth Endpoints
      '/api/auth/user': {
        get: {
          tags: ['Auth'],
          summary: 'Get authenticated user profile',
          description: 'Retrieves the profile of the currently authenticated user.',
          responses: {
            200: {
              description: 'User profile',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      email: { type: 'string', example: 'user@example.com' },
                      username: { type: 'string', example: 'user123' },
                    },
                  },
                },
              },
            },
            401: { description: 'Unauthorized if not logged in' },
            500: { description: 'Server error' },
          },
        },
      },
      '/api/auth/update': {
        put: {
          tags: ['Auth'],
          summary: 'Update username',
          description: 'Updates the authenticated user’s username.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    username: { type: 'string', example: 'newUsername' },
                  },
                  required: ['username'],
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Username updated successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string' },
                      user: { type: 'object', properties: { email: { type: 'string' }, username: { type: 'string' } } },
                    },
                  },
                },
              },
            },
            400: { description: 'Invalid or taken username' },
            401: { description: 'Unauthorized if not logged in' },
            500: { description: 'Server error' },
          },
        },
      },
      '/api/auth/logout': {
        get: {
          tags: ['Auth'],
          summary: 'Log out the authenticated user',
          description: 'Destroys the user session and logs out the user.',
          responses: {
            200: {
              description: 'Logged out successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string', example: 'Logged out successfully' },
                    },
                  },
                },
              },
            },
            500: { description: 'Server error' },
          },
        },
      },
      // Capsules Endpoints
      '/api/capsules': {
        get: {
          tags: ['Capsules'],
          summary: 'Get all capsules for the logged-in user',
          description: 'Returns all capsules created by the authenticated user.',
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
        
        put: {
          tags: ['Capsules'],
          summary: 'Update a capsule by ID',
          description: 'Updates a capsule if owned by the authenticated user.',
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
            200: { description: 'Capsule updated successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/Capsule' } } } },
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
      // Comments Endpoints      
      '/api/comments/{capsuleId}': {
        get: {
          tags: ['Comments'],
          summary: 'Get comments for a capsule',
          description: 'Retrieves all comments for a specific capsule.',
          parameters: [
            {
              name: 'capsuleId',
              in: 'path',
              required: true,
              description: 'Capsule ID',
              schema: { type: 'string' },
            },
          ],
          responses: {
            200: {
              description: 'List of comments',
              content: {
                'application/json': {
                  schema: { type: 'array', items: { $ref: '#/components/schemas/Comment' } },
                },
              },
            },
            401: { description: 'Unauthorized if not logged in' },
            404: { description: 'Capsule not found' },
            500: { description: 'Server error' },
          },
        },
      },
      '/api/comments': {
        post: {
          tags: ['Comments'],
          summary: 'Create a comment for a capsule',
          description: 'Adds a comment to a specific capsule.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    capsuleId: { type: 'string', example: '6873eeb421fe8c5b072ee0ca' },
                    message: { type: 'string', example: 'This is Awesome!' },
                  },
                  required: ['capsuleId', 'message'],
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Comment created successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Comment' },
                },
              },
            },
            400: { description: 'Invalid input' },
            401: { description: 'Unauthorized if not logged in' },
            404: { description: 'Capsule not found' },
            500: { description: 'Server error' },
          },
        },
      },
      '/api/comments/{id}': {
        delete: {
          tags: ['Comments'],
          summary: 'Delete a comment',
          description: 'Deletes a comment if created by the authenticated user.',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Comment ID',
              schema: { type: 'string' },
            },
          ],
          responses: {
            200: { description: 'Comment deleted successfully' },
            401: { description: 'Unauthorized if not logged in' },
            403: { description: 'Unauthorized to delete this comment' },
            404: { description: 'Comment not found' },
            500: { description: 'Server error' },
          },
        },
      },
      // Media Endpoints
      '/api/media/{capsuleId}': {
        get: {
          tags: ['Media'],
          summary: 'Get media for a capsule',
          description: 'Retrieves all media items for a specific capsule owned by the authenticated user.',
          parameters: [
            {
              name: 'capsuleId',
              in: 'path',
              required: true,
              description: 'Capsule ID',
              schema: { type: 'string' },
            },
          ],
          responses: {
            200: {
              description: 'List of media items',
              content: {
                'application/json': {
                  schema: { type: 'array', items: { $ref: '#/components/schemas/Media' } },
                },
              },
            },
            401: { description: 'Unauthorized if not logged in' },
            404: { description: 'Capsule not found or not owned' },
            500: { description: 'Server error' },
          },
        },
      },
      '/api/media': {
        post: {
          tags: ['Media'],
          summary: 'Upload media for a capsule',
          description: 'Uploads an image for a specific capsule owned by the authenticated user.',
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    capsuleId: { type: 'string', example: '68745bc26fce6549d063cb9c' },
                    image: { type: 'string', format: 'binary' },
                  },
                  required: ['capsuleId', 'image'],
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Media uploaded successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Media' },
                },
              },
            },
            400: { description: 'No image provided or invalid capsuleId' },
            401: { description: 'Unauthorized if not logged in' },
            404: { description: 'Capsule not found or not owned' },
            500: { description: 'Server error' },
          },
        },
      },      
      '/api/media/{id}': {
        delete: {
          tags: ['Media'],
          summary: 'Delete a media item',
          description: 'Deletes a media item if associated with a capsule owned by the authenticated user.',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Media ID',
              schema: { type: 'string' },
            },
          ],
          responses: {
            200: { description: 'Media deleted successfully' },
            401: { description: 'Unauthorized if not logged in' },
            403: { description: 'Unauthorized to delete this media' },
            404: { description: 'Media not found' },
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
            notificationSent: { type: 'boolean', example: false },
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
        Media: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '68745bc46fce6549d063cba0' },
            capsuleId: { type: 'string', example: '68745bc26fce6549d063cb9c' },
            imageData: { type: 'string', format: 'binary', description: 'Base64-encoded image data' },
            contentType: { type: 'string', example: 'image/jpeg' },
            uploadedAt: { type: 'string', format: 'date-time', example: '2025-07-14T01:22:12.694Z' },
          },
        },
        Comment: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '6874229a9ecd46ae6a9dfbd7' },
            capsuleId: { type: 'string', example: '6873eeb421fe8c5b072ee0ca' },
            userId: { type: 'string', example: '686ddcceca2a670089de3d07' },
            message: { type: 'string', example: 'This is Awesome!' },
            createdAt: { type: 'string', format: 'date-time', example: '2025-07-13T21:18:18.876Z' },
          },
        },
      },
    },
  },
  apis: ['./routes/*.js', './controllers/*.js'],
};

module.exports = swaggerJSDoc(options);