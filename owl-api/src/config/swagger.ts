import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Project OwL API',
      version: '1.0.0',
      description: 'API de gestion des capteurs pour le projet OwL',
    },
    servers: [
      {
        url: '/api', // URL relative pour que ça marche en local et en prod
        description: 'API Root',
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
      // DÉFINITION DES MODÈLES DE DONNÉES
      schemas: {
        SensorType: {
          type: 'object',
          properties: {
            type_key: {
              type: 'string',
              enum: ['window', 'temperature', 'humidity', 'air_quality'],
            },
            name: { type: 'string' },
            unit: { type: 'string' },
          },
        },
        HubInfo: {
          type: 'object',
          properties: {
            hub_id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
          },
        },
        Sensor: {
          type: 'object',
          properties: {
            sensor_id: { type: 'string', format: 'uuid' },
            hub: { $ref: '#/components/schemas/HubInfo' },
            name: { type: 'string' },
            displayValue: { type: 'string', example: 'Ouvert' },
            state_changed_at: {
              type: 'string',
              format: 'date-time',
              nullable: true,
            },
            type: { $ref: '#/components/schemas/SensorType' },
          },
        },
        SensorReading: {
          type: 'object',
          properties: {
            reading_id: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' },
            value_bool: { type: 'boolean', nullable: true },
            value_num: { type: 'number', nullable: true },
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
  // Chemin vers les fichiers contenant les annotations
  apis: ['./src/api/routes/*.ts', './src/index.ts'],
};

export const specs = swaggerJsdoc(options);
