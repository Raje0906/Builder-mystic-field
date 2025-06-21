import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3004;

// Middleware
app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/api/health', (req, res) => {
  console.log('Health check endpoint hit!');
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Track repair status endpoint
app.get('/api/repairs/track/status', (req, res) => {
  console.log('Track status endpoint hit with query:', req.query);
  
  // Simulate a response for testing
  res.json({
    success: true,
    data: [
      {
        ticketNumber: 'TEST123',
        status: 'In Progress',
        device: 'Laptop',
        issue: 'Test repair',
        receivedDate: new Date().toISOString(),
        estimatedCompletion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        totalCost: 99.99,
        customer: {
          name: 'Test User',
          phone: '1234567890',
          email: 'test@example.com',
          address: {
            line1: '123 Test St',
            city: 'Test City',
            state: 'TS',
            pincode: '12345'
          }
        }
      }
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start the server
async function startServer() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/laptop-store', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ Connected to MongoDB');

    // Start the Express server
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n🚀 Server running on port ${PORT}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔗 Test repair tracking: http://localhost:${PORT}/api/repairs/track/status?email=test@example.com`);
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use.`);
      } else {
        console.error('Server error:', error);
      }
      process.exit(1);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

// Start the server
startServer();
