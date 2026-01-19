# Design Document

## Overview

This design document outlines the technical approach for transforming FinCalc's calculator pages from a traditional content-heavy layout to a tool-first, side-by-side layout inspired by TableConvert. The new design prioritizes immediate tool access while preserving educational content in an expandable sidebar.

## Architecture

The migration follows a component-based approach where each calculator page shares common layout components:

```
┌─────────────────────────────────────────────────────────────────┐
│  Compact Header (logo | title | nav)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────┐ │
│  │   Input Panel       │  │   Output Panel      │  │ Info    │ │
│  │   - Form inputs     │  │   - Main result     │  │ Sidebar │ │
│  │   - Quick links     │  │   - Result grid     │  │ (hidden)│ │
│  │                     │  │   - Tabs            │  │         │ │
│  │                     │  │   - Content area    │  │         │ │
│  └─────────────────────┘  └─────────────────────┘  └─────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### File Structure

```
css/
  calc-layout.css      # New layout styles (update with sidebar)
  
calculators/
  [calculator].html    # Each calculator page (20 files to migrate)
  
js/
  [calculator].js      # Existing calculator logic (preserve)
  info-sidebar.js      # New: Sidebar toggle functionality
```

## Components and Interfaces

### 1. Compact Header Component

```html
<header class="calc-header">
    <a href="../" class="logo">FinCalc</a>
    <h1 class="calc-title">[Calculator Name]</h1>
    <nav class="calc-nav">
        <a href="../#calculators">All Calculators</a>
        <button class="info-toggle" aria-label="Show information">
            <svg><!-- info icon --></svg>
        </button>
        <div class="nav-controls"><!-- theme/language --></div>
    </nav>
</header>
```

### 2. Tool Layout Container

```html
<main class="calc-tool-layout">
    <div class="calc-input-panel">...</div>
    <div class="calc-output-panel">...</div>
</main>
```

### 3. Input Panel Structure

```html
<div class="calc-input-panel">
    <div class="calc-panel-header">
        <div class="calc-panel-title">
            <svg><!-- icon --></svg>
            <span>[Section Title]</span>
        </div>
    </div>
    <div class="calc-panel-body">
        <form id="[calculator]Form" class="calc-form">
            <!-- Form rows with 2-column grid -->
            <div class="form-row">
                <div class="form-group">...</div>
                <div class="form-group">...</div>
            </div>
            <button type="submit" class="btn">Calculate</button>
        </form>
    </div>
    <div class="calc-quick-links">
        <a href="..." class="calc-quick-link">🔗 Related Calc</a>
    </div>
</div>
```

### 4. Output Panel Structure

```html
<div class="calc-output-panel">
    <div class="calc-result-main">
        <div class="big-number" id="mainResult">$0</div>
        <div class="label">[Primary Result Label]</div>
    </div>
    <div class="calc-result-grid">
        <div class="calc-result-item">
            <div class="value" id="result1">$0</div>
            <div class="label">[Label]</div>
        </div>
        <!-- More result items -->
    </div>
    <div class="calc-output-tabs">
        <button class="calc-output-tab active" data-tab="tab1">Tab 1</button>
        <button class="calc-output-tab" data-tab="tab2">Tab 2</button>
    </div>
    <div class="calc-output-content" id="outputContent">
        <!-- Tab content -->
    </div>
</div>
```

### 5. Info Sidebar Structure

```html
<aside class="info-sidebar" id="infoSidebar" aria-hidden="true">
    <div class="info-sidebar-header">
        <h2>About This Calculator</h2>
        <button class="info-sidebar-close" aria-label="Close">×</button>
    </div>
    <div class="info-sidebar-content">
        <!-- How to use section -->
        <section class="info-section">
            <h3>How to Use</h3>
            <p>...</p>
        </section>
        
        <!-- Tips section -->
        <section class="info-section">
            <h3>Tips</h3>
            <ul>...</ul>
        </section>
        
        <!-- FAQ section -->
        <section class="info-section">
            <h3>FAQ</h3>
            <div class="faq-item">...</div>
        </section>
        
        <!-- Related articles -->
        <section class="info-section">
            <h3>Related Articles</h3>
            <ul class="related-links">...</ul>
        </section>
        
        <!-- Policy links -->
        <section class="info-section">
            <h3>Resources</h3>
            <div class="policy-grid">...</div>
        </section>
    </div>
</aside>
<div class="info-sidebar-overlay" id="sidebarOverlay"></div>
```

## Data Models

### Calculator Configuration Object

Each calculator maintains its configuration for migration:

```javascript
const calculatorConfig = {
    id: 'mortgage',
    title: 'Mortgage Calculator',
    icon: 'home',
    primaryResult: {
        id: 'monthlyPayment',
        label: 'Monthly Payment',
        format: 'currency'
    },
    secondaryResults: [
        { id: 'loanAmount', label: 'Loan Amount', format: 'currency' },
        { id: 'totalInterest', label: 'Total Interest', format: 'currency' },
        { id: 'totalCost', label: 'Total Cost', format: 'currency' },
        { id: 'payoffDate', label: 'Payoff Date', format: 'date', highlight: true }
    ],
    tabs: ['schedule', 'chart', 'breakdown'],
    quickLinks: [
        { href: 'refinance.html', icon: '🔄', label: 'Refinance' },
        { href: 'home-affordability.html', icon: '💵', label: 'Affordability' }
    ]
};
```

### Sidebar Content Structure

```javascript
const sidebarContent = {
    howToUse: {
        title: 'How to Use This Calculator',
        content: '...'
    },
    tips: [
        'Tip 1...',
        'Tip 2...'
    ],
    faq: [
        { question: '...', answer: '...' }
    ],
    relatedArticles: [
        { href: '...', title: '...' }
    ],
    policyLinks: [
        { href: '...', title: '...' }
    ]
};
```



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Calculator Visible Without Scrolling

*For any* calculator page loaded at desktop viewport (>900px), the calculator input panel and output panel SHALL be fully visible within the initial viewport without requiring scrolling.

**Validates: Requirements 1.1**

### Property 2: Responsive Layout Adaptation

*For any* calculator page and *for any* viewport width, the layout SHALL correctly adapt:
- When viewport > 900px: two-column side-by-side layout
- When viewport ≤ 900px: single-column stacked layout with input above output
- Sidebar SHALL be full-width overlay on mobile

**Validates: Requirements 1.3, 1.4, 7.1, 7.2**

### Property 3: Auto-Calculation on Input Change

*For any* calculator page and *for any* valid input change, the output results SHALL update automatically without requiring a button click, and the calculation logic SHALL produce the same results as the original calculator.

**Validates: Requirements 2.4, 6.2**

### Property 4: Tab Switching Functionality

*For any* calculator page with multiple output tabs, clicking a tab SHALL:
- Set that tab to active state
- Display the corresponding content
- Hide other tab contents

**Validates: Requirements 3.4**

### Property 5: Sidebar Toggle Behavior

*For any* calculator page:
- Clicking the info toggle button SHALL open the sidebar
- Clicking the close button or overlay SHALL close the sidebar
- Sidebar state SHALL toggle correctly between open and closed

**Validates: Requirements 4.2, 4.6**

### Property 6: Content Preservation

*For any* migrated calculator page, the following content SHALL be preserved:
- All JSON-LD structured data schemas
- All meta tags (title, description, canonical, Open Graph)
- All data-i18n attributes for internationalization

**Validates: Requirements 5.1, 5.2, 6.3**

### Property 7: Keyboard Navigation

*For any* calculator page, all interactive elements (inputs, buttons, tabs, links) SHALL be reachable and operable via keyboard navigation (Tab, Enter, Escape keys).

**Validates: Requirements 5.3**

### Property 8: ARIA Labels Present

*For any* interactive element in the calculator page (buttons, toggles, sidebar), appropriate ARIA labels or roles SHALL be present for screen reader accessibility.

**Validates: Requirements 5.4**

### Property 9: Migration Completeness

*For all* 20 calculator pages, each page SHALL have the `.calc-tool-layout` class applied and follow the new layout structure.

**Validates: Requirements 6.1**

### Property 10: Touch Target Size

*For any* interactive element (button, link, input) on the calculator page, the element SHALL have a minimum tap target size of 44x44 pixels for touch accessibility.

**Validates: Requirements 7.4**

## Error Handling

### Input Validation
- Invalid numeric inputs (negative values, non-numbers) SHALL be handled gracefully
- Form validation SHALL prevent calculation with invalid inputs
- Error messages SHALL be displayed inline near the relevant input

### Sidebar Errors
- If sidebar content fails to load, the sidebar SHALL display a fallback message
- Sidebar toggle SHALL work even if content is empty

### Responsive Fallbacks
- If CSS grid is not supported, layout SHALL fall back to flexbox
- If JavaScript fails, calculator form SHALL still be submittable

## Testing Strategy

### Unit Tests
Unit tests will verify specific examples and edge cases:
- DOM structure verification for each component
- CSS class presence verification
- Initial state verification (sidebar closed, default values)
- Analytics script presence

### Property-Based Tests
Property-based tests will verify universal properties across all inputs:
- Use Playwright for browser-based testing
- Test responsive behavior at multiple viewport widths
- Test keyboard navigation sequences
- Test sidebar toggle sequences
- Minimum 100 iterations per property test

### Test Configuration
- Framework: Playwright (for browser-based UI testing)
- Property testing: Use fast-check for generating test inputs
- Each property test tagged with: **Feature: ux-optimization, Property {number}: {property_text}**

### Migration Testing Approach
Testing will be performed in batches:
1. **Batch 1**: CSS updates + mortgage.html (template validation)
2. **Batch 2**: Home-related calculators (refinance, home-affordability, rent-vs-buy)
3. **Batch 3**: Loan calculators (auto-loan, loan-payoff, student-loan, debt-payoff)
4. **Batch 4**: Investment calculators (401k, retirement, roth-vs-traditional, compound-interest, investment-return)
5. **Batch 5**: Income calculators (salary, take-home-pay, self-employment-tax, social-security)
6. **Batch 6**: Remaining calculators (emergency-fund, savings-goal, inflation)

After each batch:
- Visual inspection of layout
- Functional testing of calculations
- Responsive testing at 320px, 768px, 1024px, 1440px viewports
- Accessibility audit with axe-core
