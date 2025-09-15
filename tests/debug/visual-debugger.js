const PuppeteerHelper = require('../helpers/puppeteer');

class VisualDebugger {
  constructor() {
    this.puppeteer = new PuppeteerHelper();
    this.screenshotCount = 0;
  }

  async launch(options = {}) {
    const debugOptions = {
      headless: false,  // Always show browser for debugging
      ...options
    };
    return await this.puppeteer.launch(debugOptions);
  }

  async debugPage(url = '/', steps = []) {
    console.log(`🔍 Starting visual debug session for: ${url}`);

    await this.puppeteer.goto(url);
    await this.screenshot('initial-load');

    for (const step of steps) {
      console.log(`📍 Executing step: ${step.name}`);
      try {
        await step.action(this.puppeteer);
        await this.screenshot(`step-${steps.indexOf(step) + 1}-${step.name}`);
        await this.pause(step.pauseMs || 1000);
      } catch (error) {
        console.error(`❌ Step failed: ${step.name}`, error.message);
        await this.screenshot(`error-${step.name}`);
      }
    }

    console.log('🎯 Debug session complete. Check screenshots in /tests/screenshots/');
    return this.screenshotCount;
  }

  async screenshot(name) {
    this.screenshotCount++;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `debug-${timestamp}-${name}.png`;
    await this.puppeteer.screenshot(filename);
    console.log(`📸 Screenshot saved: ${filename}`);
  }

  async pause(ms = 2000) {
    console.log(`⏸️ Pausing for ${ms}ms...`);
    await new Promise(resolve => setTimeout(resolve, ms));
  }

  async getPageInfo() {
    const info = await this.puppeteer.page.evaluate(() => {
      return {
        url: window.location.href,
        title: document.title,
        activeElement: document.activeElement?.tagName,
        tabs: Array.from(document.querySelectorAll('button[role="tab"]')).map(tab => ({
          text: tab.textContent.trim(),
          active: tab.getAttribute('data-state') === 'active'
        })),
        buttons: Array.from(document.querySelectorAll('button')).map(btn => ({
          text: btn.textContent.trim(),
          disabled: btn.disabled,
          visible: window.getComputedStyle(btn).display !== 'none'
        })).filter(btn => btn.text.length > 0),
        forms: Array.from(document.querySelectorAll('input, textarea')).map(input => ({
          type: input.type,
          id: input.id,
          placeholder: input.placeholder,
          value: input.value
        })),
        cards: document.querySelectorAll('[class*="Card"]').length
      };
    });

    console.log('📋 Page Info:', JSON.stringify(info, null, 2));
    return info;
  }

  async close() {
    await this.puppeteer.close();
  }
}

// Pre-built debug scenarios
const debugScenarios = {
  manageTabFlow: [
    {
      name: 'navigate-to-manage',
      action: async (puppeteer) => {
        await puppeteer.clickTab('Manage');
      }
    },
    {
      name: 'switch-to-questionnaires',
      action: async (puppeteer) => {
        await puppeteer.clickButton('Questionnaires');
      },
      pauseMs: 1500
    },
    {
      name: 'open-questionnaire-creation',
      action: async (puppeteer) => {
        await puppeteer.clickButton('Create New Questionnaire');
      },
      pauseMs: 2000
    }
  ],

  personaFlow: [
    {
      name: 'navigate-to-manage',
      action: async (puppeteer) => {
        await puppeteer.clickTab('Manage');
      }
    },
    {
      name: 'switch-to-personas',
      action: async (puppeteer) => {
        await puppeteer.clickButton('Personas');
      },
      pauseMs: 1500
    },
    {
      name: 'open-persona-creation',
      action: async (puppeteer) => {
        await puppeteer.clickButton('Manual Create');
      },
      pauseMs: 2000
    }
  ]
};

module.exports = { VisualDebugger, debugScenarios };