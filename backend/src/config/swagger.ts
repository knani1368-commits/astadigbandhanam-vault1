import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Aṣṭa Digbandhanam Password Manager API',
      version: '1.0.0',
      description: 'A production-ready password manager with eight-directional security protection',
      contact: {
        name: 'API Support',
        email: 'support@astadigbandhanam.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3001',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
            },
            password: {
              type: 'string',
              minLength: 8,
              description: 'User password (will be hashed)',
            },
            isEmailVerified: {
              type: 'boolean',
              description: 'Email verification status',
            },
            twoFactorEnabled: {
              type: 'boolean',
              description: 'Two-factor authentication status',
            },
            securityScore: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              description: 'Overall security score based on enabled features',
            },
          },
        },
        VaultItem: {
          type: 'object',
          required: ['type', 'encryptedData'],
          properties: {
            type: {
              type: 'string',
              enum: ['login', 'secureNote', 'paymentCard', 'identity'],
              description: 'Type of vault item',
            },
            encryptedData: {
              type: 'string',
              description: 'Encrypted vault item data',
            },
            tags: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Tags for categorization',
            },
            favorite: {
              type: 'boolean',
              description: 'Whether item is marked as favorite',
            },
          },
        },
        SecurityFeature: {
          type: 'object',
          properties: {
            direction: {
              type: 'string',
              enum: ['east', 'southeast', 'south', 'southwest', 'west', 'northwest', 'north', 'northeast'],
              description: 'Direction in the mandala',
            },
            name: {
              type: 'string',
              description: 'Feature name',
            },
            enabled: {
              type: 'boolean',
              description: 'Whether feature is enabled',
            },
            score: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              description: 'Security score for this feature',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              description: 'Error message',
            },
            code: {
              type: 'string',
              description: 'Error code',
            },
            details: {
              type: 'object',
              description: 'Additional error details',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // paths to files containing OpenAPI definitions
};

export const swaggerSpec = swaggerJSDoc(options);
