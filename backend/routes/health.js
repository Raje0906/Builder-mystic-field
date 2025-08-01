import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    // Check database connection
    const dbState = mongoose.connection.readyState;
    const isDbConnected = dbState === 1; // 1 = connected
    
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: isDbConnected ? 'connected' : 'disconnected',
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version,
      memoryUsage: process.memoryUsage()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'error',
      message: 'Service Unavailable',
      error: error.message,
      database: 'error'
    });
  }
});

export default router;
