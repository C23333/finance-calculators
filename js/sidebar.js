/**
 * Sidebar Navigation for Calculator Pages
 * Dynamically generates sidebar, breadcrumb, and related calculators
 */

// Calculator data with categories and relations
const CALCULATORS = {
    // Home & Mortgage
    'mortgage': { title: 'Mortgage Calculator', emoji: '🏠', category: 'homeMortgage', categoryTitle: 'Home & Mortgage' },
    'refinance': { title: 'Refinance Calculator', emoji: '🔄', category: 'homeMortgage', categoryTitle: 'Home & Mortgage' },
    'rent-vs-buy': { title: 'Rent vs Buy', emoji: '🏘️', category: 'homeMortgage', categoryTitle: 'Home & Mortgage' },
    'home-affordability': { title: 'Home Affordability', emoji: '💵', category: 'homeMortgage', categoryTitle: 'Home & Mortgage' },
    
    // Loans & Debt
    'loan-payoff': { title: 'Loan Payoff', emoji: '💳', category: 'loansDebt', categoryTitle: 'Loans & Debt' },
    'debt-payoff': { title: 'Debt Payoff Planner', emoji: '📊', category: 'loansDebt', categoryTitle: 'Loans & Debt' },
    'auto-loan': { title: 'Auto Loan', emoji: '🚗', category: 'loansDebt', categoryTitle: 'Loans & Debt' },
    'student-loan': { title: 'Student Loan', emoji: '🎓', category: 'loansDebt', categoryTitle: 'Loans & Debt' },
    
    // Savings & Investment
    'compound-interest': { title: 'Compound Interest', emoji: '📈', category: 'savingsInvestment', categoryTitle: 'Savings & Investment' },
    'investment-return': { title: 'Investment Return', emoji: '💰', category: 'savingsInvestment', categoryTitle: 'Savings & Investment' },
    'savings-goal': { title: 'Savings Goal', emoji: '🎯', category: 'savingsInvestment', categoryTitle: 'Savings & Investment' },
    'emergency-fund': { title: 'Emergency Fund', emoji: '🛡️', category: 'savingsInvestment', categoryTitle: 'Savings & Investment' },
    
    // Retirement
    'retirement': { title: 'Retirement Calculator', emoji: '🏖️', category: 'retirement', categoryTitle: 'Retirement' },
    '401k': { title: '401(k) Calculator', emoji: '📋', category: 'retirement', categoryTitle: 'Retirement' },
    'social-security': { title: 'Social Security', emoji: '🏛️', category: 'retirement', categoryTitle: 'Retirement' },
    'roth-vs-traditional': { title: 'Roth vs Traditional', emoji: '⚖️', category: 'retirement', categoryTitle: 'Retirement' },
    
    // Tax & Income
    'salary': { title: 'Salary Calculator', emoji: '💼', category: 'taxIncome', categoryTitle: 'Tax & Income' },
    'take-home-pay': { title: 'Take-Home Pay', emoji: '🧾', category: 'taxIncome', categoryTitle: 'Tax & Income' },
    'self-employment-tax': { title: 'Self-Employment Tax', emoji: '📝', category: 'taxIncome', categoryTitle: 'Tax & Income' },
    'inflation': { title: 'Inflation Calculator', emoji: '📉', category: 'taxIncome', categoryTitle: 'Tax & Income' },
};

// Related calculators mapping
const RELATED_CALCULATORS = {
    'mortgage': ['refinance', 'home-affordability', 'rent-vs-buy', 'loan-payoff'],
    'refinance': ['mortgage', 'home-affordability', 'loan-payoff', 'savings-goal'],
    'rent-vs-buy': ['mortgage', 'home-affordability', 'savings-goal', 'investment-return'],
    'home-affordability': ['mortgage', 'rent-vs-buy', 'salary', 'debt-payoff'],
    
    'loan-payoff': ['debt-payoff', 'mortgage', 'auto-loan', 'student-loan'],
    'debt-payoff': ['loan-payoff', 'savings-goal', 'emergency-fund', 'salary'],
    'auto-loan': ['loan-payoff', 'salary', 'take-home-pay', 'savings-goal'],
    'student-loan': ['loan-payoff', 'debt-payoff', 'salary', 'take-home-pay'],
    
    'compound-interest': ['investment-return', 'savings-goal', 'retirement', '401k'],
    'investment-return': ['compound-interest', 'retirement', '401k', 'roth-vs-traditional'],
    'savings-goal': ['compound-interest', 'emergency-fund', 'retirement', 'salary'],
    'emergency-fund': ['savings-goal', 'salary', 'take-home-pay', 'debt-payoff'],
    
    'retirement': ['401k', 'social-security', 'roth-vs-traditional', 'compound-interest'],
    '401k': ['retirement', 'roth-vs-traditional', 'salary', 'compound-interest'],
    'social-security': ['retirement', '401k', 'inflation', 'savings-goal'],
    'roth-vs-traditional': ['401k', 'retirement', 'investment-return', 'compound-interest'],
    
    'salary': ['take-home-pay', 'self-employment-tax', 'home-affordability', 'savings-goal'],
    'take-home-pay': ['salary', 'self-employment-tax', 'debt-payoff', 'savings-goal'],
    'self-employment-tax': ['salary', 'take-home-pay', 'retirement', '401k'],
    'inflation': ['compound-interest', 'investment-return', 'retirement', 'savings-goal'],
};

// Category order for sidebar
const CATEGORY_ORDER = ['homeMortgage', 'loansDebt', 'savingsInvestment', 'retirement', 'taxIncome'];

/**
 * Get current calculator ID from URL
 */
function getCurrentCalculatorId() {
    const path = window.location.pathname;
    const match = path.match(/calculators\/([^.]+)\.html/);
    return match ? match[1] : null;
}

/**
 * Generate sidebar HTML
 */
function generateSidebarHTML(currentId) {
    const categories = {};
    
    // Group calculators by category
    for (const [id, calc] of Object.entries(CALCULATORS)) {
        if (!categories[calc.category]) {
            categories[calc.category] = {
                title: calc.categoryTitle,
                items: []
            };
        }
        categories[calc.category].items.push({ id, ...calc });
    }
    
    let html = `
        <aside class="calc-sidebar">
            <div class="calc-sidebar-inner">
                <div class="sidebar-header">
                    <a href="../">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                        All Calculators
                    </a>
                </div>
    `;
    
    for (const categoryKey of CATEGORY_ORDER) {
        const category = categories[categoryKey];
        if (!category) continue;
        
        html += `
            <div class="sidebar-category">
                <div class="sidebar-category-title">${category.title}</div>
                <ul class="sidebar-links">
        `;
        
        for (const item of category.items) {
            const isActive = item.id === currentId ? ' class="active"' : '';
            html += `
                <li><a href="${item.id}.html"${isActive}><span class="calc-emoji">${item.emoji}</span> ${item.title.replace(' Calculator', '')}</a></li>
            `;
        }
        
        html += `
                </ul>
            </div>
        `;
    }
    
    html += `
            </div>
        </aside>
    `;
    
    return html;
}

/**
 * Generate breadcrumb HTML
 */
function generateBreadcrumbHTML(currentId) {
    const calc = CALCULATORS[currentId];
    if (!calc) return '';
    
    return `
        <nav class="breadcrumb-enhanced">
            <a href="../">Home</a>
            <span class="separator">/</span>
            <a href="../#calculators">${calc.categoryTitle}</a>
            <span class="separator">/</span>
            <span class="current">${calc.title}</span>
        </nav>
    `;
}

/**
 * Generate related calculators HTML
 */
function generateRelatedHTML(currentId) {
    const relatedIds = RELATED_CALCULATORS[currentId];
    if (!relatedIds || relatedIds.length === 0) return '';
    
    let html = `
        <div class="related-calculators">
            <h3>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="14" rx="1"></rect><rect width="7" height="7" x="3" y="14" rx="1"></rect></svg>
                Related Calculators
            </h3>
            <div class="related-grid">
    `;
    
    for (const id of relatedIds) {
        const calc = CALCULATORS[id];
        if (!calc) continue;
        
        html += `
            <a href="${id}.html" class="related-item">
                <span class="emoji">${calc.emoji}</span>
                <div class="info">
                    <div class="title">${calc.title}</div>
                    <div class="desc">${calc.categoryTitle}</div>
                </div>
            </a>
        `;
    }
    
    html += `
            </div>
        </div>
    `;
    
    return html;
}

/**
 * Initialize sidebar on page load
 */
function initSidebar() {
    const currentId = getCurrentCalculatorId();
    if (!currentId) return;
    
    // Find the main content area
    const calcPage = document.querySelector('.calc-page');
    if (!calcPage) return;
    
    // Check if already has sidebar layout
    if (calcPage.classList.contains('calc-page-with-sidebar')) return;
    
    // Get the calc-container
    const calcContainer = calcPage.querySelector('.calc-container');
    if (!calcContainer) return;
    
    // Create new layout structure
    calcPage.classList.remove('calc-page');
    calcPage.classList.add('calc-page-with-sidebar');
    
    // Generate and insert sidebar
    const sidebarHTML = generateSidebarHTML(currentId);
    calcPage.insertAdjacentHTML('afterbegin', sidebarHTML);
    
    // Wrap existing content in main content div
    const mainContent = document.createElement('div');
    mainContent.className = 'calc-main-content';
    
    // Move calc-container into main content
    mainContent.appendChild(calcContainer);
    calcPage.appendChild(mainContent);
    
    // Update breadcrumb
    const oldBreadcrumb = calcContainer.querySelector('.breadcrumb');
    if (oldBreadcrumb) {
        oldBreadcrumb.outerHTML = generateBreadcrumbHTML(currentId);
    }
    
    // Add related calculators after the calculator content
    const content = calcContainer.querySelector('.content');
    if (content) {
        content.insertAdjacentHTML('afterend', generateRelatedHTML(currentId));
    } else {
        // If no content section, add after calculator
        const calculator = calcContainer.querySelector('.calculator');
        if (calculator) {
            calculator.insertAdjacentHTML('afterend', generateRelatedHTML(currentId));
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSidebar);
} else {
    initSidebar();
}
