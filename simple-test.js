import express from 'express';

const app = express();
const PORT = 3003;

// Simple test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Test route is working!' });
});

// Simple repair tracking test route
app.get('/api/repairs/track/status', (req, res) => {
  console.log('Repair tracking endpoint hit with query:', req.query);
  res.json({ 
    success: true, 
    message: 'Repair tracking endpoint is working!',
    query: req.query
  });
});

// Start the server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✅ Test server is running at http://localhost:${PORT}`);
  console.log(`🔗 Test API: http://localhost:${PORT}/api/test`);
  console.log(`🔍 Test Repair Tracking: http://localhost:${PORT}/api/repairs/track/status?email=test@example.com`);
});

// Handle server errors
server.on('error', (error) => {
  console.error('\n❌ Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please stop any other servers using this port.`);
  }
});
