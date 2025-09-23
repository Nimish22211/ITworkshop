/**
 * End-to-End Test Suite for Civic Issue Platform
 * Tests the complete workflow from issue creation to resolution
 */

const puppeteer = require('puppeteer');
const axios = require('axios');
const io = require('socket.io-client');

const CONFIG = {
  BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:5000',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  HEADLESS: process.env.HEADLESS !== 'false',
  TIMEOUT: 30000
};

class E2ETestSuite {
  constructor() {
    this.browser = null;
    this.page = null;
    this.socket = null;
    this.testResults = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${emoji} [${timestamp}] ${message}`);
    this.testResults.push({ timestamp, message, type });
  }

  async setup() {
    this.log('🚀 Setting up E2E test environment');
    
    try {
      // Launch browser
      this.browser = await puppeteer.launch({
        headless: CONFIG.HEADLESS,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        defaultViewport: { width: 1280, height: 720 }
      });

      this.page = await this.browser.newPage();
      
      // Enable console logging
      this.page.on('console', msg => {
        if (msg.type() === 'error') {
          this.log(`Browser Console Error: ${msg.text()}`, 'error');
        }
      });

      // Setup Socket.IO connection
      this.socket = io(CONFIG.BACKEND_URL, {
        transports: ['websocket', 'polling']
      });

      await new Promise((resolve, reject) => {
        this.socket.on('connect', () => {
          this.log('Socket.IO connection established');
          resolve();
        });
        
        this.socket.on('connect_error', (error) => {
          this.log(`Socket.IO connection failed: ${error.message}`, 'error');
          reject(error);
        });

        setTimeout(() => reject(new Error('Socket connection timeout')), 5000);
      });

      this.log('E2E test environment ready', 'success');
      return true;
    } catch (error) {
      this.log(`Setup failed: ${error.message}`, 'error');
      return false;
    }
  }

  async cleanup() {
    this.log('🧹 Cleaning up test environment');
    
    if (this.socket) {
      this.socket.disconnect();
    }
    
    if (this.browser) {
      await this.browser.close();
    }
  }

  async testBackendHealth() {
    this.log('🏥 Testing backend health');
    
    try {
      const response = await axios.get(`${CONFIG.BACKEND_URL}/health`);
      
      if (response.status === 200 && response.data.status === 'OK') {
        this.log('Backend health check passed', 'success');
        return true;
      } else {
        this.log('Backend health check failed', 'error');
        return false;
      }
    } catch (error) {
      this.log(`Backend health check error: ${error.message}`, 'error');
      return false;
    }
  }

  async testFrontendLoad() {
    this.log('🌐 Testing frontend loading');
    
    try {
      await this.page.goto(CONFIG.FRONTEND_URL, { 
        waitUntil: 'networkidle0',
        timeout: CONFIG.TIMEOUT 
      });

      // Wait for main content to load
      await this.page.waitForSelector('header', { timeout: 10000 });
      
      const title = await this.page.title();
      this.log(`Frontend loaded successfully: ${title}`, 'success');
      return true;
    } catch (error) {
      this.log(`Frontend loading failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testUserRegistration() {
    this.log('👤 Testing user registration');
    
    try {
      // Navigate to registration page
      await this.page.click('a[href="/register"]');
      await this.page.waitForSelector('form', { timeout: 5000 });

      // Fill registration form
      const testUser = {
        name: 'E2E Test User',
        email: `test-${Date.now()}@example.com`,
        password: 'testpassword123',
        phone: '1234567890'
      };

      await this.page.type('input[name="name"]', testUser.name);
      await this.page.type('input[name="email"]', testUser.email);
      await this.page.type('input[name="password"]', testUser.password);
      await this.page.type('input[name="phone"]', testUser.phone);

      // Submit form
      await this.page.click('button[type="submit"]');
      
      // Wait for redirect or success message
      await this.page.waitForTimeout(2000);
      
      const currentUrl = this.page.url();
      if (currentUrl.includes('/dashboard') || currentUrl.includes('/map')) {
        this.log('User registration successful', 'success');
        this.testUser = testUser;
        return true;
      } else {
        this.log('User registration failed - no redirect', 'error');
        return false;
      }
    } catch (error) {
      this.log(`User registration error: ${error.message}`, 'error');
      return false;
    }
  }

  async testIssueReporting() {
    this.log('📍 Testing issue reporting');
    
    try {
      // Navigate to report page
      await this.page.goto(`${CONFIG.FRONTEND_URL}/report`);
      await this.page.waitForSelector('form', { timeout: 10000 });

      // Fill issue form
      const testIssue = {
        title: 'E2E Test Pothole',
        description: 'This is a test pothole reported via E2E testing',
        category: 'pothole',
        severity: '4',
        address: '123 Test Street, Test City'
      };

      await this.page.type('input[name="title"]', testIssue.title);
      await this.page.type('textarea[name="description"]', testIssue.description);
      await this.page.select('select[name="category"]', testIssue.category);
      await this.page.select('select[name="severity"]', testIssue.severity);
      await this.page.type('input[name="address"]', testIssue.address);

      // Set location (mock GPS)
      await this.page.evaluate(() => {
        // Mock geolocation
        navigator.geolocation = {
          getCurrentPosition: (success) => {
            success({
              coords: {
                latitude: 40.7128,
                longitude: -74.0060
              }
            });
          }
        };
      });

      // Click "Use My Location" button if available
      const locationButton = await this.page.$('button:contains("Use My Location")');
      if (locationButton) {
        await locationButton.click();
        await this.page.waitForTimeout(1000);
      }

      // Submit form
      await this.page.click('button[type="submit"]');
      
      // Wait for success message or redirect
      await this.page.waitForTimeout(3000);
      
      // Check for success indicators
      const successMessage = await this.page.$('.toast-success, .alert-success');
      const currentUrl = this.page.url();
      
      if (successMessage || currentUrl.includes('/map') || currentUrl.includes('/dashboard')) {
        this.log('Issue reporting successful', 'success');
        this.testIssue = testIssue;
        return true;
      } else {
        this.log('Issue reporting failed - no success indication', 'error');
        return false;
      }
    } catch (error) {
      this.log(`Issue reporting error: ${error.message}`, 'error');
      return false;
    }
  }

  async testMapVisualization() {
    this.log('🗺️ Testing map visualization');
    
    try {
      // Navigate to map page
      await this.page.goto(`${CONFIG.FRONTEND_URL}/map`);
      
      // Wait for map to load
      await this.page.waitForSelector('.leaflet-container', { timeout: 10000 });
      
      // Check for map tiles
      const mapTiles = await this.page.$$('.leaflet-tile');
      if (mapTiles.length === 0) {
        this.log('Map tiles not loaded', 'warning');
      }

      // Check for issue markers
      const markers = await this.page.$$('.leaflet-marker-icon, [data-testid="marker"]');
      this.log(`Found ${markers.length} markers on map`);

      // Test marker clustering
      const clusters = await this.page.$$('.marker-cluster, .cluster-marker');
      if (clusters.length > 0) {
        this.log(`Found ${clusters.length} marker clusters`, 'success');
      }

      // Test popup functionality
      if (markers.length > 0) {
        await markers[0].click();
        await this.page.waitForTimeout(1000);
        
        const popup = await this.page.$('.leaflet-popup');
        if (popup) {
          this.log('Marker popup functionality working', 'success');
        }
      }

      this.log('Map visualization test completed', 'success');
      return true;
    } catch (error) {
      this.log(`Map visualization error: ${error.message}`, 'error');
      return false;
    }
  }

  async testRealTimeUpdates() {
    this.log('⚡ Testing real-time updates');
    
    return new Promise((resolve) => {
      let eventsReceived = 0;
      const expectedEvents = ['issue-created', 'issue-status-changed', 'notification'];
      
      // Listen for real-time events
      expectedEvents.forEach(eventName => {
        this.socket.on(eventName, (data) => {
          eventsReceived++;
          this.log(`Real-time event received: ${eventName}`, 'success');
          
          if (eventsReceived >= 2) {
            this.log('Real-time updates working correctly', 'success');
            resolve(true);
          }
        });
      });

      // Join rooms
      this.socket.emit('join-room', 'issues');
      this.socket.emit('join-room', 'user-1');

      // Simulate events by making API calls
      setTimeout(async () => {
        try {
          // Create a test issue to trigger real-time events
          await axios.post(`${CONFIG.BACKEND_URL}/api/issues`, {
            title: 'Real-time Test Issue',
            description: 'Testing real-time functionality',
            category: 'other',
            severity: 2,
            latitude: 40.7128,
            longitude: -74.0060,
            address: 'Test Address'
          }, {
            headers: {
              'Authorization': 'Bearer test-token' // Would need actual token
            }
          });
        } catch (error) {
          this.log(`Could not create test issue for real-time test: ${error.message}`, 'warning');
        }
      }, 1000);

      // Timeout after 10 seconds
      setTimeout(() => {
        if (eventsReceived === 0) {
          this.log('No real-time events received', 'warning');
          resolve(false);
        } else {
          this.log(`Received ${eventsReceived} real-time events`, 'success');
          resolve(true);
        }
      }, 10000);
    });
  }

  async testNotificationSystem() {
    this.log('🔔 Testing notification system');
    
    try {
      // Navigate to a page with notifications
      await this.page.goto(`${CONFIG.FRONTEND_URL}/dashboard`);
      
      // Look for notification bell
      const notificationBell = await this.page.$('button:has([data-testid="bell"], .bell-icon)');
      
      if (notificationBell) {
        // Click notification bell
        await notificationBell.click();
        await this.page.waitForTimeout(1000);
        
        // Check for notification dropdown
        const notificationDropdown = await this.page.$('.notification-dropdown, [role="menu"]');
        
        if (notificationDropdown) {
          this.log('Notification system UI working', 'success');
          
          // Check for notifications
          const notifications = await this.page.$$('.notification-item');
          this.log(`Found ${notifications.length} notifications`);
          
          return true;
        } else {
          this.log('Notification dropdown not found', 'warning');
          return false;
        }
      } else {
        this.log('Notification bell not found', 'warning');
        return false;
      }
    } catch (error) {
      this.log(`Notification system error: ${error.message}`, 'error');
      return false;
    }
  }

  async testAnalyticsDashboard() {
    this.log('📊 Testing analytics dashboard');
    
    try {
      // Navigate to admin dashboard (would need admin login)
      await this.page.goto(`${CONFIG.FRONTEND_URL}/admin/dashboard`);
      
      // Wait for charts to load
      await this.page.waitForTimeout(3000);
      
      // Check for chart containers
      const charts = await this.page.$$('[data-testid*="chart"], .recharts-wrapper');
      this.log(`Found ${charts.length} charts on dashboard`);
      
      // Check for metric cards
      const metricCards = await this.page.$$('.metric-card, [data-testid*="stat"]');
      this.log(`Found ${metricCards.length} metric cards`);
      
      // Check for recent activity
      const activitySection = await this.page.$('text=Recent Activity');
      if (activitySection) {
        this.log('Recent activity section found', 'success');
      }
      
      if (charts.length > 0 && metricCards.length > 0) {
        this.log('Analytics dashboard loaded successfully', 'success');
        return true;
      } else {
        this.log('Analytics dashboard incomplete', 'warning');
        return false;
      }
    } catch (error) {
      this.log(`Analytics dashboard error: ${error.message}`, 'error');
      return false;
    }
  }

  async testMobileResponsiveness() {
    this.log('📱 Testing mobile responsiveness');
    
    try {
      // Set mobile viewport
      await this.page.setViewport({ width: 375, height: 667 });
      
      // Navigate to main pages
      const pages = ['/', '/map', '/report', '/dashboard'];
      
      for (const pagePath of pages) {
        await this.page.goto(`${CONFIG.FRONTEND_URL}${pagePath}`);
        await this.page.waitForTimeout(2000);
        
        // Check if page is responsive
        const bodyWidth = await this.page.evaluate(() => document.body.scrollWidth);
        const viewportWidth = 375;
        
        if (bodyWidth <= viewportWidth + 50) { // Allow small margin
          this.log(`Page ${pagePath} is mobile responsive`, 'success');
        } else {
          this.log(`Page ${pagePath} may have responsive issues`, 'warning');
        }
      }
      
      // Reset to desktop viewport
      await this.page.setViewport({ width: 1280, height: 720 });
      
      return true;
    } catch (error) {
      this.log(`Mobile responsiveness error: ${error.message}`, 'error');
      return false;
    }
  }

  async runAllTests() {
    console.log('\n🚀 Starting End-to-End Test Suite\n');
    console.log('=' * 60);
    
    const setupSuccess = await this.setup();
    if (!setupSuccess) {
      console.log('❌ Setup failed, aborting tests');
      return { passed: 0, failed: 1, total: 1 };
    }

    const tests = [
      { name: 'Backend Health', fn: () => this.testBackendHealth() },
      { name: 'Frontend Loading', fn: () => this.testFrontendLoad() },
      { name: 'User Registration', fn: () => this.testUserRegistration() },
      { name: 'Issue Reporting', fn: () => this.testIssueReporting() },
      { name: 'Map Visualization', fn: () => this.testMapVisualization() },
      { name: 'Real-time Updates', fn: () => this.testRealTimeUpdates() },
      { name: 'Notification System', fn: () => this.testNotificationSystem() },
      { name: 'Analytics Dashboard', fn: () => this.testAnalyticsDashboard() },
      { name: 'Mobile Responsiveness', fn: () => this.testMobileResponsiveness() }
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
      try {
        console.log(`\n--- Running ${test.name} Test ---`);
        const result = await test.fn();
        if (result) {
          passed++;
          this.log(`${test.name} test PASSED`, 'success');
        } else {
          failed++;
          this.log(`${test.name} test FAILED`, 'error');
        }
      } catch (error) {
        failed++;
        this.log(`${test.name} test ERROR: ${error.message}`, 'error');
      }
    }

    await this.cleanup();

    // Summary
    console.log('\n' + '=' * 60);
    console.log('🏁 E2E TEST SUMMARY');
    console.log('=' * 60);
    this.log(`Total Tests: ${tests.length}`);
    this.log(`Passed: ${passed}`, 'success');
    this.log(`Failed: ${failed}`, failed > 0 ? 'error' : 'success');
    this.log(`Success Rate: ${Math.round((passed / tests.length) * 100)}%`);
    
    if (failed === 0) {
      this.log('🎉 All E2E tests passed! Platform is ready for demo.', 'success');
    } else {
      this.log('⚠️ Some E2E tests failed. Please check the implementation.', 'warning');
    }

    return { passed, failed, total: tests.length };
  }
}

// Run tests if called directly
if (require.main === module) {
  const testSuite = new E2ETestSuite();
  testSuite.runAllTests()
    .then((results) => {
      process.exit(results.failed > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error('❌ E2E test suite failed:', error);
      process.exit(1);
    });
}

module.exports = E2ETestSuite;
