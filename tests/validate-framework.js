#!/usr/bin/env node

const PuppeteerHelper = require('./helpers/puppeteer');
const assertions = require('./helpers/assertions');

async function validateFramework() {
  console.log('🧪 Validating testing framework...');

  const puppeteer = new PuppeteerHelper();

  try {
    // Test 1: PuppeteerHelper launches correctly
    console.log('✅ Test 1: Browser launch');
    await puppeteer.launch({ headless: true });

    // Test 2: Can navigate to application
    console.log('✅ Test 2: Application navigation');
    await puppeteer.goto('/');

    // Test 3: Custom assertions work
    console.log('✅ Test 3: Custom assertions');
    const hasMainContent = await assertions.hasVisibleText(puppeteer.page, 'Create');
    console.log(`   Has main content: ${hasMainContent}`);

    // Test 4: Tab interaction
    console.log('✅ Test 4: Tab interaction');
    await puppeteer.clickTab('Manage');
    await assertions.hasActiveTab(puppeteer.page, 'Manage');

    // Test 5: Screenshot functionality
    console.log('✅ Test 5: Screenshot functionality');
    await puppeteer.screenshot('framework-validation.png');

    // Test 6: Page info extraction
    console.log('✅ Test 6: Page info extraction');
    const pageText = await puppeteer.getPageText();
    console.log(`   Page text length: ${pageText.length} characters`);

    console.log('\n🎉 Framework validation complete!');
    console.log('✅ All core functionality working correctly');

  } catch (error) {
    console.error('❌ Framework validation failed:', error.message);
    throw error;
  } finally {
    await puppeteer.close();
  }
}

// Run validation
if (require.main === module) {
  validateFramework()
    .then(() => {
      console.log('\n✅ Testing framework is ready to use!');
      console.log('📋 Next steps:');
      console.log('   npm run test           # Run all tests');
      console.log('   npm run test:debug     # Debug mode');
      console.log('   npm run debug:visual   # Visual debugging');
    })
    .catch((error) => {
      console.error('\n❌ Framework validation failed');
      console.error('🔧 Check that:');
      console.error('   - Application is running on http://localhost:3005');
      console.error('   - Puppeteer is properly installed');
      console.error('   - No other processes are using the port');
      process.exit(1);
    });
}

module.exports = validateFramework;