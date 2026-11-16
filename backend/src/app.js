import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env.js';
import { httpLogger } from './config/logger.js';
import { sessionMiddleware } from './config/session.js';
import apiRoutes from './routes.js';
import { notFoundHandler } from './middleware/not-found.js';
import { errorHandler } from './middleware/error-handler.js';

const app = express();

// Trust proxy if configured
if (env.TRUST_PROXY) {
  app.set('trust proxy', 1);
}

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: env.NODE_ENV === 'production' ? undefined : false,
  })
);

// CORS
app.use(
  cors({
    origin: env.PUBLIC_ORIGIN,
    credentials: true,
  })
);

// Structured logging
app.use(httpLogger);

// Body parsing with size limit
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Sesi hanya untuk endpoint auth dan admin
app.use('/api/v1/auth', sessionMiddleware);
app.use('/api/v1/admin', sessionMiddleware);

// Mount API v1
app.use('/api/v1', apiRoutes);

// 404 & Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;

