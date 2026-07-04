import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

// Route imports
import authRoutes from './routes/authRoutes';
import settingsRoutes from './routes/settingsRoutes';
import problemRoutes from './routes/problemRoutes';
import noteRoutes from './routes/noteRoutes';
import mockRoutes from './routes/mockRoutes';
import adminRoutes from './routes/adminRoutes';

// Load env variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Express parses
app.use(express.json());
app.use(cookieParser());

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/mock', mockRoutes);
app.use('/api/admin', adminRoutes);

// Base health check route
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Undefined routes handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error occurred',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start listening
app.listen(PORT, () => {
  console.log(`===========================================`);
  console.log(`PrepFlow Express Server running on port ${PORT}`);
  console.log(`URL: http://localhost:${PORT}`);
  console.log(`===========================================`);
});

export default app;
