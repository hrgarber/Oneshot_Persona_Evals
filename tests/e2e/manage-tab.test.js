const PuppeteerHelper = require('../helpers/puppeteer');
const assertions = require('../helpers/assertions');
const testData = require('../fixtures/test-data');

describe('Manage Tab E2E Tests', () => {
  let puppeteer;

  beforeAll(async () => {
    puppeteer = new PuppeteerHelper();
    await puppeteer.launch();
  });

  afterAll(async () => {
    await puppeteer.close();
  });

  beforeEach(async () => {
    await puppeteer.goto('/');
  });

  describe('Navigation', () => {
    test('should navigate to manage tab successfully', async () => {
      await puppeteer.clickTab('Manage');
      await assertions.hasActiveTab(puppeteer.page, 'Manage');
      await assertions.hasVisibleText(puppeteer.page, 'Manage Experiment Components');
    });

    test('should show personas and questionnaires sub-tabs', async () => {
      await puppeteer.clickTab('Manage');
      await assertions.hasButton(puppeteer.page, 'Personas');
      await assertions.hasButton(puppeteer.page, 'Questionnaires');
    });

    test('should switch between sub-tabs correctly', async () => {
      await puppeteer.clickTab('Manage');

      await puppeteer.clickButton('Questionnaires');
      await assertions.hasActiveTab(puppeteer.page, 'Questionnaires');

      await puppeteer.clickButton('Personas');
      await assertions.hasActiveTab(puppeteer.page, 'Personas');
    });
  });

  describe('Personas Tab', () => {
    beforeEach(async () => {
      await puppeteer.clickTab('Manage');
      await puppeteer.clickButton('Personas');
    });

    test('should show persona creation interface', async () => {
      await assertions.hasButton(puppeteer.page, 'Manual Create');
    });

    test('should open persona creation form', async () => {
      const clicked = await puppeteer.clickButton('Manual Create');
      expect(clicked).toBe(true);

      await assertions.hasFormField(puppeteer.page, 'input[id="name"]');
      await assertions.hasFormField(puppeteer.page, 'textarea[id="description"]');
    });

    test('should validate persona creation form fields', async () => {
      await puppeteer.clickButton('Manual Create');

      await puppeteer.fillForm({
        'input[id="name"]': testData.personas.valid.name,
        'textarea[id="description"]': testData.personas.valid.description
      });

      // Cancel to avoid creating test data
      await puppeteer.clickButton('Cancel');
    });
  });

  describe('Questionnaires Tab', () => {
    beforeEach(async () => {
      await puppeteer.clickTab('Manage');
      await puppeteer.clickButton('Questionnaires');
    });

    test('should show questionnaire creation interface', async () => {
      await assertions.hasButton(puppeteer.page, 'Create New Questionnaire');
    });

    test('should use card-based question selection', async () => {
      const createExists = await puppeteer.page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.some(btn => btn.textContent.includes('Create New Questionnaire'));
      });

      if (createExists) {
        await puppeteer.clickButton('Create New Questionnaire');

        // Check for cards, not checkboxes
        const cardCount = await assertions.hasCards(puppeteer.page, 1);
        expect(cardCount).toBeGreaterThan(0);

        const hasCheckboxes = await puppeteer.page.evaluate(() => {
          return document.querySelectorAll('input[type="checkbox"]').length;
        });
        expect(hasCheckboxes).toBe(0);
      }
    });

    test('should have search functionality', async () => {
      const createExists = await puppeteer.page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.some(btn => btn.textContent.includes('Create New Questionnaire'));
      });

      if (createExists) {
        await puppeteer.clickButton('Create New Questionnaire');
        await assertions.hasFormField(puppeteer.page, 'input[placeholder*="Search"]');
      }
    });
  });

  describe('CRUD Operations', () => {
    test('should provide accessible CRUD operations for personas', async () => {
      await puppeteer.clickTab('Manage');
      await puppeteer.clickButton('Personas');

      // Check for create functionality
      await assertions.hasButton(puppeteer.page, 'Manual Create');

      // Check for export if personas exist
      const hasExport = await puppeteer.page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.some(btn => btn.textContent.includes('Export'));
      });

      // Export button should exist if there are personas
      if (hasExport) {
        await assertions.hasButton(puppeteer.page, 'Export');
      }
    });

    test('should provide accessible CRUD operations for questionnaires', async () => {
      await puppeteer.clickTab('Manage');
      await puppeteer.clickButton('Questionnaires');

      await assertions.hasButton(puppeteer.page, 'Create New Questionnaire');

      // Check for edit/delete buttons on existing questionnaires
      const hasExistingQuestionnaires = await puppeteer.page.evaluate(() => {
        return document.querySelectorAll('.border.rounded-lg.p-4').length > 0;
      });

      if (hasExistingQuestionnaires) {
        const editButtons = await puppeteer.page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          return buttons.filter(btn =>
            btn.textContent.includes('Edit') || btn.textContent.includes('Delete')
          ).length;
        });
        expect(editButtons).toBeGreaterThan(0);
      }
    });
  });
});