const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Time Capsule',
      version: '1.0.0',
      description: 'API documentation for our project',
    },
    servers: [
      {
        url: 'https://time-capsule-3kgt.onrender.com',
      },
    ],
  },
  apis: ['./routes/*.js', './models/*.js'], 
};

const swaggerSpec = swaggerJSDoc(options);

function swaggerDocs(app) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

module.exports = swaggerDocs;