# Testing Framework

Clean, organized testing structure for the Persona Experiment application.

## Directory Structure

```
tests/
├── config/              # Test configuration
│   ├── jest.config.js   # Jest test runner config
│   └── setup.js         # Global test setup
├── helpers/             # Reusable test utilities
│   ├── puppeteer.js     # Puppeteer wrapper with common methods
│   └── assertions.js    # Custom assertion helpers
├── fixtures/            # Test data and constants
│   └── test-data.js     # Centralized test data
├── e2e/                 # End-to-end tests
│   ├── manage-tab.test.js
│   ├── persona-selection.test.js
│   ├── question-cards.test.js
│   └── questionnaire-preview.test.js
├── unit/               # Unit tests (future)
├── integration/        # Integration tests (future)
├── debug/              # Debug utilities
│   ├── visual-debugger.js
│   └── run-visual-debug.js
├── screenshots/        # Test screenshots (auto-created)
├── coverage/          # Coverage reports (auto-created)
└── run-tests.js       # Main test runner
```

## Quick Start

```bash
# Run all tests
npm test

# Run specific test types
npm run test:e2e
npm run test:unit

# Debug mode (visible browser)
npm run test:debug

# Watch mode for development
npm run test:watch

# Generate coverage reports
npm run test:coverage

# Visual debugging
npm run debug:visual
npm run debug:manage
npm run debug:persona
```

## Test Types

### E2E Tests (`tests/e2e/`)
- Full browser automation tests
- Test complete user workflows
- Use PuppeteerHelper for consistent browser interactions

### Unit Tests (`tests/unit/`)
- Test individual functions/components
- Fast, isolated tests
- Framework ready for future unit tests

### Integration Tests (`tests/integration/`)
- Test component interactions
- API integration tests
- Framework ready for future integration tests

## Utilities

### PuppeteerHelper (`tests/helpers/puppeteer.js`)
Simplified Puppeteer wrapper with common methods:

```javascript
const PuppeteerHelper = require('../helpers/puppeteer');

const puppeteer = new PuppeteerHelper();
await puppeteer.launch();
await puppeteer.goto('/');
await puppeteer.clickTab('Manage');
await puppeteer.clickButton('Create New Questionnaire');
await puppeteer.fillForm({
  'input[id="name"]': 'Test Questionnaire',
  'textarea[id="description"]': 'Test description'
});
await puppeteer.screenshot('test-result.png');
```

### Custom Assertions (`tests/helpers/assertions.js`)
Domain-specific assertions for common patterns:

```javascript
const assertions = require('../helpers/assertions');

await assertions.hasVisibleText(page, 'Expected text');
await assertions.hasButton(page, 'Create');
await assertions.hasFormField(page, 'input[id="name"]');
await assertions.hasCards(page, 5);
await assertions.hasActiveTab(page, 'Manage');
```

### Test Data (`tests/fixtures/test-data.js`)
Centralized test data for consistency:

```javascript
const testData = require('../fixtures/test-data');

await puppeteer.fillForm({
  'input[id="name"]': testData.personas.valid.name,
  'textarea[id="description"]': testData.personas.valid.description
});
```

## Visual Debugging

The visual debugger runs predefined scenarios with screenshots at each step:

```bash
# Debug manage tab flow
npm run debug:manage

# Debug persona creation
npm run debug:persona

# Custom debug session
node tests/debug/run-visual-debug.js --help
```

## Configuration

### Environment Variables
- `TEST_BASE_URL`: Base URL for tests (default: http://localhost:3005)
- `TEST_HEADLESS`: Run headless browser (default: true)
- `DEBUG_TESTS`: Enable debug logging (default: false)

### Global Test Config
Set in `tests/config/setup.js`:
- Timeouts
- Browser viewport
- Console log suppression
- Base URL

## Adding New Tests

### 1. E2E Test
```javascript
// tests/e2e/new-feature.test.js
const PuppeteerHelper = require('../helpers/puppeteer');
const assertions = require('../helpers/assertions');
const testData = require('../fixtures/test-data');

describe('New Feature Tests', () => {
  let puppeteer;

  beforeAll(async () => {
    puppeteer = new PuppeteerHelper();
    await puppeteer.launch();
  });

  afterAll(async () => {
    await puppeteer.close();
  });

  test('should do something', async () => {
    await puppeteer.goto('/');
    await assertions.hasVisibleText(puppeteer.page, 'Expected text');
  });
});
```

### 2. Debug Scenario
```javascript
// Add to tests/debug/visual-debugger.js
newFeatureFlow: [
  {
    name: 'step-1',
    action: async (puppeteer) => {
      await puppeteer.clickButton('Something');
    },
    pauseMs: 1000
  }
]
```

## Migration from Old Tests

Old scattered test files have been organized as follows:

- `test_manage_tab.js` → `tests/e2e/manage-tab.test.js`
- `test_persona_selection.js` → `tests/e2e/persona-selection.test.js`
- `test_question_cards.js` → `tests/e2e/question-cards.test.js`
- `test_questionnaire_preview.js` → `tests/e2e/questionnaire-preview.test.js`
- `debug_questionnaires.js` → `tests/debug/visual-debugger.js`

The old files can be safely deleted after confirming the new tests work correctly.

## Best Practices

1. **Use helpers**: Leverage PuppeteerHelper and custom assertions
2. **Centralize data**: Add test data to `fixtures/test-data.js`
3. **Clear naming**: Test files should clearly indicate what they test
4. **Screenshot on failure**: Tests automatically screenshot on failure
5. **Debug visually**: Use visual debugger for complex interactions
6. **Clean up**: Use beforeEach/afterEach for consistent state
7. **Timeout handling**: Set appropriate timeouts for async operations

## Troubleshooting

### Tests failing randomly
- Increase timeouts in test config
- Use `await puppeteer.page.waitForTimeout(ms)` for timing issues
- Check for race conditions in UI updates

### Browser not launching
- Check if port 3005 is running the application
- Verify Puppeteer installation: `npm list puppeteer`
- Try running with `--no-sandbox` flag

### Screenshots not saving
- Ensure `tests/screenshots/` directory exists
- Check file permissions
- Verify absolute paths in screenshot calls