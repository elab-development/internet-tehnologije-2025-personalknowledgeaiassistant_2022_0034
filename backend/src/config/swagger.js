import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Personal Knowledge Base AI Assistant",
      version: "1.0.0",
      description: "API dokumentacija za Personal Knowledge Base AI Assistant",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local server",
      },
      {
        url: "http://34.134.47.223",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },

  apis: ["./src/routes/*.js"],
};

export const swaggerSpec = swaggerJsdoc(options);
