import express from 'express';
import { connectDB } from './config/db.js';
import repairRoutes from './routes/repairs.js';

const app = express();
const PORT = 3002;

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

// Parse JSON bodies
app.use(express.json());

// Mount the repairs routes
app.use('/api/repairs', repairRoutes);

// Simple test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Test route is working!' });
});

// Connect to MongoDB
console.log('Connecting to MongoDB...');
connectDB()
  .then(() => {
    console.log('MongoDB connected successfully');
    
    // Start the server
    return new Promise((resolve) => {
      const server = app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server is running on http://localhost:${PORT}`);
        console.log(`Test the API at http://localhost:${PORT}/api/test`);
        console.log(`Test repair tracking at http://localhost:${PORT}/api/repairs/track/status?email=test@example.com`);
        resolve(server);
      });
    });
  })
  .then((server) => {
    // Test the repair endpoint after a short delay
    return new Promise((resolve) => {
      setTimeout(async () => {
        console.log('\n--- Testing Repair Endpoint ---');
        const testEmail = 'rajeaditya999@gmail.com';
        const testUrl = `http://localhost:${PORT}/api/repairs/track/status?email=${encodeURIComponent(testEmail)}`;
        
        console.log('Testing URL:', testUrl);
        
        try {
          console.log('Sending GET request...');
          const response = await fetch(testUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json'
            }
          });
          
          console.log('Response status:', response.status, response.statusText);
          
          if (!response.ok) {
            console.error('Error response:', await response.text());
            return;
          }
          
          const data = await response.json();
          console.log('Response data:', JSON.stringify(data, null, 2));
          
          if (data && data.success === false) {
            console.error('API Error:', data.message);
          }
          
        } catch (error) {
          console.error('Error testing endpoint:', error);
          if (error.response) {
            console.error('Error response data:', error.response.data);
            console.error('Error response status:', error.response.status);
            console.error('Error response headers:', error.response.headers);
          } else if (error.request) {
            console.error('No response received:', error.request);
          } else {
            console.error('Error setting up request:', error.message);
          }
        }
      }, 1000);
    });
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });
