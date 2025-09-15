const puppeteer = require('puppeteer');

async function debugQuestionnaires() {
  console.log('🔍 Debugging Questionnaires Tab State');

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 720 },
    args: ['--no-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.goto('http://localhost:3005', { waitUntil: 'networkidle0' });

    // Navigate to Manage tab
    const tabs = await page.$$('button[role="tab"]');
    await tabs[1].click();
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Debug all tab elements first
    const allTabs = await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('button[role="tab"]'));
      return tabs.map((tab, index) => ({
        index,
        text: tab.textContent.trim(),
        state: tab.getAttribute('data-state'),
        value: tab.getAttribute('data-value') || tab.getAttribute('value'),
        classes: tab.className
      }));
    });

    console.log('All tabs found:', allTabs);

    // Try clicking the questionnaires tab by index
    const questionnairesClicked = await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('button[role="tab"]'));
      if (tabs[5] && tabs[5].textContent.includes('Questionnaires')) {
        tabs[5].click();
        console.log('Questionnaires tab clicked by index');
        return true;
      }
      return false;
    });

    console.log(`Questionnaires tab clicked: ${questionnairesClicked}`);
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check if the tab state changed
    const tabStatesAfterClick = await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('button[role="tab"]'));
      return tabs.map(tab => ({
        text: tab.textContent.trim(),
        state: tab.getAttribute('data-state')
      })).filter(tab => tab.text.includes('Personas') || tab.text.includes('Questionnaires'));
    });

    console.log('Tab states after click:', tabStatesAfterClick);

    // Get comprehensive DOM analysis
    const pageAnalysis = await page.evaluate(() => {
      const content = {
        allText: document.body.textContent,
        allButtons: Array.from(document.querySelectorAll('button')).map(btn => ({
          text: btn.textContent.trim(),
          disabled: btn.disabled,
          visible: window.getComputedStyle(btn).display !== 'none'
        })),
        formElements: Array.from(document.querySelectorAll('input, textarea, form')).map(el => ({
          tag: el.tagName,
          type: el.type || '',
          id: el.id || '',
          placeholder: el.placeholder || '',
          visible: window.getComputedStyle(el).display !== 'none'
        })),
        cardElements: Array.from(document.querySelectorAll('[class*="Card"]')).map(el => ({
          classes: el.className,
          text: el.textContent.substring(0, 100),
          visible: window.getComputedStyle(el).display !== 'none'
        })),
        hasCreateButton: document.body.textContent.includes('Create New Questionnaire'),
        hasExistingQuestionnaires: document.body.textContent.includes('questionnaires') &&
                                   document.querySelectorAll('.border.rounded-lg.p-4').length > 0,
        currentTabState: Array.from(document.querySelectorAll('button[role="tab"]')).map(tab => ({
          text: tab.textContent.trim(),
          active: tab.getAttribute('data-state') === 'active'
        }))
      };

      return content;
    });

    console.log('📄 Page Analysis:');
    console.log('Current Tab States:', pageAnalysis.currentTabState);
    console.log(`Has "Create New Questionnaire" text: ${pageAnalysis.hasCreateButton}`);
    console.log(`Has existing questionnaires: ${pageAnalysis.hasExistingQuestionnaires}`);

    console.log('\n🔘 All Buttons:');
    pageAnalysis.allButtons.forEach(btn => {
      if (btn.text.length > 0) {
        console.log(`  ${btn.visible ? '👁️' : '🚫'} "${btn.text}" ${btn.disabled ? '(disabled)' : ''}`);
      }
    });

    console.log('\n📝 Form Elements:');
    pageAnalysis.formElements.forEach(el => {
      console.log(`  ${el.visible ? '👁️' : '🚫'} ${el.tag} ${el.type ? `[${el.type}]` : ''} id="${el.id}" placeholder="${el.placeholder}"`);
    });

    console.log('\n🃏 Card Elements:');
    pageAnalysis.cardElements.forEach((card, i) => {
      console.log(`  Card ${i + 1}: ${card.visible ? '👁️' : '🚫'} "${card.text}"`);
    });

    // Check if we're in edit mode for an existing questionnaire
    if (pageAnalysis.formElements.some(el => el.id === 'name')) {
      console.log('\n✅ Form is already open! Analyzing question selection...');

      const questionAnalysis = await page.evaluate(() => {
        return {
          searchInput: document.querySelector('input[placeholder*="Search"]') !== null,
          progressBar: document.querySelector('[class*="Progress"]') !== null,
          selectAllBtn: Array.from(document.querySelectorAll('button')).some(btn =>
            btn.textContent.includes('Select All')),
          categoryButtons: Array.from(document.querySelectorAll('button')).filter(btn =>
            btn.textContent.includes('questions')).map(btn => btn.textContent.trim()),
          questionCards: Array.from(document.querySelectorAll('[class*="Card"]')).filter(card =>
            card.textContent.includes('When faced with') ||
            card.textContent.includes('Requirements') ||
            card.textContent.includes('ID:')).length
        };
      });

      console.log('Question Selection Analysis:', questionAnalysis);
    }

    // Try clicking create button if it exists
    const createClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const createBtn = buttons.find(btn =>
        btn.textContent.includes('Create New Questionnaire') ||
        btn.textContent.includes('Create') && btn.textContent.includes('Questionnaire')
      );
      if (createBtn && !createBtn.disabled) {
        createBtn.click();
        return true;
      }
      return false;
    });

    if (createClicked) {
      console.log('\n🔧 Create button clicked, waiting for form...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      const formOpened = await page.$('input[id="name"]') !== null;
      console.log(`Form opened: ${formOpened}`);
    } else {
      console.log('\n⚠️ Could not find or click create button');
    }

    // Take screenshot for visual debugging
    await page.screenshot({
      path: '/Users/harrisongarber/Documents/claude_projects/oneshots/Persona_Experiment/debug-questionnaires.png',
      fullPage: true
    });
    console.log('\n📸 Debug screenshot saved: debug-questionnaires.png');

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  } finally {
    // Keep browser open for 5 seconds for visual inspection
    console.log('\n👁️ Keeping browser open for 5 seconds for visual inspection...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    await browser.close();
  }
}

debugQuestionnaires().catch(console.error);