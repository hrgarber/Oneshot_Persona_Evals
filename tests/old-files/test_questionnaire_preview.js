const puppeteer = require('puppeteer');

async function testQuestionnairePreview() {
  console.log('🧪 Testing questionnaire selection and preview functionality...');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.goto('http://localhost:3002', { waitUntil: 'networkidle2' });

    console.log('✅ Page loaded successfully');

    // Wait for the app to load and find the Run Experiment tab
    await page.waitForSelector('[role="tab"]', { timeout: 10000 });

    // Find and click the "Run Experiment" tab
    const tabs = await page.$$('[role="tab"]');
    let runExperimentTab = null;

    for (const tab of tabs) {
      const text = await page.evaluate(el => el.textContent, tab);
      if (text.includes('Run Experiment')) {
        runExperimentTab = tab;
        break;
      }
    }

    if (!runExperimentTab) {
      throw new Error('❌ Run Experiment tab not found');
    }

    await runExperimentTab.click();
    console.log('✅ Clicked Run Experiment tab');

    // Wait for questionnaire cards to load
    await new Promise(resolve => setTimeout(resolve, 1000)); // Allow content to render

    // Look specifically for "View All Questions" buttons
    console.log('🔍 Searching for "View All Questions" buttons...');

    const viewAllButtons = await page.$$eval('button, [role="button"], div', elements => {
      return elements
        .map((el, index) => ({
          text: el.textContent.trim(),
          index,
          hasViewAll: el.textContent.includes('View All Questions')
        }))
        .filter(item => item.hasViewAll);
    });

    console.log(`📋 Found ${viewAllButtons.length} "View All Questions" buttons`);

    if (viewAllButtons.length === 0) {
      console.log('❌ No "View All Questions" buttons found');

      // Debug: show what buttons are available
      const allButtons = await page.$$eval('button', buttons =>
        buttons.map(btn => btn.textContent.trim()).filter(text => text.length > 0)
      );
      console.log('🔍 Available buttons:', allButtons.slice(0, 10));
      return false;
    }

    // Click the first "View All Questions" button found
    const buttonSelector = `button:nth-of-type(${viewAllButtons[0].index + 1}), [role="button"]:nth-of-type(${viewAllButtons[0].index + 1})`;

    // More direct approach - find by text content
    const viewAllButton = await page.$x("//button[contains(text(), 'View All Questions')] | //div[contains(text(), 'View All Questions') and (@role='button' or contains(@class, 'cursor-pointer'))]");

    if (viewAllButton.length === 0) {
      console.log('❌ Could not locate View All Questions button for clicking');
      return false;
    }

    console.log('✅ Found "View All Questions" button, clicking...');
    await viewAllButton[0].click();

    if (!selectedCard) {
      console.log('🔍 Searching for cards with different approach...');
      // Try to find cards by looking for specific questionnaire content
      const allCards = await page.$$('div');
      for (const card of allCards) {
        const cardText = await page.evaluate(el => el.textContent, card);
        if (cardText.includes('Requirements Engineering') || cardText.includes('Software Development') || cardText.includes('View All Questions')) {
          selectedCard = card;
          break;
        }
      }
    }

    if (!selectedCard) {
      // Fallback: look for any clickable element with "View All Questions"
      const viewAllButtons = await page.$$('button, [role="button"]');
      for (const button of viewAllButtons) {
        const buttonText = await page.evaluate(el => el.textContent, button);
        if (buttonText.includes('View All Questions')) {
          console.log('✅ Found "View All Questions" button directly');

          // Test the preview dialog
          await button.click();
          console.log('✅ Clicked "View All Questions" button');

          // Wait for dialog to open
          await new Promise(resolve => setTimeout(resolve, 500));

          // Look for dialog content
          const dialogContent = await page.$('[role="dialog"], .modal, [class*="dialog"]');
          if (dialogContent) {
            console.log('✅ Preview dialog opened');

            // Check for question content in the dialog
            const dialogText = await page.evaluate(el => el.textContent, dialogContent);

            // Validate that we see actual question text, not just IDs
            const hasQuestionIds = dialogText.includes('q01_') || dialogText.includes('q02_');
            const hasReadableText = dialogText.includes('uncertainty') || dialogText.includes('requirements') || dialogText.includes('How') || dialogText.includes('What');

            console.log('📝 Dialog content preview:', dialogText.substring(0, 200) + '...');

            if (hasQuestionIds && !hasReadableText) {
              console.log('❌ ISSUE: Dialog shows question IDs instead of readable text');
              return false;
            } else if (hasReadableText) {
              console.log('✅ Dialog shows readable question text');
            } else {
              console.log('⚠️ Dialog content unclear - may need investigation');
            }

            // Test closing the dialog
            const closeButton = await page.$('[aria-label*="Close"], button[class*="close"], [data-close]');
            if (closeButton) {
              await closeButton.click();
              console.log('✅ Dialog closed successfully');
            } else {
              // Try clicking outside the dialog
              await page.click('body');
              console.log('✅ Dialog closed by clicking outside');
            }

            // Test reopening
            await new Promise(resolve => setTimeout(resolve, 500));
            await button.click();
            await new Promise(resolve => setTimeout(resolve, 500));

            const reopenedDialog = await page.$('[role="dialog"], .modal, [class*="dialog"]');
            if (reopenedDialog) {
              console.log('✅ Dialog reopened successfully');
              return true;
            } else {
              console.log('❌ Dialog failed to reopen');
              return false;
            }
          } else {
            console.log('❌ No dialog found after clicking');
            return false;
          }
        }
      }
    }

    if (!selectedCard) {
      console.log('❌ Could not find questionnaire cards or View All Questions button');

      // Debug: show what's actually on the page
      const pageContent = await page.content();
      console.log('🔍 Page structure analysis...');

      // Look for specific patterns
      const hasRunExperiment = pageContent.includes('Run Experiment');
      const hasQuestionnaire = pageContent.includes('questionnaire');
      const hasViewAll = pageContent.includes('View All');

      console.log(`Debug - Run Experiment: ${hasRunExperiment}, Questionnaire: ${hasQuestionnaire}, View All: ${hasViewAll}`);

      return false;
    }

    return true;

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  } finally {
    await browser.close();
  }
}

// Run the test
testQuestionnairePreview().then(success => {
  if (success) {
    console.log('🎉 All questionnaire preview tests passed!');
    process.exit(0);
  } else {
    console.log('💥 Questionnaire preview tests failed');
    process.exit(1);
  }
}).catch(error => {
  console.error('💥 Test execution failed:', error);
  process.exit(1);
});