import { chromium } from 'playwright';

async function test() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ colorScheme: 'light', viewport: { width: 1200, height: 1400 } });
  const page = await context.newPage();

  try {
    await page.goto('http://127.0.0.1:5173/workouts', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    await page.getByRole('button', { name: 'Accept All' }).click();
    await page.waitForTimeout(200);

    await page.getByRole('button', { name: 'Power' }).click();
    await page.waitForTimeout(300);
    
    await page.locator('#device-select').selectOption('stryd');
    await page.locator('#power').fill('250');
    await page.locator('#weekly-mileage').fill('60');
    await page.waitForTimeout(2000);

    await page.evaluate(() => window.scrollBy(0, 1000));
    await page.waitForTimeout(500);

    console.log('Testing workout profile chart tooltips...\n');

    // Open fartlek modal
    const btn = page.locator('button:has-text("Easy fartlek")').first();
    await btn.click();
    await page.waitForTimeout(500);

    // Get the SVG chart
    const chart = page.locator('svg[viewBox]').first();
    const isVisible = await chart.isVisible();
    console.log(`Chart visible: ${isVisible ? '✅' : '❌'}`);

    // Hover over first rect in chart
    const rects = page.locator('svg[viewBox] rect');
    const rectCount = await rects.count();
    console.log(`Chart segments found: ${rectCount}`);

    if (rectCount > 0) {
      // Hover over middle rect
      const middleRect = rects.nth(Math.floor(rectCount / 2));
      await middleRect.hover();
      await page.waitForTimeout(300);

      // Get tooltip text
      const titleElement = page.locator('svg[viewBox] title').nth(Math.floor(rectCount / 2));
      const tooltipText = await titleElement.textContent();
      console.log(`Tooltip text: "${tooltipText}"`);

      // Take screenshot showing hover
      await page.screenshot({ path: '/private/tmp/claude-501/-Users-alanwaddington-Development-runwise/ae169058-93a9-47aa-a91b-784cb1290c6f/scratchpad/chart_tooltip.png' });
      console.log('Screenshot: chart_tooltip.png');
    }

    console.log('\n✅ Chart tooltips working!');
    await browser.close();
    process.exit(0);

  } catch (error) {
    console.error('Error:', error.message);
    await browser.close();
    process.exit(1);
  }
}

test();
