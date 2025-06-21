import mongoose from 'mongoose';

async function testConnection() {
  const mongoUri = 'mongodb://localhost:27017/laptop-store';
  
  console.log('Attempting to connect to MongoDB...');
  console.log('Connection string:', mongoUri);
  
  try {
    // Set up event listeners
    mongoose.connection.on('connecting', () => {
      console.log('MongoDB connecting...');
    });
    
    mongoose.connection.on('connected', () => {
      console.log('MongoDB connected successfully');
      console.log('MongoDB connection state:', mongoose.connection.readyState);
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });
    
    // Attempt to connect
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    });
    
    console.log(`MongoDB Connected to: ${conn.connection.host}`);
    console.log('MongoDB connection state:', mongoose.connection.readyState);
    
    // Test a simple query
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('Collections in database:');
    console.log(collections.map(c => c.name));
    
    // Close the connection
    await mongoose.disconnect();
    console.log('Connection closed');
    
  } catch (error) {
    console.error('MongoDB connection error details:');
    console.error('- Error name:', error.name);
    console.error('- Error message:', error.message);
    console.error('- Error code:', error.code);
    console.error('- Error code name:', error.codeName);
    
    if (error.name === 'MongoServerSelectionError') {
      console.error('\nTroubleshooting tips:');
      console.error('1. Make sure MongoDB is running on your system');
      console.error('2. Check if the connection string is correct:', mongoUri);
      console.error('3. If using a remote database, ensure it\'s accessible from your network');
      console.error('4. Check if any firewall is blocking the connection');
    }
    
    process.exit(1);
  }
}

testConnection();
