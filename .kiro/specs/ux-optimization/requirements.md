# Requirements Document

## Introduction

This document defines the requirements for optimizing the FinCalc calculator pages UX, inspired by TableConvert's successful design pattern (324K monthly visits, 10:51 average session duration). The goal is to transform all calculator pages from a content-heavy, scroll-required layout to a tool-first, side-by-side layout where users can immediately interact with the calculator without scrolling.

## Glossary

- **Calculator_Page**: An HTML page containing a financial calculator tool
- **Tool_Layout**: The new side-by-side layout with input panel on left and output panel on right
- **Input_Panel**: The left panel containing form inputs for calculator parameters
- **Output_Panel**: The right panel displaying calculation results, charts, and tables
- **Info_Sidebar**: A slide-out panel containing educational content, tips, and related articles
- **Quick_Links**: A compact section with links to related calculators
- **Amortization_Table**: A table showing payment breakdown over time

## Requirements

### Requirement 1: Tool-First Layout

**User Story:** As a user, I want to see and use the calculator immediately when I open the page, so that I can get my calculations done without scrolling.

#### Acceptance Criteria

1. WHEN a user opens a calculator page, THE Calculator_Page SHALL display the calculator tool in the viewport without requiring scrolling
2. THE Tool_Layout SHALL use a side-by-side grid layout with Input_Panel on the left and Output_Panel on the right
3. WHILE the viewport width is greater than 900px, THE Tool_Layout SHALL maintain the two-column layout
4. WHILE the viewport width is 900px or less, THE Tool_Layout SHALL stack panels vertically (input above output)
5. THE Calculator_Page SHALL have a compact header with logo, calculator title, and navigation links

### Requirement 2: Input Panel Design

**User Story:** As a user, I want a clean and organized input form, so that I can quickly enter my calculation parameters.

#### Acceptance Criteria

1. THE Input_Panel SHALL display a panel header with an icon and descriptive title
2. THE Input_Panel SHALL organize form inputs in a two-column grid where appropriate
3. THE Input_Panel SHALL include input groups with currency/percentage symbols as prefixes
4. WHEN a user changes any input value, THE Calculator_Page SHALL automatically recalculate results without requiring a button click
5. THE Input_Panel SHALL include a Quick_Links section at the bottom with links to related calculators

### Requirement 3: Output Panel Design

**User Story:** As a user, I want to see my calculation results clearly and explore different views of the data, so that I can understand my financial situation.

#### Acceptance Criteria

1. THE Output_Panel SHALL display the primary result (e.g., monthly payment) prominently at the top with large typography
2. THE Output_Panel SHALL display secondary results in a grid of result cards
3. THE Output_Panel SHALL include tab navigation for different output views (e.g., Amortization, Chart, Breakdown)
4. WHEN a user clicks a tab, THE Output_Panel SHALL switch to display the corresponding content
5. THE Output_Panel SHALL include a scrollable content area for tables and detailed data

### Requirement 4: Info Sidebar (Extended Reading)

**User Story:** As a user, I want to access educational content and tips without cluttering the main calculator interface, so that I can learn more when I choose to.

#### Acceptance Criteria

1. THE Calculator_Page SHALL include an Info_Sidebar that is hidden by default
2. WHEN a user clicks the info toggle button, THE Info_Sidebar SHALL slide in from the right side
3. THE Info_Sidebar SHALL contain the educational content previously shown in the article section (how-to guides, tips, FAQs)
4. THE Info_Sidebar SHALL contain links to related blog articles
5. THE Info_Sidebar SHALL contain policy links and external resources
6. WHEN a user clicks outside the Info_Sidebar or clicks a close button, THE Info_Sidebar SHALL close
7. THE Info_Sidebar SHALL be scrollable if content exceeds viewport height

### Requirement 5: Preserve SEO and Accessibility

**User Story:** As a site owner, I want to maintain SEO value and accessibility compliance, so that the site continues to rank well and serves all users.

#### Acceptance Criteria

1. THE Calculator_Page SHALL preserve all existing structured data (JSON-LD schemas)
2. THE Calculator_Page SHALL preserve all meta tags (title, description, canonical, Open Graph)
3. THE Calculator_Page SHALL maintain keyboard navigation support
4. THE Calculator_Page SHALL include proper ARIA labels for interactive elements
5. THE Calculator_Page SHALL preserve the skip-to-content link for screen readers
6. THE Info_Sidebar content SHALL be accessible to search engine crawlers

### Requirement 6: Consistent Migration

**User Story:** As a developer, I want all calculators to follow the same layout pattern, so that the site has a consistent user experience.

#### Acceptance Criteria

1. THE Migration SHALL convert all 20 calculator pages to the new Tool_Layout
2. WHEN migrating a calculator, THE Migration SHALL preserve all existing JavaScript functionality
3. WHEN migrating a calculator, THE Migration SHALL preserve all i18n data attributes
4. WHEN migrating a calculator, THE Migration SHALL preserve all analytics tracking
5. THE Migration SHALL update the CSS file (calc-layout.css) to include Info_Sidebar styles
6. THE Migration SHALL be performed incrementally with testing after each batch

### Requirement 7: Mobile Responsiveness

**User Story:** As a mobile user, I want the calculator to work well on my phone, so that I can use it on the go.

#### Acceptance Criteria

1. WHILE on mobile viewport, THE Tool_Layout SHALL stack Input_Panel above Output_Panel
2. WHILE on mobile viewport, THE Info_Sidebar SHALL slide in as a full-width overlay
3. WHILE on mobile viewport, THE Quick_Links SHALL wrap to multiple rows if needed
4. THE Calculator_Page SHALL maintain touch-friendly tap targets (minimum 44x44px)

## Calculator Pages to Migrate

1. mortgage.html (reference: mortgage-new.html exists as template)
2. 401k.html
3. auto-loan.html
4. compound-interest.html
5. debt-payoff.html
6. emergency-fund.html
7. home-affordability.html
8. inflation.html
9. investment-return.html
10. loan-payoff.html
11. refinance.html
12. rent-vs-buy.html
13. retirement.html
14. roth-vs-traditional.html
15. salary.html
16. savings-goal.html
17. self-employment-tax.html
18. social-security.html
19. student-loan.html
20. take-home-pay.html
