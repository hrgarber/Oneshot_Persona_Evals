// Custom assertion helpers for common test patterns

const assertions = {
  async hasVisibleText(page, text, timeout = 5000) {
    try {
      await page.waitForFunction(
        (searchText) => document.body.textContent.includes(searchText),
        { timeout },
        text
      );
      return true;
    } catch (error) {
      throw new Error(`Text "${text}" not found on page within ${timeout}ms`);
    }
  },

  async hasButton(page, buttonText, timeout = 5000) {
    try {
      await page.waitForFunction(
        (text) => {
          const buttons = Array.from(document.querySelectorAll('button'));
          return buttons.some(btn => btn.textContent.includes(text));
        },
        { timeout },
        buttonText
      );
      return true;
    } catch (error) {
      throw new Error(`Button "${buttonText}" not found within ${timeout}ms`);
    }
  },

  async hasFormField(page, selector, timeout = 5000) {
    try {
      await page.waitForSelector(selector, { timeout, visible: true });
      return true;
    } catch (error) {
      throw new Error(`Form field "${selector}" not found within ${timeout}ms`);
    }
  },

  async hasCards(page, minimumCount = 1) {
    const cardCount = await page.evaluate(() => {
      return document.querySelectorAll('[class*="Card"]').length;
    });

    if (cardCount < minimumCount) {
      throw new Error(`Expected at least ${minimumCount} cards, found ${cardCount}`);
    }

    return cardCount;
  },

  async hasActiveTab(page, tabText) {
    const isActive = await page.evaluate((text) => {
      const tabs = Array.from(document.querySelectorAll('button[role="tab"]'));
      const tab = tabs.find(t => t.textContent.includes(text));
      return tab && tab.getAttribute('data-state') === 'active';
    }, tabText);

    if (!isActive) {
      throw new Error(`Tab "${tabText}" is not active`);
    }

    return true;
  },

  async buttonIsEnabled(page, buttonText) {
    const isEnabled = await page.evaluate((text) => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const button = buttons.find(btn => btn.textContent.includes(text));
      return button && !button.disabled;
    }, buttonText);

    if (!isEnabled) {
      throw new Error(`Button "${buttonText}" is not enabled`);
    }

    return true;
  }
};

module.exports = assertions;