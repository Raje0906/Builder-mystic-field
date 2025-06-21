import axios from 'axios';

const API_BASE_URL = 'http://localhost:3002/api';

async function testEndpoints() {
  try {
    console.log('🔍 Testing API endpoints...');
    
    // Test health check
    console.log('\n1. Testing health check endpoint...');
    const healthRes = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health check:', healthRes.data);

    // Test customers endpoint
    console.log('\n2. Testing customers endpoint...');
    const customersRes = await axios.get(`${API_BASE_URL}/customers`);
    console.log(`✅ Found ${customersRes.data.data?.length || 0} customers`);
    
    // Test search
    console.log('\n3. Testing customer search...');
    const searchRes = await axios.get(`${API_BASE_URL}/customers?search=test`);
    console.log(`✅ Search results: ${searchRes.data.data?.length || 0} matches`);
    
    console.log('\n🎉 All tests completed successfully!');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
  }
}

testEndpoints();
