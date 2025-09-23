const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test configuration
const testConfig = {
  timeout: 5000,
  validateStatus: function (status) {
    return status < 500; // Accept all status codes below 500
  }
};

const runTests = async () => {
  console.log('🧪 Starting API Tests...\n');

  const tests = [
    {
      name: 'Health Check',
      method: 'GET',
      url: 'http://localhost:5000/health',
      expectedStatus: 200
    },
    {
      name: 'Get All Issues',
      method: 'GET',
      url: `${BASE_URL}/issues?category=all&status=all`,
      expectedStatus: 200
    },
    {
      name: 'Get Issue by ID',
      method: 'GET',
      url: `${BASE_URL}/issues/1`,
      expectedStatus: [200, 404] // 404 is acceptable if issue doesn't exist
    },
    {
      name: 'Register User (should work)',
      method: 'POST',
      url: `${BASE_URL}/auth/register`,
      data: {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        phone: '+1234567890'
      },
      expectedStatus: [201, 400] // 400 if user already exists
    },
    {
      name: 'Login User',
      method: 'POST',
      url: `${BASE_URL}/auth/login`,
      data: {
        email: 'john@example.com',
        password: 'password123'
      },
      expectedStatus: 200
    }
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  for (const test of tests) {
    try {
      console.log(`🔍 Testing: ${test.name}`);
      
      let response;
      if (test.method === 'GET') {
        response = await axios.get(test.url, testConfig);
      } else if (test.method === 'POST') {
        response = await axios.post(test.url, test.data, testConfig);
      }

      const expectedStatuses = Array.isArray(test.expectedStatus) 
        ? test.expectedStatus 
        : [test.expectedStatus];

      if (expectedStatuses.includes(response.status)) {
        console.log(`✅ ${test.name}: PASSED (Status: ${response.status})`);
        passedTests++;
      } else {
        console.log(`❌ ${test.name}: FAILED (Expected: ${expectedStatuses.join(' or ')}, Got: ${response.status})`);
        console.log(`   Response: ${JSON.stringify(response.data).substring(0, 100)}...`);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ERROR - ${error.message}`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Response: ${JSON.stringify(error.response.data).substring(0, 100)}...`);
      }
    }
    console.log('');
  }

  console.log(`\n📊 Test Results: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Your API is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Check the output above for details.');
  }
};

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };
