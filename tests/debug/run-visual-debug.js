#!/usr/bin/env node

const { VisualDebugger, debugScenarios } = require('./visual-debugger');

async function runVisualDebug() {
  const scenario = process.argv[2] || 'manageTabFlow';
  const debugger = new VisualDebugger();

  console.log(`🎬 Starting visual debug scenario: ${scenario}`);

  try {
    await debugger.launch();

    if (debugScenarios[scenario]) {
      await debugger.debugPage('/', debugScenarios[scenario]);
    } else {
      console.log('Available scenarios:', Object.keys(debugScenarios));
      console.log('Running basic page load instead...');
      await debugger.debugPage('/');
    }

    await debugger.getPageInfo();

    console.log('🎯 Visual debug complete. Press Ctrl+C to exit or browser will close in 10 seconds.');
    await new Promise(resolve => setTimeout(resolve, 10000));

  } catch (error) {
    console.error('❌ Debug session failed:', error);
  } finally {
    await debugger.close();
  }
}

// Usage info
if (process.argv.includes('--help')) {
  console.log(`
🔍 Visual Debugger Usage:

node tests/debug/run-visual-debug.js [scenario]

Available scenarios:
- manageTabFlow      # Debug manage tab and questionnaire creation
- personaFlow        # Debug persona creation flow
- [none]             # Basic page load debug

Examples:
  node tests/debug/run-visual-debug.js manageTabFlow
  node tests/debug/run-visual-debug.js personaFlow
  node tests/debug/run-visual-debug.js
  `);
  process.exit(0);
}

runVisualDebug().catch(console.error);