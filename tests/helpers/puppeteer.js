const puppeteer = require('puppeteer');

class PuppeteerHelper {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async launch(options = {}) {
    const defaultOptions = {
      headless: global.TEST_CONFIG?.headless ?? true,
      defaultViewport: global.TEST_CONFIG?.viewport ?? { width: 1280, height: 720 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    };

    this.browser = await puppeteer.launch({ ...defaultOptions, ...options });
    this.page = await this.browser.newPage();

    // Set up console logging if debugging
    if (process.env.DEBUG_TESTS) {
      this.page.on('console', msg => console.log('PAGE LOG:', msg.text()));
      this.page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    }

    return this.page;
  }

  async goto(url, options = {}) {
    if (!this.page) throw new Error('Browser not launched. Call launch() first.');

    const fullUrl = url.startsWith('http') ? url : `${global.TEST_CONFIG.baseURL}${url}`;
    return await this.page.goto(fullUrl, { waitUntil: 'networkidle0', ...options });
  }

  async waitForTab(tabText, timeout = 5000) {
    await this.page.waitForFunction(
      (text) => {
        const tabs = Array.from(document.querySelectorAll('button[role="tab"]'));
        return tabs.some(tab => tab.textContent.includes(text));
      },
      { timeout },
      tabText
    );
  }

  async clickTab(tabText) {
    await this.waitForTab(tabText);
    await this.page.evaluate((text) => {
      const tabs = Array.from(document.querySelectorAll('button[role="tab"]'));
      const tab = tabs.find(t => t.textContent.includes(text));
      if (tab) tab.click();
    }, tabText);
    await this.page.waitForTimeout(500); // Allow for tab switch
  }

  async clickButton(buttonText, options = {}) {
    const { exact = false, timeout = 5000 } = options;

    await this.page.waitForFunction(
      (text, exact) => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.some(btn =>
          exact ? btn.textContent.trim() === text : btn.textContent.includes(text)
        );
      },
      { timeout },
      buttonText,
      exact
    );

    return await this.page.evaluate((text, exact) => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const button = buttons.find(btn =>
        exact ? btn.textContent.trim() === text : btn.textContent.includes(text)
      );
      if (button && !button.disabled) {
        button.click();
        return true;
      }
      return false;
    }, buttonText, exact);
  }

  async fillForm(fields) {
    for (const [selector, value] of Object.entries(fields)) {
      await this.page.waitForSelector(selector);
      await this.page.clear(selector);
      await this.page.type(selector, value);
    }
  }

  async getPageText() {
    return await this.page.evaluate(() => document.body.textContent);
  }

  async screenshot(filename) {
    if (!filename.includes('/')) {
      filename = `/Users/harrisongarber/Documents/claude_projects/oneshots/Persona_Experiment/tests/screenshots/${filename}`;
    }
    return await this.page.screenshot({ path: filename, fullPage: true });
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }
}

module.exports = PuppeteerHelper;