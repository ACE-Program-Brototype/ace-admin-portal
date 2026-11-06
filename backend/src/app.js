import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { corsOptions } from './config/corsOptions.js';
import apiRoutes from './routes/apiRoutes.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration (accepts localhost:5173 and ace.brototype.com)
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable pre-flight for all routes

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Ace Community API',
    docs: '/api/health'
  });
});

// Mount API routes
app.use('/api', apiRoutes);

// Fallback error handlers
app.use(notFound);
app.use(errorHandler);

export default app;
