import express from 'express';
import { connectDB } from './config/db.js';
import repairRoutes from './routes/repairs.js';

const app = express();
const PORT = 3002;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Simple request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Routes
app.use('/api/repairs', repairRoutes);

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Test route is working!' });
});

// Connect to MongoDB and start server
async function startServer() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await connectDB();
    
    console.log('🚀 Starting server...');
    const server = app.listen(PORT, '0.0.0.0', () => {
      const address = server.address();
      const host = address.address === '::' ? 'localhost' : address.address;
      const port = address.port;
      
      console.log(`\n✅ Server is running at http://${host}:${port}`);
      console.log(`🔗 Test API: http://localhost:${port}/api/test`);
      console.log(`🔍 Repair Tracking: http://localhost:${port}/api/repairs/track/status?email=test@example.com`);
      
      // Test the repair endpoint after server starts
      testRepairEndpoint(port);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Test the repair endpoint
async function testRepairEndpoint(port) {
  const testEmail = 'rajeaditya999@gmail.com';
  const url = `http://localhost:${port}/api/repairs/track/status?email=${encodeURIComponent(testEmail)}`;
  
  console.log('\n🔍 Testing repair endpoint...');
  console.log(`   URL: ${url}`);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`\n📥 Response Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      console.error('❌ Error response:', await response.text());
      return;
    }
    
    const data = await response.json();
    console.log('✅ Response Data:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('❌ Error testing endpoint:', error);
    if (error.response) {
      console.error('   - Status:', error.response.status);
      console.error('   - Data:', error.response.data);
    } else {
      console.error('   - Message:', error.message);
    }
  }
}

// Start the server
startServer().catch(console.error);
