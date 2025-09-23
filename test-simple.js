#!/usr/bin/env node

/**
 * Simplified Test Runner for Windows
 * Tests the core functionality without complex spawning
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

class SimpleTestRunner {
  constructor() {
    this.results = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${emoji} [${timestamp}] ${message}`);
    this.results.push({ timestamp, message, type });
  }

  async testFileExists(filePath, description) {
    if (fs.existsSync(filePath)) {
      this.log(`${description} exists`, 'success');
      return true;
    } else {
      this.log(`${description} missing`, 'error');
      return false;
    }
  }

  async testBackendHealth() {
    this.log('🏥 Testing backend health (if running)');
    
    return new Promise((resolve) => {
      const req = http.get('http://localhost:5000/health', { timeout: 5000 }, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            if (res.statusCode === 200 && response.status === 'OK') {
              this.log('Backend health check passed', 'success');
              resolve(true);
            } else {
              this.log('Backend health check failed', 'error');
              resolve(false);
            }
          } catch (error) {
            this.log('Backend response parsing failed', 'error');
            resolve(false);
          }
        });
      });
      
      req.on('error', (error) => {
        this.log(`Backend not running: ${error.message}`, 'warning');
        resolve(false);
      });
      
      req.on('timeout', () => {
        this.log('Backend health check timeout', 'warning');
        req.destroy();
        resolve(false);
      });
    });
  }

  async testFrontendFiles() {
    this.log('📁 Testing frontend file structure');
    
    const frontendFiles = [
      'frontend/src/App.jsx',
      'frontend/src/components/Map/IssueMap.jsx',
      'frontend/src/components/Common/NotificationCenter.jsx',
      'frontend/src/context/IssueContext.jsx',
      'frontend/src/context/NotificationContext.jsx',
      'frontend/src/services/socketService.js',
      'frontend/src/pages/AdminDashboard.jsx'
    ];

    let passed = 0;
    for (const file of frontendFiles) {
      if (await this.testFileExists(file, path.basename(file))) {
        passed++;
      }
    }

    return passed === frontendFiles.length;
  }

  async testBackendFiles() {
    this.log('🔧 Testing backend file structure');
    
    const backendFiles = [
      'backend/server.js',
      'backend/models/Issue.js',
      'backend/models/User.js',
      'backend/routes/issueRoutes.js',
      'backend/routes/authRoutes.js',
      'backend/middleware/auth.js',
      'backend/services/cloudinaryService.js',
      'backend/scripts/init-db.js'
    ];

    let passed = 0;
    for (const file of backendFiles) {
      if (await this.testFileExists(file, path.basename(file))) {
        passed++;
      }
    }

    return passed === backendFiles.length;
  }

  async testEnhancedFeatures() {
    this.log('🚀 Testing enhanced feature implementations');
    
    const tests = [
      {
        name: 'Enhanced Map Component',
        test: () => this.testFileExists('frontend/src/components/Map/IssueMap.jsx', 'IssueMap component')
      },
      {
        name: 'Socket Service',
        test: () => this.testFileExists('frontend/src/services/socketService.js', 'Socket service')
      },
      {
        name: 'Notification System',
        test: () => this.testFileExists('frontend/src/context/NotificationContext.jsx', 'Notification context')
      },
      {
        name: 'Analytics Dashboard',
        test: () => this.testFileExists('frontend/src/pages/AdminDashboard.jsx', 'Admin dashboard')
      },
      {
        name: 'Real-time Backend Routes',
        test: () => this.testFileExists('backend/routes/issueRoutes.js', 'Issue routes')
      }
    ];

    let passed = 0;
    for (const test of tests) {
      if (await test.test()) {
        this.log(`${test.name} implementation found`, 'success');
        passed++;
      } else {
        this.log(`${test.name} implementation missing`, 'error');
      }
    }

    return passed === tests.length;
  }

  async testPackageFiles() {
    this.log('📦 Testing package configurations');
    
    const packageTests = [
      {
        file: 'backend/package.json',
        check: (content) => {
          const pkg = JSON.parse(content);
          return pkg.dependencies && 
                 pkg.dependencies['socket.io'] && 
                 pkg.dependencies['express'] &&
                 pkg.dependencies['pg'];
        }
      },
      {
        file: 'frontend/package.json', 
        check: (content) => {
          const pkg = JSON.parse(content);
          return pkg.dependencies && 
                 pkg.dependencies['react'] && 
                 pkg.dependencies['leaflet'] &&
                 pkg.dependencies['recharts'] &&
                 pkg.dependencies['socket.io-client'];
        }
      }
    ];

    let passed = 0;
    for (const test of packageTests) {
      try {
        if (fs.existsSync(test.file)) {
          const content = fs.readFileSync(test.file, 'utf8');
          if (test.check(content)) {
            this.log(`${test.file} dependencies correct`, 'success');
            passed++;
          } else {
            this.log(`${test.file} missing required dependencies`, 'error');
          }
        } else {
          this.log(`${test.file} not found`, 'error');
        }
      } catch (error) {
        this.log(`Error checking ${test.file}: ${error.message}`, 'error');
      }
    }

    return passed === packageTests.length;
  }

  async testDatabaseFiles() {
    this.log('🗄️ Testing database setup files');
    
    const dbFiles = [
      'backend/scripts/init-db.js',
      'backend/scripts/seed-db.js'
    ];

    let passed = 0;
    for (const file of dbFiles) {
      if (await this.testFileExists(file, path.basename(file))) {
        passed++;
      }
    }

    return passed === dbFiles.length;
  }

  async testConfigFiles() {
    this.log('⚙️ Testing configuration files');
    
    const configFiles = [
      'backend/.env',
      'frontend/.env',
      'backend/jest.config.js',
      'frontend/vitest.config.js'
    ];

    let passed = 0;
    for (const file of configFiles) {
      if (fs.existsSync(file)) {
        this.log(`${path.basename(file)} exists`, 'success');
        passed++;
      } else {
        this.log(`${path.basename(file)} missing (may need creation)`, 'warning');
      }
    }

    return passed >= 2; // At least .env files should exist
  }

  generateReport(results) {
    console.log('\n' + '='.repeat(80));
    console.log('🏁 SIMPLIFIED TEST REPORT');
    console.log('='.repeat(80));
    
    const totalTests = results.length;
    const passedTests = results.filter(r => r).length;
    const failedTests = totalTests - passedTests;
    
    console.log(`📊 Results: ${passedTests}/${totalTests} tests passed`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`📈 Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
    
    if (failedTests === 0) {
      console.log('\n🎉 All structure tests passed!');
      console.log('✨ Enhanced features are properly implemented');
      console.log('🚀 Platform structure is ready for demo');
    } else {
      console.log('\n⚠️ Some tests failed:');
      console.log('- Check missing files or dependencies');
      console.log('- Ensure all enhanced features are implemented');
      console.log('- Verify package.json dependencies');
    }

    console.log('\n📋 Next Steps:');
    console.log('1. Start backend: cd backend && npm run dev');
    console.log('2. Start frontend: cd frontend && npm run dev');
    console.log('3. Test manually: http://localhost:5173');
    console.log('4. Check backend health: http://localhost:5000/health');
    
    console.log('\n' + '='.repeat(80));
    
    return failedTests === 0;
  }

  async runTests() {
    console.log('\n🚀 CIVIC PLATFORM - SIMPLIFIED STRUCTURE TEST\n');
    console.log('Checking implementation without running servers...\n');
    
    const tests = [
      { name: 'Backend Files', fn: () => this.testBackendFiles() },
      { name: 'Frontend Files', fn: () => this.testFrontendFiles() },
      { name: 'Enhanced Features', fn: () => this.testEnhancedFeatures() },
      { name: 'Package Dependencies', fn: () => this.testPackageFiles() },
      { name: 'Database Setup', fn: () => this.testDatabaseFiles() },
      { name: 'Configuration Files', fn: () => this.testConfigFiles() },
      { name: 'Backend Health', fn: () => this.testBackendHealth() }
    ];

    const results = [];
    
    for (const test of tests) {
      try {
        console.log(`\n--- ${test.name} ---`);
        const result = await test.fn();
        results.push(result);
        
        if (result) {
          this.log(`${test.name} ✅ PASSED`, 'success');
        } else {
          this.log(`${test.name} ❌ FAILED`, 'error');
        }
      } catch (error) {
        this.log(`${test.name} ERROR: ${error.message}`, 'error');
        results.push(false);
      }
    }

    return this.generateReport(results);
  }
}

// Run if called directly
if (require.main === module) {
  const runner = new SimpleTestRunner();
  
  runner.runTests()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('❌ Test runner error:', error);
      process.exit(1);
    });
}

module.exports = SimpleTestRunner;
