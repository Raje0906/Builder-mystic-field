// Enable ES module syntax in this file
'use strict';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import fs from 'fs';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3002;

// Enable CORS for all routes
const corsOptions = {
  origin: ['http://localhost:8080', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Cache-Control',
    'Accept',
    'Pragma',
    'If-Modified-Since',
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Headers',
    'Access-Control-Allow-Methods',
    'Access-Control-Allow-Credentials'
  ],
  exposedHeaders: [
    'Content-Length',
    'Content-Type',
    'Authorization',
    'X-Requested-With'
  ],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Set up file logging
const logStream = fs.createWriteStream('server.log', { flags: 'a' });

// CORS configuration with enhanced security
const configureCors = () => {
  // In development, allow all origins for easier testing
  if (process.env.NODE_ENV !== 'production') {
    return (req, res, next) => {
      // Set CORS headers for all responses
      const allowedOrigins = ['http://localhost:8080', 'http://localhost:3000'];
      const origin = req.headers.origin;
      
      if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
      }
      
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control');
      res.header('Access-Control-Allow-Credentials', 'true');
      
      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        return res.status(200).json({
          status: 200,
          message: 'Preflight check successful',
        });
      }
      
      next();
    };
  }
  
  // Production CORS settings
  const allowedOrigins = [
    'http://localhost:8080',
    'http://localhost:3000',
    'http://localhost:3002',
    'http://127.0.0.1:3002',
    'http://127.0.0.1:8080',
    'https://world-laptop.vercel.app',
    'https://laptop-crm-backend.onrender.com',
    'https://laptop-crm-frontend.onrender.com'
  ];
  
  return {
    origin: function(origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // Check if origin matches any of the allowed origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      // For development, allow any localhost or 127.0.0.1 with any port
      if (process.env.NODE_ENV !== 'production' && 
          (origin.startsWith('http://localhost:') || 
           origin.startsWith('http://127.0.0.1:'))) {
        return callback(null, true);
      }
      
      const msg = `The CORS policy for this site does not allow access from the specified origin: ${origin}`;
      console.warn(msg);
      return callback(new Error(msg), false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'Access-Control-Allow-Headers',
      'X-Access-Token',
      'X-Refresh-Token'
    ],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
  };

  return corsOptions;
};

// Apply our custom CORS middleware for development
app.use(configureCors());

// For production, use standard CORS with specific options
if (process.env.NODE_ENV === 'production') {
  const corsOptions = {
    origin: [
      'https://world-laptop.vercel.app',
      'https://laptop-crm-backend.onrender.com',
      'https://laptop-crm-frontend.onrender.com'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'Access-Control-Allow-Headers',
      'X-Access-Token',
      'X-Refresh-Token'
    ],
    credentials: true,
    optionsSuccessStatus: 200
  };
  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));
}

// Other middleware
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Import database connection
import connectDB from './config/db.js';

// Import routes
import authRoutes from './routes/auth.js';
import customerRoutes from './routes/customers.js';
import productRoutes from './routes/products.js';
import saleRoutes from './routes/sales.js';
import repairRoutes from './routes/repairs.js';
import notificationRoutes from './routes/notifications.js';
import storeRoutes from './routes/stores.js';
import reportRoutes from './routes/reports.js';
import userRoutes from './routes/users.js';
import healthRouter from './routes/health.js';
import { testEmailRouter } from './routes/test-email.js';

// Import middleware
import errorHandler from './middleware/errorHandler.js';
import { authenticateToken } from './middleware/auth.js';

// Global variable to track MongoDB connection status
let isMongoConnected = false;

// Connect to MongoDB and start the server
const startServer = async () => {
  try {
    // MongoDB Connection
    if (!isMongoConnected) {
      const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/laptop-store';
      const isAtlas = mongoUri.includes('mongodb+srv://');
      
      console.log(`🔗 Connecting to ${isAtlas ? 'MongoDB Atlas' : 'MongoDB'}...`);
      
      // Connection options
      const options = {
        serverSelectionTimeoutMS: 10000, // 10 seconds
        socketTimeoutMS: 45000, // 45 seconds
        maxPoolSize: 10,
        retryWrites: true,
        w: 'majority',
        family: 4, // Use IPv4, skip IPv6
      };
      
      // Event handlers
      mongoose.connection.on('connecting', () => {
        console.log('🔄 Connecting to MongoDB...');
      });
      
      mongoose.connection.on('connected', () => {
        isMongoConnected = true;
        console.log('✅ MongoDB Connected to:', mongoose.connection.host);
        console.log('📊 Database Name:', mongoose.connection.name);
      });
      
      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB Connection Error:', err.name);
        console.error('Error message:', err.message);
        
        if (process.env.NODE_ENV === 'production' && isAtlas) {
          console.error('❌ Critical: Failed to connect to MongoDB Atlas in production');
          process.exit(1);
        }
      });
      
      mongoose.connection.on('disconnected', () => {
        isMongoConnected = false;
        console.warn('ℹ️ MongoDB disconnected');
      });
      
      // Connect to MongoDB
      await mongoose.connect(mongoUri, options);
    }

    // Start the Express server
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n🚀 Server running in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`📡 API URL: http://localhost:${PORT}/api`);
      console.log(`🌍 Web Interface: http://localhost:${PORT}`);
      console.log(`🔄 Process ID: ${process.pid}`);
      console.log('📅 Server Time:', new Date().toISOString());
      console.log('✅ Server is ready to accept connections');
      
      // Log database connection status
      if (mongoose.connection.readyState === 1) {
        console.log('\n📊 Database Connection Status:');
        console.log(`   - Status: ✅ Connected`);
        console.log(`   - Database: ${mongoose.connection.name}`);
        console.log(`   - Host: ${mongoose.connection.host}`);
        console.log(`   - Port: ${mongoose.connection.port || 'default'}`);
        console.log(`   - Using: ${mongoose.connection.host.includes('mongodb.net') ? 'MongoDB Atlas' : 'Local MongoDB'}`);
      } else {
        console.warn('⚠️  Database connection status: Not connected');
      }
    });

    // Graceful shutdown handler
    const gracefulShutdown = async () => {
      console.log('\n🛑 Received shutdown signal. Closing server...');
      
      try {
        // Close the server
        await new Promise((resolve) => server.close(resolve));
        console.log('✅ HTTP server closed');
        
        // Close MongoDB connection if connected
        if (mongoose.connection.readyState === 1) {
          await mongoose.connection.close(false);
          console.log('✅ MongoDB connection closed');
        }
        
        process.exit(0);
      } catch (err) {
        console.error('❌ Error during shutdown:', err);
        process.exit(1);
      }
      
      // Force close after 5 seconds if not already closed
      setTimeout(() => {
        console.error('❌ Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 5000);
    };

    // Track if we're already shutting down
    let isShuttingDown = false;

    // Handle termination signals
    const setupSignalHandlers = () => {
      const signals = ['SIGTERM', 'SIGINT'];
      signals.forEach(signal => {
        process.on(signal, () => {
          if (isShuttingDown) return;
          isShuttingDown = true;
          console.log(`\n${signal} received, starting graceful shutdown...`);
          gracefulShutdown().catch(err => {
            console.error('Error during graceful shutdown:', err);
            process.exit(1);
          });
        });
      });
    };

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      // Don't crash on unhandled rejections in production
      if (process.env.NODE_ENV === 'production') {
        console.log('Suppressing unhandled rejection in production');
      } else {
        throw reason; // Let it crash in development
      }
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      if (!isShuttingDown) {
        isShuttingDown = true;
        gracefulShutdown().catch(err => {
          console.error('Error during graceful shutdown:', err);
          process.exit(1);
        });
      }
    });

    // Set up signal handlers
    setupSignalHandlers();

    return server;
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};




// CORS is already configured at the top of the file with corsOptions

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/repairs', repairRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/health', healthRouter);

// Test email route (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.use('/api/test-email', testEmailRouter);
}

// Root route
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to the Laptop Store API',
    status: 'running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Not Found',
    path: req.path
  });
});

// Store original console methods
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

// Override console.log to write to both console and log file
console.log = function(...args) {
  const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ');
  logStream.write(`[${new Date().toISOString()}] [LOG] ${message}\n`);
  originalConsoleLog.apply(console, args);
};

// Override console.error to write to both console and log file
console.error = function(...args) {
  const message = args.map(arg => arg instanceof Error ? arg.stack : 
    (typeof arg === 'object' ? JSON.stringify(arg) : arg)).join(' ');
  logStream.write(`[${new Date().toISOString()}] [ERROR] ${message}\n`);
  originalConsoleError.apply(console, args);
};

// Initialize and start the server
async function initializeServer() {
  try {
    console.log('🔄 Initializing server...');
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    
    // Get port from environment or use default
    const port = process.env.PORT || 3002;
    
    // Connect to MongoDB first
    console.log('🔗 Connecting to MongoDB...');
    await startServer().catch(error => {
      console.error('❌ Failed to connect to MongoDB:', error.message);
      if (process.env.NODE_ENV === 'production') {
        console.error('❌ Exiting process due to MongoDB connection failure in production');
        process.exit(1);
      }
    });
    
    // Only proceed if MongoDB is connected or we're in development
    if (!mongoose.connection.readyState && process.env.NODE_ENV === 'production') {
      throw new Error('MongoDB connection failed in production mode');
    }
    
    // Start the Express server
    const server = app.listen(port, '0.0.0.0', () => {
      console.log(`\n🚀 Server running in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`📡 API URL: http://localhost:${port}/api`);
      console.log(`🌍 Web Interface: http://localhost:${port}`);
      console.log(`🔄 Process ID: ${process.pid}`);
      console.log('📅 Server Time:', new Date().toISOString());
      console.log('✅ Server is ready to accept connections');
      
      // Log database connection status
      if (mongoose.connection.readyState === 1) {
        console.log('\n📊 Database Connection Status:');
        console.log(`   - Status: ✅ Connected`);
        console.log(`   - Database: ${mongoose.connection.name}`);
        console.log(`   - Host: ${mongoose.connection.host}`);
        console.log(`   - Port: ${mongoose.connection.port || 'default'}`);
        console.log(`   - Using: ${mongoose.connection.host.includes('mongodb.net') ? 'MongoDB Atlas' : 'Local MongoDB'}`);
      } else {
        console.warn('⚠️  Database connection status: Not connected');
      }
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use. Please stop any other servers using this port.`);
        console.error('Try running: netstat -ano | findstr :' + PORT);
        console.error('Then: taskkill /PID <PID> /F');
      } else {
        console.error('Server error:', error);
      }
      process.exit(1);
    });

    // Handle process termination
    const shutdown = async () => {
      console.log('\n🛑 Shutting down server...');
      
      // Close the server
      server.close(() => {
        console.log('✅ Server closed');
        
        // Close MongoDB connection
        if (mongoose.connection) {
          mongoose.connection.close(false, () => {
            console.log('✅ MongoDB connection closed');
            process.exit(0);
          });
        } else {
          process.exit(0);
        }
      });
    };

    // Handle process termination signals
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      shutdown();
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error('Unhandled Rejection:', err);
      shutdown();
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Run notification system test in development
if (process.env.NODE_ENV !== 'production') {
  import('./services/realNotificationService.js')
    .then(notificationService => {
      if (notificationService && notificationService.testNotificationSystem) {
        return notificationService.testNotificationSystem();
      }
      console.log('testNotificationSystem function not found in the notification service');
    })
    .catch(error => {
      console.error('Error in notification system test:', error);
    });
}
// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Add health check route
app.use('/api/health', healthRouter);

app.use(compression());

// Rate limiting (relaxed for /api/auth)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
// Only apply limiter to non-auth routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api/auth')) {
    return next(); // No rate limit for /api/auth
  }
  limiter(req, res, next);
});
app.get('/api/health', (req, res) => {
  res.json({
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});
// Simple test endpoint
app.get("/api/test-repair", (req, res) => {
  console.log('Test repair endpoint hit!');
  res.json({
    success: true,
    message: 'Test repair endpoint is working!',
    query: req.query
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params
  });

  // Default to 500 if status code not set
  const statusCode = err.statusCode || 500;
  
  // Return JSON response
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// API Routes with debug logging
const apiRoutes = [
  { path: '/api/auth', router: authRoutes },
  { path: '/api/customers', router: customerRoutes },
  { path: '/api/products', router: productRoutes },
  { path: '/api/sales', router: saleRoutes },
  { path: '/api/repairs', router: repairRoutes },
  { path: '/api/notifications', router: notificationRoutes },
  { path: '/api/stores', router: storeRoutes },
  { path: '/api/reports', router: reportRoutes },
  { path: '/api/users', router: userRoutes },
  { path: '/api', router: testEmailRouter },
];

// Apply routes with error handling
apiRoutes.forEach(route => {
  console.log(`Registering route: ${route.path}`);
  try {
    if (route.middleware) {
      console.log(`  - Adding middleware for ${route.path}`);
      app.use(route.path, route.middleware, route.router);
    } else {
      console.log(`  - No middleware for ${route.path}`);
      app.use(route.path, route.router);
    }
    console.log(`  - Successfully registered ${route.path}`);
  } catch (error) {
    console.error(`❌ Failed to register route ${route.path}:`, error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      route: route.path,
      router: route.router ? 'Router exists' : 'Router is undefined!',
      middleware: route.middleware ? 'Middleware exists' : 'No middleware'
    });
    // Continue with other routes even if one fails
  }
});

// Debug: Log all registered routes
app._router.stack.forEach((r) => {
  if (r.route && r.route.path) {
    console.log(`Registered route: ${r.route.path} [${Object.keys(r.route.methods).map(m => m.toUpperCase()).join(',')}]`);
  } else if (r.name === 'router') {
    // This is a router mounted at some path
    console.log(`Router mounted at: ${r.regexp}`);
    r.handle.stack.forEach(handler => {
      if (handler.route) {
        console.log(`  - ${handler.route.path} [${Object.keys(handler.route.methods).map(m => m.toUpperCase()).join(',')}]`);
      }
    });
  }
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.originalUrl}`
  });
});

// Serve static files based on environment

// Try multiple possible locations for the client build
const possibleClientPaths = [
  path.join(process.cwd(), 'dist'),                    // For local development
  path.join(process.cwd(), '..', 'dist'),              // For some deployment setups
  path.join(process.cwd(), '..', '..', 'dist'),        // For Render.com
  path.join(process.cwd(), '..', '..', '..', 'dist'),  // For deeper nesting
  '/app/dist',                                         // Common Docker/container path
  '/var/task/dist',                                    // AWS Lambda
  '/opt/render/project/backend/dist'                   // Render.com backend path
];

// Find the first existing client build path
let clientBuildPath = '';
for (const possiblePath of possibleClientPaths) {
  if (fs.existsSync(possiblePath)) {
    clientBuildPath = possiblePath;
    break;
  }
}

const isProduction = process.env.NODE_ENV === 'production';
const clientBuildExists = clientBuildPath && fs.existsSync(clientBuildPath);

console.log(`Environment: ${isProduction ? 'production' : 'development'}`);
console.log(`Client build path: ${clientBuildPath}`);
console.log(`Client build exists: ${clientBuildExists}`);

// Serve static files if they exist
if (clientBuildExists) {
  console.log(`✅ Serving static files from: ${clientBuildPath}`);
  
  // Serve static files from the React app
  app.use(express.static(clientBuildPath, {
    etag: true,
    lastModified: true,
    maxAge: '1d',
    setHeaders: (res, path) => {
      if (path.endsWith('.html')) {
        // Prevent caching of HTML files
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('Surrogate-Control', 'no-store');
      }
    }
  }));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    const indexPath = path.join(clientBuildPath, 'index.html');
    console.log(`📤 Serving index.html for ${req.path} from ${indexPath}`);
    
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error('❌ Error sending file:', err);
        res.status(500).json({
          error: 'Error serving the application',
          path: req.path,
          resolvedPath: indexPath,
          errorDetails: err.message,
          timestamp: new Date().toISOString()
        });
      }
    });
  });
} else {
  // If no client build exists, just serve the API
  console.warn('⚠️ No client build found, serving API only');
  
  app.get('/', (req, res) => {
    res.json({
      message: 'Welcome to the Laptop Store CRM API',
      status: 'running',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      clientBuildAvailable: false,
      api_docs: '/api',
      possibleClientPaths: possibleClientPaths,
      currentWorkingDir: process.cwd(),
      filesInRoot: fs.readdirSync(process.cwd())
    });
  });
  
  // Catch-all for unhandled routes
  app.use((req, res) => {
    res.status(404).json({
      error: 'Not Found',
      message: `The requested resource ${req.path} was not found on this server.`,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      clientBuildPath: clientBuildPath,
      currentWorkingDir: process.cwd(),
      filesInRoot: fs.readdirSync(process.cwd())
    });
  });
}

// Error handling middleware (must be last)
app.use(errorHandler);

// Get port from environment variable or use default
const port = process.env.PORT || PORT;

// Start the server
const startApp = async () => {
  try {
    // First connect to MongoDB
    await startServer();
    
    // Then start the Express server
    const server = app.listen(port, '0.0.0.0', () => {
      console.log(`\n🚀 Server running in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`📡 API URL: http://localhost:${port}/api`);
      console.log(`🌍 Web Interface: http://localhost:${port}`);
      console.log(`🔄 Process ID: ${process.pid}`);
      console.log('📅 Server Time:', new Date().toISOString());
      console.log('✅ Server is ready to accept connections');
      
      // Log database connection status
      if (mongoose.connection.readyState === 1) {
        console.log('\n📊 Database Connection Status:');
        console.log(`   - Status: ✅ Connected`);
        console.log(`   - Database: ${mongoose.connection.name}`);
        console.log(`   - Host: ${mongoose.connection.host}`);
        console.log(`   - Port: ${mongoose.connection.port || 'default'}`);
        console.log(`   - Using: ${mongoose.connection.host.includes('mongodb.net') ? 'MongoDB Atlas' : 'Local MongoDB'}`);
      } else {
        console.warn('⚠️  Database connection status: Not connected');
      }
    });
    
    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${port} is already in use. Please stop any other servers using this port.`);
        console.error('Try running: netstat -ano | findstr :' + port);
        console.error('Then: taskkill /PID <PID> /F');
      } else {
        console.error('Server error:', error);
      }
      process.exit(1);
    });
    
    // Handle process termination
    const shutdown = async () => {
      console.log('\n🛑 Shutting down server...');
      
      // Close the server
      server.close(() => {
        console.log('✅ Server closed');
        
        // Close MongoDB connection if connected
        if (mongoose.connection.readyState === 1) {
          mongoose.connection.close(false, () => {
            console.log('✅ MongoDB connection closed');
            process.exit(0);
          });
        } else {
          process.exit(0);
        }
      });
    };
    
    // Handle process termination signals
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      shutdown();
    });
    
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error('Unhandled Rejection:', err);
      shutdown();
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};



// Start the server
startServer().catch(err => {
  console.error('Fatal error during server startup:', err);
  process.exit(1);
});

export default app;