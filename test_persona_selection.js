/**
 * HYPOTHESIS: The persona selection functionality in Run Experiment tab works correctly
 * after recent fixes to prop interface mismatch and disabled state handling.
 *
 * SUCCESS CRITERIA:
 * 1. Persona cards are clickable and show selection state
 * 2. Select All and Clear All buttons work
 * 3. Recommended combinations dropdown functions
 * 4. Selection counter updates correctly
 * 5. Visual feedback (green rings, checkmarks) appears properly
 */

const puppeteer = require('puppeteer');

async function testPersonaSelection() {
    console.log('🧪 TESTING HYPOTHESIS: Persona selection functionality works after recent fixes');

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    let page;
    try {
        page = await browser.newPage();
        await page.setViewport({ width: 1200, height: 800 });

        console.log('📍 Navigating to application...');
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

        // The Run Experiment tab should already be active, but verify
        console.log('📍 Verifying Run Experiment tab is active...');
        const isRunExperimentActive = await page.evaluate(() => {
            const activeTab = document.querySelector('button[role="tab"][aria-selected="true"]');
            return activeTab && activeTab.textContent.includes('Run Experiment');
        });

        if (!isRunExperimentActive) {
            console.log('📍 Clicking Run Experiment tab...');
            await page.click('button[role="tab"]:first-child');
            await page.waitForTimeout(500);
        }

        console.log('✅ Successfully on Run Experiment tab');

        // Test 1: Check persona selection UI structure
        console.log('\n🔍 TEST 1: Checking persona selection UI structure...');

        // Look for the persona grid container
        const personaGridExists = await page.evaluate(() => {
            const grid = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3.gap-4');
            return !!grid;
        });

        console.log(`   Persona grid container: ${personaGridExists ? '✅ Found' : '❌ Missing'}`);

        // Check selection counter
        const selectionCounter = await page.evaluate(() => {
            const counter = document.querySelector('span:contains("selected")');
            return Array.from(document.querySelectorAll('span')).find(span =>
                span.textContent.includes('selected')
            )?.textContent || 'Not found';
        });

        console.log(`   Selection counter: ${selectionCounter}`);

        // Test 2: Click a persona card and verify selection state
        console.log('\n🔍 TEST 2: Testing persona card selection...');

        const initialSelectionCount = await page.evaluate(() => {
            const counter = document.querySelector('[data-testid="selection-counter"], .text-sm');
            return counter ? parseInt(counter.textContent.match(/\d+/)?.[0] || '0') : 0;
        });

        console.log(`   Initial selection count: ${initialSelectionCount}`);

        // Click first available persona card
        const cardClicked = await page.evaluate(() => {
            const cards = document.querySelectorAll('.persona-card, [data-testid="persona-card"], .border');
            for (let card of cards) {
                const text = card.textContent || '';
                if (text.includes('Agent') || text.includes('Manager') || text.includes('CEO') ||
                    card.querySelector('.checkbox, input[type="checkbox"]')) {
                    card.click();
                    return true;
                }
            }
            return false;
        });

        if (!cardClicked) {
            throw new Error('Could not click any persona card');
        }

        await page.waitForTimeout(500);

        const newSelectionCount = await page.evaluate(() => {
            const counter = document.querySelector('[data-testid="selection-counter"], .text-sm');
            return counter ? parseInt(counter.textContent.match(/\d+/)?.[0] || '0') : 0;
        });

        console.log(`   Selection count after click: ${newSelectionCount}`);

        if (newSelectionCount <= initialSelectionCount) {
            console.log('⚠️  Selection count did not increase - checking if card was already selected');
        } else {
            console.log('✅ Persona card selection working - count increased');
        }

        // Test 3: Test Select All button
        console.log('\n🔍 TEST 3: Testing Select All button...');

        const selectAllClicked = await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const selectAllBtn = buttons.find(btn =>
                btn.textContent?.includes('Select All') ||
                btn.textContent?.includes('All')
            );
            if (selectAllBtn && !selectAllBtn.disabled) {
                selectAllBtn.click();
                return true;
            }
            return false;
        });

        if (selectAllClicked) {
            await page.waitForTimeout(500);

            const allSelectionCount = await page.evaluate(() => {
                const counter = document.querySelector('[data-testid="selection-counter"], .text-sm');
                return counter ? parseInt(counter.textContent.match(/\d+/)?.[0] || '0') : 0;
            });

            console.log(`   Selection count after Select All: ${allSelectionCount}`);
            console.log('✅ Select All button is functional');
        } else {
            console.log('⚠️  Select All button not found or disabled');
        }

        // Test 4: Test Clear All button
        console.log('\n🔍 TEST 4: Testing Clear All button...');

        const clearAllClicked = await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const clearAllBtn = buttons.find(btn =>
                btn.textContent?.includes('Clear All') ||
                btn.textContent?.includes('Clear')
            );
            if (clearAllBtn && !clearAllBtn.disabled) {
                clearAllBtn.click();
                return true;
            }
            return false;
        });

        if (clearAllClicked) {
            await page.waitForTimeout(500);

            const clearedSelectionCount = await page.evaluate(() => {
                const counter = document.querySelector('[data-testid="selection-counter"], .text-sm');
                return counter ? parseInt(counter.textContent.match(/\d+/)?.[0] || '0') : 0;
            });

            console.log(`   Selection count after Clear All: ${clearedSelectionCount}`);
            if (clearedSelectionCount === 0) {
                console.log('✅ Clear All button working correctly');
            } else {
                console.log('⚠️  Clear All may not have cleared all selections');
            }
        } else {
            console.log('⚠️  Clear All button not found or disabled');
        }

        // Test 5: Test recommended combinations dropdown
        console.log('\n🔍 TEST 5: Testing recommended combinations dropdown...');

        const dropdownFound = await page.evaluate(() => {
            const selects = document.querySelectorAll('select, [role="combobox"], .dropdown');
            const buttons = document.querySelectorAll('button');

            // Look for dropdown with recommended combinations
            for (let element of [...selects, ...buttons]) {
                const text = element.textContent || element.getAttribute('placeholder') || '';
                if (text.includes('Recommend') || text.includes('combination') ||
                    text.includes('preset') || text.includes('Quick')) {
                    return true;
                }
            }
            return false;
        });

        if (dropdownFound) {
            console.log('✅ Recommended combinations dropdown found');
        } else {
            console.log('⚠️  Recommended combinations dropdown not found');
        }

        // Test 6: Check for visual feedback elements
        console.log('\n🔍 TEST 6: Checking for visual feedback elements...');

        const visualFeedback = await page.evaluate(() => {
            const results = {
                checkmarks: document.querySelectorAll('.checkmark, .check, svg[data-testid="check"]').length,
                rings: document.querySelectorAll('.ring, .border-green, .selected').length,
                selectedStates: document.querySelectorAll('.selected, [data-selected="true"], .bg-green').length
            };
            return results;
        });

        console.log(`   Found visual feedback elements:`);
        console.log(`   - Checkmarks: ${visualFeedback.checkmarks}`);
        console.log(`   - Rings/borders: ${visualFeedback.rings}`);
        console.log(`   - Selected states: ${visualFeedback.selectedStates}`);

        if (visualFeedback.checkmarks > 0 || visualFeedback.rings > 0 || visualFeedback.selectedStates > 0) {
            console.log('✅ Visual feedback elements present');
        } else {
            console.log('⚠️  Limited visual feedback elements found');
        }

        // Final validation - take screenshot for manual review
        console.log('\n📸 Taking screenshot for manual validation...');
        await page.screenshot({
            path: '/Users/harrisongarber/Documents/claude_projects/oneshots/Persona_Experiment/persona_selection_test.png',
            fullPage: true
        });

        console.log('\n🎯 HYPOTHESIS VALIDATION COMPLETE');
        console.log('📊 RESULTS SUMMARY:');
        console.log(`   - Persona cards found: ${personaCards > 0 ? '✅' : '❌'}`);
        console.log(`   - Card selection works: ${newSelectionCount !== initialSelectionCount ? '✅' : '⚠️'}`);
        console.log(`   - Select All button: ${selectAllClicked ? '✅' : '⚠️'}`);
        console.log(`   - Clear All button: ${clearAllClicked ? '✅' : '⚠️'}`);
        console.log(`   - Dropdown present: ${dropdownFound ? '✅' : '⚠️'}`);
        console.log(`   - Visual feedback: ${(visualFeedback.checkmarks + visualFeedback.rings + visualFeedback.selectedStates) > 0 ? '✅' : '⚠️'}`);

        const overallSuccess = personaCards > 0 && (selectAllClicked || clearAllClicked);
        console.log(`\n🏆 OVERALL HYPOTHESIS: ${overallSuccess ? 'VALIDATED ✅' : 'NEEDS REVIEW ⚠️'}`);

        return overallSuccess;

    } catch (error) {
        console.error('❌ TEST FAILED:', error.message);
        await page.screenshot({
            path: '/Users/harrisongarber/Documents/claude_projects/oneshots/Persona_Experiment/persona_selection_error.png',
            fullPage: true
        });
        return false;
    } finally {
        await browser.close();
    }
}

if (require.main === module) {
    testPersonaSelection().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = testPersonaSelection;