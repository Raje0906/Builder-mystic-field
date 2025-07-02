import mongoose from 'mongoose';

const testDB = async () => {
  try {
    console.log('🔍 Testing MongoDB connection...');
    
    const mongoURI = 'mongodb://127.0.0.1:27017/laptop-store';
    
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Check if customers collection exists
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📋 Available collections:', collections.map(c => c.name));
    
    if (collections.some(c => c.name === 'customers')) {
      console.log('🔍 Querying customers collection...');
      const customers = await mongoose.connection.db.collection('customers').find({}).toArray();
      console.log(`📊 Found ${customers.length} customers:`);
      console.log(customers);
      
      // Test search functionality
      const searchTerm = 'test';
      console.log(`\n🔍 Testing search for: ${searchTerm}`);
      const searchResults = await mongoose.connection.db.collection('customers')
        .find({
          $or: [
            { name: { $regex: searchTerm, $options: 'i' } },
            { email: { $regex: searchTerm, $options: 'i' } },
            { phone: { $regex: searchTerm, $options: 'i' } }
          ]
        })
        .toArray();
      
      console.log(`🔍 Found ${searchResults.length} matching customers`);
      console.log(searchResults);
    } else {
      console.log('❌ Customers collection does not exist');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  }
};

testDB();
