const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

// All 20 calculators to test
const calculators = [
  '401k',
  'auto-loan',
  'compound-interest',
  'debt-payoff',
  'emergency-fund',
  'home-affordability',
  'inflation',
  'investment-return',
  'loan-payoff',
  'mortgage',
  'refinance',
  'rent-vs-buy',
  'retirement',
  'roth-vs-traditional',
  'salary',
  'savings-goal',
  'self-employment-tax',
  'social-security',
  'student-loan',
  'take-home-pay'
];

// Viewport sizes for responsive testing
const viewports = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1440, height: 900 }
};

test.describe('UX Optimization - Full Regression Test', () => {
  
  test.describe('Property 1: Calculator Visible Without Scrolling', () => {
    for (const calc of calculators) {
      test(`${calc} - calculator visible in viewport at desktop`, async ({ page }) => {
        await page.setViewportSize(viewports.desktop);
        await page.goto(`/calculators/${calc}.html`);
        
        // Check that calc-tool-layout exists
        const layout = page.locator('.calc-tool-layout');
        await expect(layout).toBeVisible();
        
        // Check input panel is visible
        const inputPanel = page.locator('.calc-input-panel');
        await expect(inputPanel).toBeInViewport();
        
        // Check output panel is visible
        const outputPanel = page.locator('.calc-output-panel');
        await expect(outputPanel).toBeInViewport();
      });
    }
  });

  test.describe('Property 2: Responsive Layout Adaptation', () => {
    for (const calc of calculators) {
      test(`${calc} - desktop layout (>900px)`, async ({ page }) => {
        await page.setViewportSize(viewports.desktop);
        await page.goto(`/calculators/${calc}.html`);
        
        const layout = page.locator('.calc-tool-layout');
        await expect(layout).toBeVisible();
        
        // Check side-by-side layout
        const inputPanel = page.locator('.calc-input-panel');
        const outputPanel = page.locator('.calc-output-panel');
        
        const inputBox = await inputPanel.boundingBox();
        const outputBox = await outputPanel.boundingBox();
        
        // Input should be on the left, output on the right
        expect(inputBox.x).toBeLessThan(outputBox.x);
      });

      test(`${calc} - mobile layout (≤900px)`, async ({ page }) => {
        await page.setViewportSize(viewports.mobile);
        await page.goto(`/calculators/${calc}.html`);
        
        const layout = page.locator('.calc-tool-layout');
        await expect(layout).toBeVisible();
        
        // Check stacked layout
        const inputPanel = page.locator('.calc-input-panel');
        const outputPanel = page.locator('.calc-output-panel');
        
        const inputBox = await inputPanel.boundingBox();
        const outputBox = await outputPanel.boundingBox();
        
        // Input should be above output (smaller Y coordinate)
        expect(inputBox.y).toBeLessThan(outputBox.y);
      });
    }
  });

  test.describe('Property 5: Sidebar Toggle Behavior', () => {
    for (const calc of calculators) {
      test(`${calc} - sidebar opens and closes`, async ({ page }) => {
        await page.goto(`/calculators/${calc}.html`);
        
        const sidebar = page.locator('.info-sidebar');
        const toggleButton = page.locator('.info-toggle');
        const overlay = page.locator('.info-sidebar-overlay');
        
        // Sidebar should be hidden initially
        await expect(sidebar).toHaveAttribute('aria-hidden', 'true');
        
        // Click toggle button to open
        await toggleButton.click();
        await expect(sidebar).toHaveAttribute('aria-hidden', 'false');
        await expect(sidebar).toBeVisible();
        
        // Click overlay to close
        await overlay.click();
        await expect(sidebar).toHaveAttribute('aria-hidden', 'true');
        
        // Open again
        await toggleButton.click();
        await expect(sidebar).toHaveAttribute('aria-hidden', 'false');
        
        // Click close button
        const closeButton = page.locator('.info-sidebar-close');
        await closeButton.click();
        await expect(sidebar).toHaveAttribute('aria-hidden', 'true');
      });

      test(`${calc} - sidebar closes on Escape key`, async ({ page }) => {
        await page.goto(`/calculators/${calc}.html`);
        
        const sidebar = page.locator('.info-sidebar');
        const toggleButton = page.locator('.info-toggle');
        
        // Open sidebar
        await toggleButton.click();
        await expect(sidebar).toHaveAttribute('aria-hidden', 'false');
        
        // Press Escape
        await page.keyboard.press('Escape');
        await expect(sidebar).toHaveAttribute('aria-hidden', 'true');
      });
    }
  });

  test.describe('Property 6: Content Preservation', () => {
    for (const calc of calculators) {
      test(`${calc} - SEO elements preserved`, async ({ page }) => {
        await page.goto(`/calculators/${calc}.html`);
        
        // Check for JSON-LD structured data
        const jsonLd = page.locator('script[type="application/ld+json"]');
        await expect(jsonLd.first()).toBeAttached();
        
        // Check meta tags
        const metaDescription = page.locator('meta[name="description"]');
        await expect(metaDescription).toBeAttached();
        
        const ogTitle = page.locator('meta[property="og:title"]');
        await expect(ogTitle).toBeAttached();
        
        // Check canonical link
        const canonical = page.locator('link[rel="canonical"]');
        await expect(canonical).toBeAttached();
      });

      test(`${calc} - i18n attributes preserved`, async ({ page }) => {
        await page.goto(`/calculators/${calc}.html`);
        
        // Check for data-i18n attributes
        const i18nElements = page.locator('[data-i18n]');
        const count = await i18nElements.count();
        expect(count).toBeGreaterThan(0);
      });
    }
  });

  test.describe('Property 7: Keyboard Navigation', () => {
    for (const calc of calculators) {
      test(`${calc} - keyboard navigation works`, async ({ page }) => {
        await page.goto(`/calculators/${calc}.html`);
        
        // Tab through interactive elements
        await page.keyboard.press('Tab');
        
        // Check that focus is on an interactive element
        const focusedElement = await page.evaluate(() => {
          const el = document.activeElement;
          return {
            tagName: el.tagName,
            type: el.type,
            role: el.getAttribute('role')
          };
        });
        
        expect(['INPUT', 'BUTTON', 'A', 'SELECT']).toContain(focusedElement.tagName);
      });
    }
  });

  test.describe('Property 8: ARIA Labels Present', () => {
    for (const calc of calculators) {
      test(`${calc} - ARIA labels on interactive elements`, async ({ page }) => {
        await page.goto(`/calculators/${calc}.html`);
        
        // Check info toggle button has aria-label
        const toggleButton = page.locator('.info-toggle');
        await expect(toggleButton).toHaveAttribute('aria-label');
        
        // Check sidebar has aria-hidden
        const sidebar = page.locator('.info-sidebar');
        await expect(sidebar).toHaveAttribute('aria-hidden');
        
        // Check close button has aria-label
        const closeButton = page.locator('.info-sidebar-close');
        await expect(closeButton).toHaveAttribute('aria-label');
      });
    }
  });

  test.describe('Property 9: Migration Completeness', () => {
    test('all 20 calculators have new layout', async ({ page }) => {
      const results = [];
      
      for (const calc of calculators) {
        await page.goto(`/calculators/${calc}.html`);
        
        const hasLayout = await page.locator('.calc-tool-layout').count() > 0;
        const hasSidebar = await page.locator('.info-sidebar').count() > 0;
        
        results.push({
          calculator: calc,
          hasLayout,
          hasSidebar
        });
      }
      
      // All should have the new layout
      const allMigrated = results.every(r => r.hasLayout && r.hasSidebar);
      expect(allMigrated).toBe(true);
      
      // Log any failures
      const failures = results.filter(r => !r.hasLayout || !r.hasSidebar);
      if (failures.length > 0) {
        console.log('Failed migrations:', failures);
      }
    });
  });

  test.describe('Property 10: Touch Target Size', () => {
    for (const calc of calculators) {
      test(`${calc} - buttons have minimum 44x44px tap targets`, async ({ page }) => {
        await page.setViewportSize(viewports.mobile);
        await page.goto(`/calculators/${calc}.html`);
        
        // Check info toggle button
        const toggleButton = page.locator('.info-toggle');
        const toggleBox = await toggleButton.boundingBox();
        expect(toggleBox.width).toBeGreaterThanOrEqual(44);
        expect(toggleBox.height).toBeGreaterThanOrEqual(44);
        
        // Check close button
        const closeButton = page.locator('.info-sidebar-close');
        const closeBox = await closeButton.boundingBox();
        expect(closeBox.width).toBeGreaterThanOrEqual(44);
        expect(closeBox.height).toBeGreaterThanOrEqual(44);
      });
    }
  });

  test.describe('Accessibility Audit', () => {
    for (const calc of calculators) {
      test(`${calc} - axe accessibility scan`, async ({ page }) => {
        await page.goto(`/calculators/${calc}.html`);
        
        const accessibilityScanResults = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .analyze();
        
        expect(accessibilityScanResults.violations).toEqual([]);
      });
    }
  });

  test.describe('Cross-Browser Compatibility', () => {
    // These tests will run across all browsers defined in playwright.config.js
    test('mortgage calculator works in all browsers', async ({ page, browserName }) => {
      await page.goto('/calculators/mortgage.html');
      
      const layout = page.locator('.calc-tool-layout');
      await expect(layout).toBeVisible();
      
      const sidebar = page.locator('.info-sidebar');
      await expect(sidebar).toBeAttached();
      
      console.log(`✓ Mortgage calculator works in ${browserName}`);
    });
  });

  test.describe('Mobile Device Testing', () => {
    test('calculators work on mobile devices', async ({ page }) => {
      // Test on mobile viewport
      await page.setViewportSize(viewports.mobile);
      
      // Test a sample of calculators
      const sampleCalcs = ['mortgage', '401k', 'student-loan', 'retirement'];
      
      for (const calc of sampleCalcs) {
        await page.goto(`/calculators/${calc}.html`);
        
        // Check layout is visible
        const layout = page.locator('.calc-tool-layout');
        await expect(layout).toBeVisible();
        
        // Check sidebar is full-width on mobile
        const toggleButton = page.locator('.info-toggle');
        await toggleButton.click();
        
        const sidebar = page.locator('.info-sidebar');
        const sidebarBox = await sidebar.boundingBox();
        
        // Sidebar should be close to full viewport width on mobile
        expect(sidebarBox.width).toBeGreaterThan(viewports.mobile.width * 0.8);
      }
    });
  });
});
