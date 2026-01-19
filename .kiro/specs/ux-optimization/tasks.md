# Implementation Plan: UX Optimization

## Overview

This implementation plan transforms all 20 FinCalc calculator pages from a content-heavy layout to a tool-first, side-by-side layout. The migration is performed in batches with testing checkpoints to ensure quality.

## Tasks

- [x] 1. Update CSS and Create Sidebar Component
  - [x] 1.1 Update calc-layout.css with Info Sidebar styles
    - Add `.info-sidebar` styles (slide-in from right, overlay)
    - Add `.info-sidebar-header`, `.info-sidebar-content` styles
    - Add `.info-sidebar-overlay` styles
    - Add responsive styles for mobile sidebar (full-width)
    - Add `.info-toggle` button styles in header
    - _Requirements: 4.1, 4.2, 4.7, 7.2_
  - [x] 1.2 Create js/info-sidebar.js for sidebar toggle functionality
    - Implement toggle open/close on button click
    - Implement close on overlay click
    - Implement close on Escape key
    - Add ARIA state management
    - _Requirements: 4.2, 4.6, 5.4_

- [x] 2. Migrate Mortgage Calculator (Template Validation)
  - [x] 2.1 Update mortgage.html to new Tool_Layout
    - Replace existing layout with calc-tool-layout structure
    - Move form to Input_Panel with calc-form class
    - Move results to Output_Panel with result grid
    - Add output tabs (Amortization, Chart, Breakdown)
    - Add Quick_Links section
    - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3_
  - [x] 2.2 Add Info Sidebar to mortgage.html
    - Create sidebar structure with educational content
    - Move "How to Use" content to sidebar
    - Move "Tips" content to sidebar
    - Move FAQ content to sidebar
    - Move related articles to sidebar
    - Move policy links to sidebar
    - Add info toggle button to header
    - _Requirements: 4.1, 4.3, 4.4, 4.5_
  - [x] 2.3 Preserve SEO elements in mortgage.html
    - Keep all JSON-LD structured data scripts
    - Keep all meta tags
    - Keep skip-to-content link
    - Verify data-i18n attributes preserved
    - _Requirements: 5.1, 5.2, 5.5, 6.3_
  - [x] 2.4 Update mortgage.js for auto-calculation
    - Add input event listeners for real-time calculation
    - Implement tab switching functionality
    - _Requirements: 2.4, 3.4_

- [x] 3. Checkpoint - Validate Template
  - Ensure mortgage.html displays correctly at all viewport sizes
  - Verify sidebar opens/closes correctly
  - Verify calculations work correctly
  - Verify SEO elements preserved
  - Ask user if questions arise

- [x] 4. Migrate Home-Related Calculators (Batch 2)
  - [x] 4.1 Migrate refinance.html to new layout
    - Apply Tool_Layout structure
    - Add Info Sidebar with content
    - Preserve SEO and i18n
    - _Requirements: 1.1, 1.2, 4.1, 5.1, 6.1_
  - [x] 4.2 Migrate home-affordability.html to new layout
    - Apply Tool_Layout structure
    - Add Info Sidebar with content
    - Preserve SEO and i18n
    - _Requirements: 1.1, 1.2, 4.1, 5.1, 6.1_
  - [x] 4.3 Migrate rent-vs-buy.html to new layout
    - Apply Tool_Layout structure
    - Add Info Sidebar with content
    - Preserve SEO and i18n
    - _Requirements: 1.1, 1.2, 4.1, 5.1, 6.1_

- [x] 5. Checkpoint - Validate Batch 2
  - Test all 4 home-related calculators
  - Verify responsive layout
  - Verify sidebar functionality
  - Ask user if questions arise

- [x] 6. Migrate Loan Calculators (Batch 3)
  - [x] 6.1 Migrate auto-loan.html to new layout
    - Apply Tool_Layout structure
    - Add Info Sidebar with content
    - Preserve SEO and i18n
    - _Requirements: 1.1, 1.2, 4.1, 5.1, 6.1_
  - [x] 6.2 Migrate loan-payoff.html to new layout
    - Apply Tool_Layout structure
    - Add Info Sidebar with content
    - Preserve SEO and i18n
    - _Requirements: 1.1, 1.2, 4.1, 5.1, 6.1_
  - [x] 6.3 Migrate student-loan.html to new layout
    - Apply Tool_Layout structure
    - Add Info Sidebar with content
    - Preserve SEO and i18n
    - _Requirements: 1.1, 1.2, 4.1, 5.1, 6.1_
  - [x] 6.4 Migrate debt-payoff.html to new layout
    - Apply Tool_Layout structure
    - Add Info Sidebar with content
    - Preserve SEO and i18n
    - _Requirements: 1.1, 1.2, 4.1, 5.1, 6.1_

- [x] 7. Checkpoint - Validate Batch 3
  - Test all 4 loan calculators
  - Verify responsive layout
  - Verify sidebar functionality
  - Ask user if questions arise

- [x] 8. Migrate Investment Calculators (Batch 4)
  - [x] 8.1 Migrate 401k.html to new layout
    - Apply Tool_Layout structure
    - Add Info Sidebar with content
    - Preserve SEO and i18n
    - _Requirements: 1.1, 1.2, 4.1, 5.1, 6.1_
  - [x] 8.2 Migrate retirement.html to new layout
    - Apply Tool_Layout structure
    - Add Info Sidebar with content
    - Preserve SEO and i18n
    - _Requirements: 1.1, 1.2, 4.1, 5.1, 6.1_
  - [x] 8.3 Migrate roth-vs-traditional.html to new layout
    - Apply Tool_Layout structure
    - Add Info Sidebar with content
    - Preserve SEO and i18n
    - _Requirements: 1.1, 1.2, 4.1, 5.1, 6.1_
  - [x] 8.4 Migrate compound-interest.html to new layout
    - Apply Tool_Layout structure
    - Add Info Sidebar with content
    - Preserve SEO and i18n
    - _Requirements: 1.1, 1.2, 4.1, 5.1, 6.1_
  - [x] 8.5 Migrate investment-return.html to new layout
    - Apply Tool_Layout structure
    - Add Info Sidebar with content
    - Preserve SEO and i18n
    - _Requirements: 1.1, 1.2, 4.1, 5.1, 6.1_

- [x] 9. Checkpoint - Validate Batch 4
  - Test all 5 investment calculators
  - Verify responsive layout
  - Verify sidebar functionality
  - Ask user if questions arise

- [x] 10. Migrate Income Calculators (Batch 5)
  - [x] 10.1 Migrate salary.html to new layout
    - Apply Tool_Layout structure
    - Add Info Sidebar with content
    - Preserve SEO and i18n
    - _Requirements: 1.1, 1.2, 4.1, 5.1, 6.1_
  - [x] 10.2 Migrate take-home-pay.html to new layout
    - Apply Tool_Layout structure
    - Add Info Sidebar with content
    - Preserve SEO and i18n
    - _Requirements: 1.1, 1.2, 4.1, 5.1, 6.1_
  - [x] 10.3 Migrate self-employment-tax.html to new layout
    - Apply Tool_Layout structure
    - Add Info Sidebar with content
    - Preserve SEO and i18n
    - _Requirements: 1.1, 1.2, 4.1, 5.1, 6.1_
  - [x] 10.4 Migrate social-security.html to new layout
    - Apply Tool_Layout structure
    - Add Info Sidebar with content
    - Preserve SEO and i18n
    - _Requirements: 1.1, 1.2, 4.1, 5.1, 6.1_

- [x] 11. Checkpoint - Validate Batch 5
  - Test all 4 income calculators
  - Verify responsive layout
  - Verify sidebar functionality
  - Ask user if questions arise

- [x] 12. Migrate Remaining Calculators (Batch 6)
  - [x] 12.1 Migrate emergency-fund.html to new layout
    - Apply Tool_Layout structure
    - Add Info Sidebar with content
    - Preserve SEO and i18n
    - _Requirements: 1.1, 1.2, 4.1, 5.1, 6.1_
  - [x] 12.2 Migrate savings-goal.html to new layout
    - Apply Tool_Layout structure
    - Add Info Sidebar with content
    - Preserve SEO and i18n
    - _Requirements: 1.1, 1.2, 4.1, 5.1, 6.1_
  - [x] 12.3 Migrate inflation.html to new layout
    - Apply Tool_Layout structure
    - Add Info Sidebar with content
    - Preserve SEO and i18n
    - _Requirements: 1.1, 1.2, 4.1, 5.1, 6.1_

- [x] 13. Checkpoint - Validate Batch 6
  - Test all 3 remaining calculators
  - Verify responsive layout
  - Verify sidebar functionality
  - Ask user if questions arise

- [x] 14. Final Cleanup
  - [x] 14.1 Remove mortgage-new.html (template file no longer needed)
    - Delete the temporary template file
    - _Requirements: 6.1_
  - [x] 14.2 Verify all 20 calculators migrated
    - Check each calculator has calc-tool-layout class
    - Check each calculator has info-sidebar
    - _Requirements: 6.1_

- [x] 15. Final Checkpoint
  - Full regression test of all calculators
  - Cross-browser testing (Chrome, Firefox, Safari, Edge)
  - Mobile device testing
  - Accessibility audit
  - Ask user for final review

## Notes

- Each calculator migration follows the same pattern established in mortgage.html
- Sidebar content is extracted from existing article sections
- All existing JavaScript functionality is preserved
- SEO elements (JSON-LD, meta tags) are kept intact
- Checkpoints allow for user review and course correction
