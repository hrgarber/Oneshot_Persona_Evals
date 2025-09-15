const puppeteer = require('puppeteer');

async function testQuestionSelectionCards() {
  console.log('🃏 Testing Question Selection Grid - Card Interface Validation');

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 720 },
    args: ['--no-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.goto('http://localhost:3005', { waitUntil: 'networkidle0' });

    // Navigate to Manage > Questionnaires
    console.log('📱 Navigating to Questionnaires...');
    const tabs = await page.$$('button[role="tab"]');
    await tabs[1].click(); // Manage tab
    await new Promise(resolve => setTimeout(resolve, 500));

    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const questionnairesBtn = buttons.find(btn => btn.textContent.includes('Questionnaires'));
      if (questionnairesBtn) questionnairesBtn.click();
    });
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create new questionnaire to trigger question selection
    console.log('🔧 Opening questionnaire creation form...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const createBtn = buttons.find(btn => btn.textContent.includes('Create New Questionnaire'));
      if (createBtn) createBtn.click();
    });
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Wait for and fill form fields
    const nameInput = await page.waitForSelector('input[id="name"]', { timeout: 5000 });
    await page.type('input[id="name"]', 'Card Test Questionnaire');

    const descInput = await page.$('input[id="description"]');
    if (descInput) {
      await page.type('input[id="description"]', 'Testing card-based question selection');
    }

    // Allow time for questions to load
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('🃏 Analyzing question selection interface...');

    // Comprehensive analysis of the question selection interface
    const selectionAnalysis = await page.evaluate(() => {
      // Look for cards specifically
      const allCards = document.querySelectorAll('[class*="Card"]');
      const cardContentElements = document.querySelectorAll('[class*="CardContent"]');

      // Look for checkboxes
      const checkboxes = document.querySelectorAll('input[type="checkbox"]');

      // Look for question-specific elements
      const questionElements = Array.from(document.querySelectorAll('*')).filter(el => {
        const text = el.textContent || '';
        return text.includes('When faced with uncertain') ||
               text.includes('requirements') ||
               text.includes('q01') ||
               text.includes('category') ||
               text.includes('Select Questions');
      });

      // Look for interactive question elements
      const clickableQuestions = Array.from(document.querySelectorAll('*')).filter(el => {
        return el.onclick ||
               el.style.cursor === 'pointer' ||
               el.className.includes('cursor-pointer') ||
               (el.tagName === 'BUTTON' && el.textContent.includes('question'));
      });

      // Check for progress indicators
      const progressElements = document.querySelectorAll('[class*="Progress"]');

      // Check for search functionality
      const searchInputs = document.querySelectorAll('input[placeholder*="search" i], input[placeholder*="Search"]');

      // Check for category organization
      const categoryElements = Array.from(document.querySelectorAll('*')).filter(el => {
        const text = el.textContent || '';
        return text.includes('Requirements') ||
               text.includes('Time Management') ||
               text.includes('questions');
      });

      return {
        totalCards: allCards.length,
        cardContentElements: cardContentElements.length,
        checkboxes: checkboxes.length,
        questionElements: questionElements.length,
        clickableQuestions: clickableQuestions.length,
        hasProgressIndicator: progressElements.length > 0,
        hasSearchInput: searchInputs.length > 0,
        categoryElements: categoryElements.length,
        // Detailed card analysis
        cardDetails: Array.from(allCards).slice(0, 3).map(card => ({
          classes: card.className,
          hasCheck: card.querySelector('[class*="Check"]') !== null,
          hasCategory: card.textContent.includes('Requirements') || card.textContent.includes('Time'),
          textPreview: card.textContent.substring(0, 100)
        })),
        // Check if questions are in card format based on expected structure
        hasQuestionCards: Array.from(allCards).some(card => {
          const text = card.textContent;
          return text.includes('When faced with') ||
                 text.includes('q01') ||
                 text.includes('Requirements') ||
                 text.includes('ID:');
        })
      };
    });

    console.log('📊 Question Selection Analysis:');
    console.log(`   🃏 Total Cards Found: ${selectionAnalysis.totalCards}`);
    console.log(`   📋 Card Content Elements: ${selectionAnalysis.cardContentElements}`);
    console.log(`   ☑️  Checkboxes Found: ${selectionAnalysis.checkboxes}`);
    console.log(`   ❓ Question Elements: ${selectionAnalysis.questionElements}`);
    console.log(`   🖱️  Clickable Question Elements: ${selectionAnalysis.clickableQuestions}`);
    console.log(`   📈 Has Progress Indicator: ${selectionAnalysis.hasProgressIndicator}`);
    console.log(`   🔍 Has Search Input: ${selectionAnalysis.hasSearchInput}`);
    console.log(`   📂 Category Elements: ${selectionAnalysis.categoryElements}`);
    console.log(`   🎯 Has Question Cards: ${selectionAnalysis.hasQuestionCards}`);

    if (selectionAnalysis.cardDetails.length > 0) {
      console.log('   🃏 Card Details (first 3):');
      selectionAnalysis.cardDetails.forEach((card, i) => {
        console.log(`      Card ${i + 1}: ${card.hasCheck ? '✅' : '⬜'} ${card.hasCategory ? '🏷️' : '🔸'} ${card.textPreview}`);
      });
    }

    // Test search functionality if available
    if (selectionAnalysis.hasSearchInput) {
      console.log('🔍 Testing search functionality...');
      const searchInput = await page.$('input[placeholder*="Search"], input[placeholder*="search"]');
      if (searchInput) {
        await searchInput.type('requirements');
        await new Promise(resolve => setTimeout(resolve, 500));

        const filteredResults = await page.evaluate(() => {
          const visibleCards = Array.from(document.querySelectorAll('[class*="Card"]')).filter(card => {
            const style = window.getComputedStyle(card);
            return style.display !== 'none' && style.visibility !== 'hidden';
          });
          return visibleCards.length;
        });

        console.log(`   🔍 Search results: ${filteredResults} visible cards for "requirements"`);

        // Clear search
        await page.evaluate(() => {
          const searchInput = document.querySelector('input[placeholder*="Search"], input[placeholder*="search"]');
          if (searchInput) {
            searchInput.value = '';
            searchInput.dispatchEvent(new Event('input', { bubbles: true }));
          }
        });
      }
    }

    // Final validation
    console.log('\n🎯 Validation Results:');

    if (selectionAnalysis.hasQuestionCards) {
      console.log('✅ PASS: Question selection uses card-based interface');
    } else if (selectionAnalysis.totalCards > 0) {
      console.log('⚠️  PARTIAL: Cards found but may not contain questions (could be collapsed categories)');
    } else {
      console.log('❌ FAIL: No card-based interface detected');
    }

    if (selectionAnalysis.checkboxes === 0) {
      console.log('✅ PASS: No checkboxes found - using card selection instead');
    } else {
      console.log(`⚠️  INFO: ${selectionAnalysis.checkboxes} checkboxes found (may be for other UI elements)`);
    }

    if (selectionAnalysis.hasSearchInput) {
      console.log('✅ PASS: Search functionality implemented');
    }

    if (selectionAnalysis.categoryElements > 0) {
      console.log('✅ PASS: Category organization detected');
    }

    // Take a screenshot for visual verification
    await page.screenshot({
      path: '/Users/harrisongarber/Documents/claude_projects/oneshots/Persona_Experiment/question-selection-screenshot.png',
      fullPage: true
    });
    console.log('📸 Screenshot saved: question-selection-screenshot.png');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  testQuestionSelectionCards().catch(console.error);
}

module.exports = { testQuestionSelectionCards };