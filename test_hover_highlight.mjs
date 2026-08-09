import { chromium } from 'playwright';

async function test() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ colorScheme: 'light', viewport: { width: 1200, height: 1600 } });
  const page = await context.newPage();

  try {
    await page.goto('http://127.0.0.1:5173/workouts', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    await page.getByRole('button', { name: 'Accept All' }).click();
    await page.waitForTimeout(200);

    const raceDistSelect = page.locator('select').first();
    await raceDistSelect.selectOption('5K');
    await page.getByLabel(/race time/i).fill('20:00');
    await page.locator('#weekly-mileage').fill('60');
    await page.waitForTimeout(2000);

    await page.evaluate(() => window.scrollBy(0, 800));
    await page.waitForTimeout(500);

    const btn = page.locator('button:has-text("Easy fartlek")').first();
    await btn.click();
    await page.waitForTimeout(500);

    // Hover over a "Stride" row
    const strideRows = page.locator('text=Stride');
    if (await strideRows.count() > 0) {
      await strideRows.first().hover();
      await page.waitForTimeout(300);
    }

    await page.screenshot({ path: '/private/tmp/claude-501/-Users-alanwaddington-Development-runwise/ae169058-93a9-47aa-a91b-784cb1290c6f/scratchpad/hover_highlight.png' });
    console.log('✅ Screenshot saved with hover highlight');

    await browser.close();
    process.exit(0);

  } catch (error) {
    console.error('Error:', error.message);
    await browser.close();
    process.exit(1);
  }
}

test();
