const axios = require('axios');
const io = require('socket.io-client');

// Configuration
const API_BASE_URL = process.env.API_URL || 'http://localhost:5000';
const SOCKET_URL = process.env.SOCKET_URL || 'http://localhost:5000';

// Test data
const testUsers = {
  admin: { email: 'admin@civic-platform.com', password: 'admin123' },
  citizen: { email: 'test.citizen@example.com', password: 'password123' },
  official: { email: 'test.official@example.com', password: 'password123' }
};

const testIssue = {
  title: 'Test Pothole on Main Street',
  description: 'Large pothole causing traffic issues',
  category: 'pothole',
  severity: 4,
  latitude: 40.7128,
  longitude: -74.0060,
  address: '123 Main Street, Test City',
  photos: []
};

class TestSuite {
  constructor() {
    this.tokens = {};
    this.sockets = {};
    this.testResults = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${emoji} [${timestamp}] ${message}`);
    this.testResults.push({ timestamp, message, type });
  }

  async makeRequest(method, endpoint, data = null, token = null) {
    try {
      const config = {
        method,
        url: `${API_BASE_URL}${endpoint}`,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        ...(data && { data })
      };
      
      const response = await axios(config);
      return { success: true, data: response.data, status: response.status };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || error.message,
        status: error.response?.status 
      };
    }
  }

  async testAuthentication() {
    this.log('🔐 Testing Authentication System', 'info');
    
    // Test admin login
    const adminLogin = await this.makeRequest('POST', '/api/auth/login', {
      email: testUsers.admin.email,
      password: testUsers.admin.password
    });
    
    if (adminLogin.success) {
      this.tokens.admin = adminLogin.data.token;
      this.log('Admin login successful');
    } else {
      this.log(`Admin login failed: ${adminLogin.error}`, 'error');
      return false;
    }

    // Test token validation
    const profile = await this.makeRequest('GET', '/api/auth/profile', null, this.tokens.admin);
    if (profile.success) {
      this.log(`Token validation successful for user: ${profile.data.name}`);
    } else {
      this.log(`Token validation failed: ${profile.error}`, 'error');
      return false;
    }

    return true;
  }

  async testIssueManagement() {
    this.log('📍 Testing Issue Management System', 'info');
    
    // Test creating an issue
    const createIssue = await this.makeRequest('POST', '/api/issues', testIssue, this.tokens.admin);
    if (createIssue.success) {
      this.log(`Issue created successfully: ID ${createIssue.data.id}`);
      this.testIssueId = createIssue.data.id;
    } else {
      this.log(`Issue creation failed: ${createIssue.error}`, 'error');
      return false;
    }

    // Test fetching issues
    const fetchIssues = await this.makeRequest('GET', '/api/issues');
    if (fetchIssues.success && fetchIssues.data.length > 0) {
      this.log(`Fetched ${fetchIssues.data.length} issues successfully`);
    } else {
      this.log('Failed to fetch issues', 'error');
      return false;
    }

    // Test issue filtering
    const filterIssues = await this.makeRequest('GET', '/api/issues?category=pothole&status=reported');
    if (filterIssues.success) {
      this.log(`Filtered issues successfully: ${filterIssues.data.length} potholes found`);
    } else {
      this.log(`Issue filtering failed: ${filterIssues.error}`, 'error');
    }

    // Test updating issue status
    const updateStatus = await this.makeRequest('PUT', `/api/issues/${this.testIssueId}/status`, {
      status: 'acknowledged',
      internal_notes: 'Test status update'
    }, this.tokens.admin);
    
    if (updateStatus.success) {
      this.log(`Issue status updated to: ${updateStatus.data.status}`);
    } else {
      this.log(`Status update failed: ${updateStatus.error}`, 'error');
    }

    return true;
  }

  async testAnalytics() {
    this.log('📊 Testing Analytics System', 'info');
    
    const analytics = await this.makeRequest('GET', '/api/issues/analytics', null, this.tokens.admin);
    if (analytics.success) {
      this.log('Analytics data retrieved successfully');
      this.log(`Total Issues: ${analytics.data.totalIssues}`);
      this.log(`Resolved Issues: ${analytics.data.resolvedIssues}`);
      this.log(`Categories: ${analytics.data.issuesByCategory?.length || 0}`);
      this.log(`Status Distribution: ${analytics.data.issuesByStatus?.length || 0}`);
    } else {
      this.log(`Analytics retrieval failed: ${analytics.error}`, 'error');
      return false;
    }

    return true;
  }

  async testRealTimeFeatures() {
    this.log('⚡ Testing Real-time Features (Socket.IO)', 'info');
    
    return new Promise((resolve) => {
      let eventsReceived = 0;
      const expectedEvents = 2;
      
      // Create socket connection
      const socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        timeout: 5000
      });

      socket.on('connect', () => {
        this.log('Socket.IO connection established');
        
        // Join issues room
        socket.emit('join-room', 'issues');
        
        // Listen for issue events
        socket.on('issue-created', (data) => {
          this.log(`Real-time event received: issue-created for "${data.title}"`);
          eventsReceived++;
        });

        socket.on('issue-status-changed', (data) => {
          this.log(`Real-time event received: status changed to "${data.issue.status}"`);
          eventsReceived++;
        });

        // Test notification events
        socket.on('notification', (data) => {
          this.log(`Notification received: ${data.title} - ${data.message}`);
          eventsReceived++;
        });

        // Simulate some time for events
        setTimeout(() => {
          socket.disconnect();
          if (eventsReceived > 0) {
            this.log(`Real-time testing completed: ${eventsReceived} events received`);
            resolve(true);
          } else {
            this.log('No real-time events received', 'warning');
            resolve(false);
          }
        }, 3000);
      });

      socket.on('connect_error', (error) => {
        this.log(`Socket.IO connection failed: ${error.message}`, 'error');
        resolve(false);
      });

      socket.on('disconnect', () => {
        this.log('Socket.IO disconnected');
      });
    });
  }

  async testUserManagement() {
    this.log('👥 Testing User Management', 'info');
    
    // Test fetching users (admin only)
    const users = await this.makeRequest('GET', '/api/users', null, this.tokens.admin);
    if (users.success) {
      this.log(`User management test successful: ${users.data.length} users found`);
    } else {
      this.log(`User management test failed: ${users.error}`, 'error');
      return false;
    }

    // Test fetching officials for assignment
    const officials = await this.makeRequest('GET', '/api/users/officials', null, this.tokens.admin);
    if (officials.success) {
      this.log(`Officials list retrieved: ${officials.data.length} officials available`);
    } else {
      this.log(`Officials retrieval failed: ${officials.error}`, 'error');
    }

    return true;
  }

  async testErrorHandling() {
    this.log('🛡️ Testing Error Handling', 'info');
    
    // Test invalid endpoints
    const invalidEndpoint = await this.makeRequest('GET', '/api/nonexistent');
    if (invalidEndpoint.status === 404) {
      this.log('404 error handling works correctly');
    } else {
      this.log('404 error handling failed', 'error');
    }

    // Test unauthorized access
    const unauthorized = await this.makeRequest('GET', '/api/issues/analytics');
    if (unauthorized.status === 401) {
      this.log('Unauthorized access protection works correctly');
    } else {
      this.log('Authorization protection failed', 'error');
    }

    // Test invalid data
    const invalidIssue = await this.makeRequest('POST', '/api/issues', {
      title: 'A', // Too short
      description: 'Short', // Too short
      category: 'invalid',
      severity: 10, // Out of range
      latitude: 200, // Invalid
      longitude: 200 // Invalid
    }, this.tokens.admin);
    
    if (!invalidIssue.success && invalidIssue.status === 400) {
      this.log('Input validation works correctly');
    } else {
      this.log('Input validation failed', 'error');
    }

    return true;
  }

  async runAllTests() {
    console.log('\n🚀 Starting Civic Platform Implementation Tests\n');
    console.log('=' * 60);
    
    const tests = [
      { name: 'Authentication', fn: () => this.testAuthentication() },
      { name: 'Issue Management', fn: () => this.testIssueManagement() },
      { name: 'Analytics', fn: () => this.testAnalytics() },
      { name: 'User Management', fn: () => this.testUserManagement() },
      { name: 'Real-time Features', fn: () => this.testRealTimeFeatures() },
      { name: 'Error Handling', fn: () => this.testErrorHandling() }
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
      try {
        console.log(`\n--- Running ${test.name} Tests ---`);
        const result = await test.fn();
        if (result) {
          passed++;
          this.log(`${test.name} tests PASSED`, 'success');
        } else {
          failed++;
          this.log(`${test.name} tests FAILED`, 'error');
        }
      } catch (error) {
        failed++;
        this.log(`${test.name} tests ERROR: ${error.message}`, 'error');
      }
    }

    // Summary
    console.log('\n' + '=' * 60);
    console.log('🏁 TEST SUMMARY');
    console.log('=' * 60);
    this.log(`Total Tests: ${tests.length}`);
    this.log(`Passed: ${passed}`, 'success');
    this.log(`Failed: ${failed}`, failed > 0 ? 'error' : 'success');
    this.log(`Success Rate: ${Math.round((passed / tests.length) * 100)}%`);
    
    if (failed === 0) {
      this.log('🎉 All tests passed! Your implementation is ready for demo.', 'success');
    } else {
      this.log('⚠️ Some tests failed. Please check the implementation.', 'warning');
    }

    return { passed, failed, total: tests.length };
  }
}

// Run tests if called directly
if (require.main === module) {
  const testSuite = new TestSuite();
  testSuite.runAllTests()
    .then((results) => {
      process.exit(results.failed > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error('❌ Test suite failed:', error);
      process.exit(1);
    });
}

module.exports = TestSuite;
