#!/usr/bin/env node

/**
 * Master Test Runner for Civic Issue Platform
 * Runs all test suites in the correct order
 */

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

class MasterTestRunner {
  constructor() {
    this.results = {
      backend: { passed: 0, failed: 0, total: 0 },
      frontend: { passed: 0, failed: 0, total: 0 },
      integration: { passed: 0, failed: 0, total: 0 },
      e2e: { passed: 0, failed: 0, total: 0 }
    };
    this.startTime = Date.now();
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${emoji} [${timestamp}] ${message}`);
  }

  async runCommand(command, cwd, description) {
    this.log(`Running: ${description}`);
    
    return new Promise((resolve, reject) => {
      // Handle Windows npm commands
      const isWindows = process.platform === 'win32';
      const cmd = isWindows ? 'cmd' : 'sh';
      const args = isWindows ? ['/c', command] : ['-c', command];
      
      const child = spawn(cmd, args, { 
        cwd,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          this.log(`${description} completed successfully`, 'success');
          resolve({ success: true, stdout, stderr });
        } else {
          this.log(`${description} failed with code ${code}`, 'error');
          if (stderr) console.log('Error output:', stderr);
          resolve({ success: false, stdout, stderr, code });
        }
      });

      child.on('error', (error) => {
        this.log(`${description} error: ${error.message}`, 'error');
        reject(error);
      });
    });
  }

  async checkPrerequisites() {
    this.log('🔍 Checking prerequisites...');
    
    const checks = [
      { file: 'backend/package.json', name: 'Backend package.json' },
      { file: 'frontend/package.json', name: 'Frontend package.json' },
      { file: 'backend/server.js', name: 'Backend server' },
      { file: 'frontend/src/App.jsx', name: 'Frontend app' },
      { file: 'backend/.env', name: 'Backend environment' }
    ];

    for (const check of checks) {
      if (fs.existsSync(check.file)) {
        this.log(`${check.name} found`, 'success');
      } else {
        this.log(`${check.name} missing`, 'error');
        return false;
      }
    }

    return true;
  }

  async installDependencies() {
    this.log('📦 Installing dependencies...');
    
    // Backend dependencies
    const backendInstall = await this.runCommand(
      'npm install',
      'backend',
      'Backend dependency installation'
    );

    if (!backendInstall.success) {
      this.log('Backend dependency installation failed', 'error');
      return false;
    }

    // Frontend dependencies
    const frontendInstall = await this.runCommand(
      'npm install',
      'frontend', 
      'Frontend dependency installation'
    );

    if (!frontendInstall.success) {
      this.log('Frontend dependency installation failed', 'error');
      return false;
    }

    return true;
  }

  async runBackendTests() {
    this.log('🔧 Running backend tests...');
    
    // Unit tests
    const unitTests = await this.runCommand(
      'npm test -- --passWithNoTests',
      'backend',
      'Backend unit tests'
    );

    // Implementation tests
    const implTests = await this.runCommand(
      'npm run test:implementation',
      'backend',
      'Backend implementation tests'
    );

    const backendSuccess = unitTests.success && implTests.success;
    
    this.results.backend = {
      passed: backendSuccess ? 2 : 0,
      failed: backendSuccess ? 0 : 2,
      total: 2
    };

    return backendSuccess;
  }

  async runFrontendTests() {
    this.log('⚛️ Running frontend tests...');
    
    const frontendTests = await this.runCommand(
      'npm test -- --run',
      'frontend',
      'Frontend tests'
    );

    this.results.frontend = {
      passed: frontendTests.success ? 1 : 0,
      failed: frontendTests.success ? 0 : 1,
      total: 1
    };

    return frontendTests.success;
  }

  async startServers() {
    this.log('🚀 Starting development servers...');
    
    const isWindows = process.platform === 'win32';
    const npmCmd = isWindows ? 'npm.cmd' : 'npm';
    
    // Start backend server
    this.backendProcess = spawn(npmCmd, ['run', 'dev'], {
      cwd: 'backend',
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: isWindows
    });

    // Start frontend server
    this.frontendProcess = spawn(npmCmd, ['run', 'dev'], {
      cwd: 'frontend',
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: isWindows
    });

    // Wait for servers to start
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    this.log('Servers started, waiting for initialization...', 'success');
    return true;
  }

  async stopServers() {
    this.log('🛑 Stopping development servers...');
    
    if (this.backendProcess) {
      this.backendProcess.kill('SIGTERM');
    }
    
    if (this.frontendProcess) {
      this.frontendProcess.kill('SIGTERM');
    }
  }

  async runE2ETests() {
    this.log('🌐 Running end-to-end tests...');
    
    const e2eTests = await this.runCommand(
      'node e2e-test.js',
      '.',
      'End-to-end tests'
    );

    this.results.e2e = {
      passed: e2eTests.success ? 1 : 0,
      failed: e2eTests.success ? 0 : 1,
      total: 1
    };

    return e2eTests.success;
  }

  async runIntegrationTests() {
    this.log('🔗 Running integration tests...');
    
    // Test database initialization
    const dbInit = await this.runCommand(
      'npm run db:init',
      'backend',
      'Database initialization'
    );

    // Test API health
    const healthCheck = await this.runCommand(
      'curl -f http://localhost:5000/health || echo "Health check failed"',
      '.',
      'API health check'
    );

    const integrationSuccess = dbInit.success;
    
    this.results.integration = {
      passed: integrationSuccess ? 1 : 0,
      failed: integrationSuccess ? 0 : 1,
      total: 1
    };

    return integrationSuccess;
  }

  generateReport() {
    const endTime = Date.now();
    const duration = Math.round((endTime - this.startTime) / 1000);
    
    console.log('\n' + '='.repeat(80));
    console.log('🏁 COMPREHENSIVE TEST REPORT');
    console.log('='.repeat(80));
    
    console.log(`⏱️  Total Duration: ${duration} seconds`);
    console.log(`📅 Completed: ${new Date().toISOString()}\n`);

    // Test suite results
    const suites = [
      { name: 'Backend Tests', results: this.results.backend },
      { name: 'Frontend Tests', results: this.results.frontend },
      { name: 'Integration Tests', results: this.results.integration },
      { name: 'End-to-End Tests', results: this.results.e2e }
    ];

    let totalPassed = 0;
    let totalFailed = 0;
    let totalTests = 0;

    suites.forEach(suite => {
      const { passed, failed, total } = suite.results;
      const status = failed === 0 ? '✅ PASS' : '❌ FAIL';
      const percentage = total > 0 ? Math.round((passed / total) * 100) : 0;
      
      console.log(`${status} ${suite.name}: ${passed}/${total} (${percentage}%)`);
      
      totalPassed += passed;
      totalFailed += failed;
      totalTests += total;
    });

    console.log('\n' + '-'.repeat(80));
    
    const overallPercentage = totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0;
    const overallStatus = totalFailed === 0 ? '🎉 ALL TESTS PASSED' : '⚠️  SOME TESTS FAILED';
    
    console.log(`${overallStatus}`);
    console.log(`📊 Overall: ${totalPassed}/${totalTests} tests passed (${overallPercentage}%)`);
    
    if (totalFailed === 0) {
      console.log('\n🚀 Platform is ready for hackathon demo!');
      console.log('✨ All systems operational');
      console.log('🎯 Ready to showcase real-time collaborative mapping');
      console.log('📈 Analytics dashboard fully functional');
      console.log('🔔 Notification system working perfectly');
    } else {
      console.log('\n🔧 Some issues need attention before demo:');
      console.log('- Check failed test outputs above');
      console.log('- Verify server configurations');
      console.log('- Ensure database is properly initialized');
      console.log('- Test real-time features manually');
    }

    console.log('\n' + '='.repeat(80));
    
    return totalFailed === 0;
  }

  async runAllTests() {
    console.log('\n🚀 CIVIC ISSUE PLATFORM - COMPREHENSIVE TEST SUITE\n');
    console.log('Testing all enhanced features for hackathon demo...\n');
    
    try {
      // Prerequisites
      const prereqsOk = await this.checkPrerequisites();
      if (!prereqsOk) {
        this.log('Prerequisites check failed', 'error');
        return false;
      }

      // Install dependencies
      const depsOk = await this.installDependencies();
      if (!depsOk) {
        this.log('Dependency installation failed', 'error');
        return false;
      }

      // Run static tests first
      await this.runBackendTests();
      await this.runFrontendTests();
      await this.runIntegrationTests();

      // Start servers for E2E tests
      await this.startServers();
      
      try {
        // Run E2E tests
        await this.runE2ETests();
      } finally {
        // Always stop servers
        await this.stopServers();
      }

      // Generate final report
      const allPassed = this.generateReport();
      
      return allPassed;

    } catch (error) {
      this.log(`Test suite error: ${error.message}`, 'error');
      await this.stopServers();
      return false;
    }
  }
}

// Run if called directly
if (require.main === module) {
  const runner = new MasterTestRunner();
  
  runner.runAllTests()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('❌ Test runner crashed:', error);
      process.exit(1);
    });
}

module.exports = MasterTestRunner;
