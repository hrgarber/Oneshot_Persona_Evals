#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;

class TestRunner {
  constructor() {
    this.testDir = path.join(__dirname);
    this.rootDir = path.dirname(__dirname);
  }

  async ensureDirectories() {
    const dirs = [
      path.join(this.testDir, 'screenshots'),
      path.join(this.testDir, 'coverage'),
      path.join(this.testDir, 'reports')
    ];

    for (const dir of dirs) {
      try {
        await fs.mkdir(dir, { recursive: true });
      } catch (error) {
        // Directory might already exist
      }
    }
  }

  async runTests(options = {}) {
    const {
      pattern = '',
      watch = false,
      coverage = false,
      headless = true,
      debug = false
    } = options;

    await this.ensureDirectories();

    // Set environment variables
    process.env.TEST_HEADLESS = headless.toString();
    process.env.DEBUG_TESTS = debug.toString();

    const jestArgs = [
      '--config', path.join(this.testDir, 'config/jest.config.js'),
      '--rootDir', this.rootDir
    ];

    if (pattern) {
      jestArgs.push('--testPathPattern', pattern);
    }

    if (watch) {
      jestArgs.push('--watch');
    }

    if (coverage) {
      jestArgs.push('--coverage');
    }

    if (debug) {
      jestArgs.push('--verbose', '--no-cache');
    }

    console.log('🚀 Starting test runner...');
    console.log(`📁 Test directory: ${this.testDir}`);
    console.log(`🎯 Pattern: ${pattern || 'all tests'}`);
    console.log(`👁️ Headless: ${headless}`);
    console.log(`🐛 Debug: ${debug}`);

    return new Promise((resolve, reject) => {
      const jest = spawn('npx', ['jest', ...jestArgs], {
        cwd: this.rootDir,
        stdio: 'inherit',
        env: { ...process.env }
      });

      jest.on('close', (code) => {
        if (code === 0) {
          console.log('✅ All tests completed successfully');
          resolve(code);
        } else {
          console.error(`❌ Tests failed with code ${code}`);
          reject(new Error(`Tests failed with exit code ${code}`));
        }
      });

      jest.on('error', (error) => {
        console.error('❌ Failed to start test runner:', error);
        reject(error);
      });
    });
  }

  // Convenience methods for different test types
  async e2e(options = {}) {
    return this.runTests({ ...options, pattern: 'e2e' });
  }

  async unit(options = {}) {
    return this.runTests({ ...options, pattern: 'unit' });
  }

  async integration(options = {}) {
    return this.runTests({ ...options, pattern: 'integration' });
  }

  async debug(testPattern = '') {
    return this.runTests({
      pattern: testPattern,
      headless: false,
      debug: true,
      watch: true
    });
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const runner = new TestRunner();

  try {
    if (args.includes('--help') || args.includes('-h')) {
      console.log(`
🧪 Test Runner Usage:

Basic commands:
  npm run test                    # Run all tests
  npm run test:e2e               # Run E2E tests only
  npm run test:unit              # Run unit tests only
  npm run test:debug             # Debug mode (visible browser, watch)

Options:
  --pattern <pattern>            # Filter tests by pattern
  --watch                        # Watch mode
  --coverage                     # Generate coverage report
  --no-headless                  # Show browser (for debugging)
  --debug                        # Enable debug mode

Examples:
  node tests/run-tests.js --pattern manage-tab
  node tests/run-tests.js --debug --pattern questionnaire
  node tests/run-tests.js --coverage --headless
      `);
      return;
    }

    const options = {
      pattern: args.find(arg => args[args.indexOf(arg) - 1] === '--pattern') || '',
      watch: args.includes('--watch'),
      coverage: args.includes('--coverage'),
      headless: !args.includes('--no-headless'),
      debug: args.includes('--debug')
    };

    if (args.includes('e2e')) {
      await runner.e2e(options);
    } else if (args.includes('unit')) {
      await runner.unit(options);
    } else if (args.includes('integration')) {
      await runner.integration(options);
    } else if (args.includes('debug')) {
      await runner.debug(options.pattern);
    } else {
      await runner.runTests(options);
    }

  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = TestRunner;