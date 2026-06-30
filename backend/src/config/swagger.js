const swaggerJsdoc = require('swagger-jsdoc');

/**
 * Swagger/OpenAPI 3.0 configuration for auto-generated API documentation.
 * Scans all route files for @swagger JSDoc annotations.
 */
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AI Food Recommendation API',
      version: '1.0.0',
      description:
        'A comprehensive REST API for an AI-powered health-based food recommendation system. Provides user authentication, food management, personalized meal planning, health tracking, and AI-driven nutritional recommendations.',
      contact: {
        name: 'API Support',
        email: 'support@foodrec.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: process.env.SERVER_URL || 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: { type: 'array', items: { type: 'object' } },
          },
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'object' },
            message: { type: 'string' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = swaggerSpec;
