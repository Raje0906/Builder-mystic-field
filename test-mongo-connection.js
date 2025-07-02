import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// MongoDB connection URI
const mongoURI = 'mongodb://127.0.0.1:27017/laptop-store';

// Connection options
const options = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

console.log('🔍 Testing MongoDB connection...');
console.log(`   - URI: ${mongoURI}`);
console.log('   - Options:', JSON.stringify(options, null, 2));

// Function to test MongoDB connection
async function testMongoConnection() {
  try {
    console.log('\n🔌 Connecting to MongoDB...');
    
    // Connect to MongoDB
    await mongoose.connect(mongoURI, options);
    
    console.log('✅ Successfully connected to MongoDB!');
    console.log('   - Database Name:', mongoose.connection.name);
    console.log('   - Host:', mongoose.connection.host);
    console.log('   - Port:', mongoose.connection.port);
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📂 Collections in database:');
    collections.forEach(collection => {
      console.log(`   - ${collection.name}`);
    });
    
    // Check if repairs collection exists
    const hasRepairsCollection = collections.some(c => c.name === 'repairs');
    console.log('\n🔍 Repairs collection exists:', hasRepairsCollection);
    
    if (hasRepairsCollection) {
      // Count documents in repairs collection
      const count = await mongoose.connection.db.collection('repairs').countDocuments();
      console.log(`   - Number of repair records: ${count}`);
    }
    
    // Close the connection
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed.');
    
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
    
    if (error.name === 'MongoServerSelectionError') {
      console.error('\n💡 Troubleshooting Tips:');
      console.error('1. Make sure MongoDB is running on your system');
      console.error('2. Check if the MongoDB service is started');
      console.error('3. Verify the connection string is correct');
    }
    
    process.exit(1);
  }
}

// Run the test
testMongoConnection();
