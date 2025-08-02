import mongoose from 'mongoose';

// Global variable to track connection status
let isConnected = false;

const connectDB = async () => {
  // If already connected, return the existing connection
  if (isConnected) {
    console.log('ℹ️ Using existing database connection');
    return mongoose.connection;
  }

  // Prioritize MongoDB Atlas connection string
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/laptop-store';
  
  // Log which database we're connecting to (masking credentials)
  const isAtlas = mongoUri.includes('mongodb+srv://');
  console.log(`🔗 Connecting to ${isAtlas ? 'MongoDB Atlas' : 'local MongoDB'}...`);
  
  try {
    // Connection options - removed deprecated options
    const options = {
      serverSelectionTimeoutMS: 10000, // Increased to 10s for Atlas
      socketTimeoutMS: 45000,
      maxPoolSize: 10, // Maximum number of connections in the connection pool
      retryWrites: true,
      w: 'majority',
      family: 4, // Use IPv4, skip trying IPv6
    };

    // Event handlers
    mongoose.connection.on('connecting', () => {
      console.log('🔄 Connecting to MongoDB...');
    });
    
    mongoose.connection.on('connected', () => {
      console.log('✅ MongoDB Connected to:', mongoose.connection.host);
      console.log('📊 Database Name:', mongoose.connection.name);
      console.log('🏷️  Connection State:', mongoose.connection.readyState);
      console.log('🔌 Using connection string:', mongoUri.split('@')[1] || mongoUri);
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB Connection Error:', err.name);
      console.error('Error message:', err.message);
      if (err.name === 'MongoServerError') {
        console.error('Error code:', err.code);
        console.error('Error code name:', err.codeName);
      }
      
      // If we're in production and using Atlas, we might want to exit
      if (process.env.NODE_ENV === 'production' && isAtlas) {
        console.error('❌ Critical: Failed to connect to MongoDB Atlas in production');
        process.exit(1);
      }
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('ℹ️  MongoDB disconnected');
    });
    
    // Connect with retry logic
    const maxRetries = 3;
    let retryCount = 0;
    
    const connectWithRetry = async () => {
      try {
        const conn = await mongoose.connect(mongoUri, options);
        console.log(`✅ Successfully connected to MongoDB: ${conn.connection.host}`);
        console.log('🔌 Connection state:', mongoose.connection.readyState);
        return conn;
      } catch (error) {
        retryCount++;
        if (retryCount < maxRetries) {
          console.log(`⚠️  Connection attempt ${retryCount} failed, retrying in 5 seconds...`);
          await new Promise(resolve => setTimeout(resolve, 5000));
          return connectWithRetry();
        }
        throw error; // If all retries fail, throw the error
      }
    };
    
    const conn = await connectWithRetry();
    isConnected = true;
    return conn;
  } catch (error) {
    console.error('MongoDB connection error details:');
    console.error('- Error name:', error.name);
    console.error('- Error message:', error.message);
    console.error('- Error code:', error.code);
    console.error('- Error code name:', error.codeName);
    
    // Provide more helpful error messages
    if (error.name === 'MongoServerSelectionError') {
      console.error('\nTroubleshooting tips:');
      console.error('1. Make sure MongoDB is running on your system');
      console.error('2. Check if the connection string is correct:', mongoUri);
      console.error('3. If using a remote database, ensure it\'s accessible from your network');
      console.error('4. Check if any firewall is blocking the connection');
    }
    
    process.exit(1);
  }
};

// Using both named and default export for compatibility
export { connectDB };
export default connectDB;
