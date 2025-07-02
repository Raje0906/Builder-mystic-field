import mongoose from 'mongoose';

async function testConnection() {
  const mongoUri = 'mongodb://localhost:27017/laptop-store';
  
  console.log('Testing MongoDB connection to:', mongoUri);
  
  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log('✅ Successfully connected to MongoDB');
    console.log('Database name:', mongoose.connection.name);
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nCollections in database:');
    collections.forEach(coll => console.log(`- ${coll.name}`));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    process.exit(1);
  }
}

testConnection();
