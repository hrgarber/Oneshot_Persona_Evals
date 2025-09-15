// Global test setup configuration
// This file runs before all test suites

// Set test timeouts
jest.setTimeout(30000);

// Suppress console logs during tests unless debugging
if (!process.env.DEBUG_TESTS) {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  };
}

// Global test configuration
global.TEST_CONFIG = {
  baseURL: process.env.TEST_BASE_URL || 'http://localhost:3005',
  timeout: 30000,
  headless: process.env.TEST_HEADLESS !== 'false', // Default headless unless explicitly false
  viewport: {
    width: 1280,
    height: 720
  }
};