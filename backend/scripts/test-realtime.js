const io = require('socket.io-client');
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
const API_URL = `${BASE_URL}/api`;

// Test configuration
const testConfig = {
  timeout: 10000,
  validateStatus: function (status) {
    return status < 500;
  }
};

let citizenToken = '';

const testRealTimeUpdates = async () => {
  console.log('🔌 Testing Real-Time Socket.IO Functionality...\n');

  try {
    // Step 1: Login to get token
    console.log('🔐 Step 1: Logging in as citizen...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'john@example.com',
      password: 'password123'
    }, testConfig);

    if (loginResponse.status === 200) {
      citizenToken = loginResponse.data.token;
      console.log('✅ Login successful');
    } else {
      throw new Error('Login failed');
    }

    // Step 2: Connect to Socket.IO
    console.log('\n🔌 Step 2: Connecting to Socket.IO...');
    const socket = io(BASE_URL, {
      auth: {
        token: citizenToken
      },
      transports: ['websocket', 'polling']
    });

    // Promise to handle socket connection
    const socketConnected = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Socket connection timeout'));
      }, 5000);

      socket.on('connect', () => {
        clearTimeout(timeout);
        console.log('✅ Socket.IO connected:', socket.id);
        resolve(socket);
      });

      socket.on('connect_error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });

    await socketConnected;

    // Step 3: Set up event listeners
    console.log('\n📡 Step 3: Setting up event listeners...');
    let receivedEvents = {
      newIssue: null,
      updatedIssue: null,
      assignedIssue: null
    };

    socket.on('new-issue', (issue) => {
      console.log('📝 Received new-issue event:', issue.id, issue.title);
      receivedEvents.newIssue = issue;
    });

    socket.on('issue-updated', (issue) => {
      console.log('🔄 Received issue-updated event:', issue.id, issue.status);
      receivedEvents.updatedIssue = issue;
    });

    socket.on('issue-assigned', (issue) => {
      console.log('👨‍💼 Received issue-assigned event:', issue.id);
      receivedEvents.assignedIssue = issue;
    });

    // Step 4: Create a new issue to trigger real-time event
    console.log('\n📝 Step 4: Creating new issue to test real-time updates...');
    const newIssueData = {
      title: 'Real-time Test Issue',
      description: 'This issue is created to test real-time Socket.IO functionality',
      category: 'other',
      severity: 3,
      latitude: 40.7128,
      longitude: -74.0060,
      address: 'Test Address for Real-time',
      photos: []
    };

    const createResponse = await axios.post(`${API_URL}/issues`, newIssueData, {
      ...testConfig,
      headers: {
        'Authorization': `Bearer ${citizenToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (createResponse.status === 201) {
      console.log('✅ Issue created successfully:', createResponse.data.id);
      
      // Wait for real-time event
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (receivedEvents.newIssue) {
        console.log('✅ Real-time new-issue event received!');
      } else {
        console.log('❌ Real-time new-issue event NOT received');
      }
    }

    // Step 5: Test admin login and issue assignment
    console.log('\n👨‍💼 Step 5: Testing admin operations...');
    const adminLoginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@civic-platform.com',
      password: 'admin123'
    }, testConfig);

    if (adminLoginResponse.status === 200) {
      const adminToken = adminLoginResponse.data.token;
      console.log('✅ Admin login successful');

      // Assign issue to official
      const assignResponse = await axios.put(`${API_URL}/issues/1/assign`, {
        assigned_to: 2 // Official ID
      }, {
        ...testConfig,
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (assignResponse.status === 200) {
        console.log('✅ Issue assigned successfully');
        
        // Wait for real-time event
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (receivedEvents.assignedIssue) {
          console.log('✅ Real-time issue-assigned event received!');
        } else {
          console.log('❌ Real-time issue-assigned event NOT received');
        }
      }
    }

    // Step 6: Test status update
    console.log('\n🔄 Step 6: Testing status update...');
    const officialLoginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'jane@city.gov',
      password: 'password123'
    }, testConfig);

    if (officialLoginResponse.status === 200) {
      const officialToken = officialLoginResponse.data.token;
      console.log('✅ Official login successful');

      // Update issue status
      const statusResponse = await axios.put(`${API_URL}/issues/1/status`, {
        status: 'in_progress',
        internal_notes: 'Started working on this issue'
      }, {
        ...testConfig,
        headers: {
          'Authorization': `Bearer ${officialToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (statusResponse.status === 200) {
        console.log('✅ Issue status updated successfully');
        
        // Wait for real-time event
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (receivedEvents.updatedIssue) {
          console.log('✅ Real-time issue-updated event received!');
        } else {
          console.log('❌ Real-time issue-updated event NOT received');
        }
      }
    }

    // Step 7: Summary
    console.log('\n📊 Real-Time Test Results:');
    console.log('==========================');
    console.log(`✅ Socket.IO Connection: Working`);
    console.log(`${receivedEvents.newIssue ? '✅' : '❌'} New Issue Events: ${receivedEvents.newIssue ? 'Working' : 'Failed'}`);
    console.log(`${receivedEvents.assignedIssue ? '✅' : '❌'} Issue Assignment Events: ${receivedEvents.assignedIssue ? 'Working' : 'Failed'}`);
    console.log(`${receivedEvents.updatedIssue ? '✅' : '❌'} Issue Update Events: ${receivedEvents.updatedIssue ? 'Working' : 'Failed'}`);

    const workingEvents = Object.values(receivedEvents).filter(Boolean).length;
    const totalEvents = Object.keys(receivedEvents).length;
    
    console.log(`\n🎯 Overall: ${workingEvents}/${totalEvents} real-time events working`);
    
    if (workingEvents === totalEvents) {
      console.log('🎉 All real-time functionality is working perfectly!');
    } else {
      console.log('⚠️  Some real-time events are not working. Check server logs.');
    }

    // Cleanup
    socket.disconnect();
    console.log('\n🔌 Socket disconnected');

  } catch (error) {
    console.error('❌ Real-time test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.status, error.response.data);
    }
  }
};

// Run tests if this file is executed directly
if (require.main === module) {
  testRealTimeUpdates().catch(console.error);
}

module.exports = { testRealTimeUpdates };
