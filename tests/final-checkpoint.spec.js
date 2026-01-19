const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

// All 20 calculators to test
const calculators = [
  '401k', 'auto-loan', 'compound-interest', 'debt-payoff', 'emergency-fund',
  'home-affordability', 'inflation', 'investment-return', 'loan-payoff', 'mortgage',
  'refinance', 'rent-vs-buy', 'retirement', 'roth-vs-traditional', 'salary',
  'savings-goal', 'self-employment-tax', 'social-security', 'student-loan', 'take-home-pay'
];

test.describe('Final Checkpoint - UX Optimization', () => {
  
  test('All 20 calculators have new layout structure', async ({ page }) => {
    const results = [];
    
    for (const calc of calculators) {
      await page.goto(`/calculators/${calc}.html`);
      
      const hasLayout = await page.locator('.calc-tool-layout').count() > 0;
      const hasInputPanel = await page.locator('.calc-input-panel').count() > 0;
      const hasOutputPanel = await page.locator('.calc-output-panel').count() > 0;
      const hasSidebar = await page.locator('.info-sidebar').count() > 0;
      const hasToggleButton = await page.locator('.info-toggle').count() > 0;
      
      results.push({
        calculator: calc,
        hasLayout,
        hasInputPanel,
        hasOutputPanel,
        hasSidebar,
        hasToggleButton,
        complete: hasLayout && hasInputPanel && hasOutputPanel && hasSidebar && hasToggleButton
      });
    }
    
    console.log('\n=== Migration Completeness Report ===');
    results.forEach(r => {
      const status = r.complete ? '✓' : '✗';
      console.log(`${status} ${r.calculator}: Layout=${r.hasLayout}, Input=${r.hasInputPanel}, Output=${r.hasOutputPanel}, Sidebar=${r.hasSidebar}, Toggle=${r.hasToggleButton}`);
    });
    
    const allComplete = results.every(r => r.complete);
    expect(allComplete).toBe(true);
  });

  test('Desktop responsive layout works (sample)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    
    const sampleCalcs = ['mortgage', '401k', 'student-loan'];
    
    for (const calc of sampleCalcs) {
      await page.goto(`/calculators/${calc}.html`);
      
      const inputPanel = page.locator('.calc-input-panel');
      const outputPanel = page.locator('.calc-output-panel');
      
      await expect(inputPanel).toBeInViewport();
      await expect(outputPanel).toBeInViewport();
      
      const inputBox = await inputPanel.boundingBox();
      const outputBox = await outputPanel.boundingBox();
      
      // Side-by-side layout
      expect(inputBox.x).toBeLessThan(outputBox.x);
    }
  });

  test('Mobile responsive layout works (sample)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    const sampleCalcs = ['mortgage', '401k', 'student-loan'];
    
    for (const calc of sampleCalcs) {
      await page.goto(`/calculators/${calc}.html`);
      
      const inputPanel = page.locator('.calc-input-panel');
      const outputPanel = page.locator('.calc-output-panel');
      
      const inputBox = await inputPanel.boundingBox();
      const outputBox = await outputPanel.boundingBox();
      
      // Stacked layout - input above output
      expect(inputBox.y).toBeLessThan(outputBox.y);
    }
  });

  test('Sidebar functionality works (sample)', async ({ page }) => {
    const sampleCalcs = ['mortgage', '401k', 'student-loan'];
    
    for (const calc of sampleCalcs) {
      await page.goto(`/calculators/${calc}.html`);
      
      const sidebar = page.locator('.info-sidebar');
      const toggleButton = page.locator('.info-toggle');
      const overlay = page.locator('.info-sidebar-overlay');
      
      // Initially hidden
      await expect(sidebar).toHaveAttribute('aria-hidden', 'true');
      
      // Open
      await toggleButton.click();
      await page.waitForTimeout(300); // Animation
      await expect(sidebar).toHaveAttribute('aria-hidden', 'false');
      
      // Close via overlay
      await overlay.click();
      await page.waitForTimeout(300);
      await expect(sidebar).toHaveAttribute('aria-hidden', 'true');
    }
  });

  test('SEO elements preserved (sample)', async ({ page }) => {
    const sampleCalcs = ['mortgage', '401k', 'student-loan'];
    
    for (const calc of sampleCalcs) {
      await page.goto(`/calculators/${calc}.html`);
      
      // JSON-LD
      const jsonLd = page.locator('script[type="application/ld+json"]');
      expect(await jsonLd.count()).toBeGreaterThan(0);
      
      // Meta tags
      await expect(page.locator('meta[name="description"]')).toBeAttached();
      await expect(page.locator('meta[property="og:title"]')).toBeAttached();
      await expect(page.locator('link[rel="canonical"]')).toBeAttached();
    }
  });

  test('Keyboard navigation works (sample)', async ({ page }) => {
    await page.goto('/calculators/mortgage.html');
    
    // Tab to first interactive element
    await page.keyboard.press('Tab');
    
    const focusedElement = await page.evaluate(() => {
      return document.activeElement.tagName;
    });
    
    expect(['INPUT', 'BUTTON', 'A', 'SELECT']).toContain(focusedElement);
  });

  test('ARIA labels present (sample)', async ({ page }) => {
    const sampleCalcs = ['mortgage', '401k', 'student-loan'];
    
    for (const calc of sampleCalcs) {
      await page.goto(`/calculators/${calc}.html`);
      
      const toggleButton = page.locator('.info-toggle');
      await expect(toggleButton).toHaveAttribute('aria-label');
      
      const sidebar = page.locator('.info-sidebar');
      await expect(sidebar).toHaveAttribute('aria-hidden');
      
      const closeButton = page.locator('.info-sidebar-close');
      await expect(closeButton).toHaveAttribute('aria-label');
    }
  });

  test('Touch targets meet minimum size (sample)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/calculators/mortgage.html');
    
    const toggleButton = page.locator('.info-toggle');
    const toggleBox = await toggleButton.boundingBox();
    expect(toggleBox.width).toBeGreaterThanOrEqual(44);
    expect(toggleBox.height).toBeGreaterThanOrEqual(44);
  });

  test('Accessibility audit (sample)', async ({ page }) => {
    const sampleCalcs = ['mortgage', '401k', 'student-loan'];
    
    for (const calc of sampleCalcs) {
      await page.goto(`/calculators/${calc}.html`);
      
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();
      
      if (results.violations.length > 0) {
        console.log(`\n${calc} accessibility violations:`);
        results.violations.forEach(v => {
          console.log(`  - ${v.id}: ${v.description}`);
          console.log(`    Impact: ${v.impact}, Nodes: ${v.nodes.length}`);
        });
      }
      
      // Allow some minor violations but fail on critical ones
      const criticalViolations = results.violations.filter(v => 
        v.impact === 'critical' || v.impact === 'serious'
      );
      expect(criticalViolations.length).toBe(0);
    }
  });
});
