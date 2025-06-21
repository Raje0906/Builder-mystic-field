import express from 'express';

const app = express();
const PORT = 3003; // Using a different port to avoid conflicts

// Simple test endpoint
app.get('/api/test', (req, res) => {
  console.log('Test endpoint hit!');
  res.json({
    success: true,
    message: 'Test endpoint is working!',
    time: new Date().toISOString()
  });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Test server running on port ${PORT}`);
  console.log(`🔗 Test URL: http://localhost:${PORT}/api/test`);
});
