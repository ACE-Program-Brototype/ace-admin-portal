import { logger } from '../utils/logger.js';

// Default allowed origins requested: localhost:5173 and ace.brototype.com
const defaultOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://ace.brototype.com',
  'http://ace.brototype.com'
];

// Combine with any extra comma-separated origins from environment variables
const envOrigins = (process.env.ALLOWED_ORIGINS || process.env.CLIENT_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

export const allowedOrigins = Array.from(new Set([...defaultOrigins, ...envOrigins]));

export const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (like curl, Postman, server-to-server) with no origin header
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    logger.warn(`[CORS Blocked] Request from unauthorized origin: ${origin}`);
    const error = new Error(`Not allowed by CORS: Origin "${origin}" is not authorized`);
    error.status = 403;
    return callback(error);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 200
};
