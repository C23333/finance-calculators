/**
 * Finance Calculator Utilities
 * Shared functions for all calculators
 */

// Format currency with locale support
function formatCurrency(amount, decimals = 0) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(amount);
}

// Format percentage
function formatPercent(value, decimals = 1) {
    return value.toFixed(decimals) + '%';
}

// Format number with commas
function formatNumber(num, decimals = 0) {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(num);
}

// Parse currency input (removes $ and commas)
function parseCurrency(value) {
    if (typeof value === 'number') return value;
    return parseFloat(String(value).replace(/[$,]/g, '')) || 0;
}

// Validate numeric input
function validateNumber(value, min = 0, max = Infinity) {
    const num = parseFloat(value);
    if (isNaN(num)) return { valid: false, error: 'Please enter a valid number' };
    if (num < min) return { valid: false, error: `Value must be at least ${min}` };
    if (num > max) return { valid: false, error: `Value must be at most ${max}` };
    return { valid: true, value: num };
}

// Show results section with animation
function showResults(elementId = 'results') {
    const results = document.getElementById(elementId);
    if (results) {
        results.style.display = 'block';
        results.classList.add('show');
        results.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Trigger calculation complete event for monetization
function triggerCalculationComplete(calculatorName, resultsData = {}) {
    document.dispatchEvent(new CustomEvent('calculationComplete', {
        detail: { calculator: calculatorName, results: resultsData }
    }));
}

// 2026 Federal Tax Brackets (projected based on inflation adjustments)
// Source: IRS Revenue Procedure, projected for 2026
// Reference: https://www.irs.gov/newsroom/irs-provides-tax-inflation-adjustments
const FEDERAL_TAX_BRACKETS = {
    single: [
        { min: 0, max: 11925, rate: 0.10 },
        { min: 11925, max: 48475, rate: 0.12 },
        { min: 48475, max: 103350, rate: 0.22 },
        { min: 103350, max: 197300, rate: 0.24 },
        { min: 197300, max: 250525, rate: 0.32 },
        { min: 250525, max: 626350, rate: 0.35 },
        { min: 626350, max: Infinity, rate: 0.37 }
    ],
    married: [
        { min: 0, max: 23850, rate: 0.10 },
        { min: 23850, max: 96950, rate: 0.12 },
        { min: 96950, max: 206700, rate: 0.22 },
        { min: 206700, max: 394600, rate: 0.24 },
        { min: 394600, max: 501050, rate: 0.32 },
        { min: 501050, max: 751600, rate: 0.35 },
        { min: 751600, max: Infinity, rate: 0.37 }
    ],
    head: [
        { min: 0, max: 17000, rate: 0.10 },
        { min: 17000, max: 64850, rate: 0.12 },
        { min: 64850, max: 103350, rate: 0.22 },
        { min: 103350, max: 197300, rate: 0.24 },
        { min: 197300, max: 250500, rate: 0.32 },
        { min: 250500, max: 626350, rate: 0.35 },
        { min: 626350, max: Infinity, rate: 0.37 }
    ]
};

// Standard deductions for 2026 (projected)
// Source: IRS, projected based on inflation adjustments
const STANDARD_DEDUCTIONS = {
    single: 15000,
    married: 30000,
    head: 22500
};

// Calculate federal income tax
function calculateFederalIncomeTax(income, filingStatus) {
    const taxableIncome = Math.max(0, income - STANDARD_DEDUCTIONS[filingStatus]);
    const brackets = FEDERAL_TAX_BRACKETS[filingStatus];

    let tax = 0;
    for (const bracket of brackets) {
        if (taxableIncome > bracket.min) {
            const taxableInBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
            tax += taxableInBracket * bracket.rate;
        }
    }
    return tax;
}

// State tax rates (simplified flat rates for 2024)
const STATE_TAX_RATES = {
    'AL': 0.05, 'AK': 0, 'AZ': 0.025, 'AR': 0.047, 'CA': 0.0725,
    'CO': 0.044, 'CT': 0.05, 'DE': 0.066, 'FL': 0, 'GA': 0.055,
    'HI': 0.0725, 'ID': 0.058, 'IL': 0.0495, 'IN': 0.0315, 'IA': 0.057,
    'KS': 0.057, 'KY': 0.04, 'LA': 0.0425, 'ME': 0.0715, 'MD': 0.0575,
    'MA': 0.05, 'MI': 0.0425, 'MN': 0.0785, 'MS': 0.05, 'MO': 0.048,
    'MT': 0.059, 'NE': 0.0584, 'NV': 0, 'NH': 0, 'NJ': 0.0637,
    'NM': 0.049, 'NY': 0.0685, 'NC': 0.0475, 'ND': 0.0195, 'OH': 0.04,
    'OK': 0.0475, 'OR': 0.099, 'PA': 0.0307, 'RI': 0.0599, 'SC': 0.064,
    'SD': 0, 'TN': 0, 'TX': 0, 'UT': 0.0465, 'VT': 0.0875,
    'VA': 0.0575, 'WA': 0, 'WV': 0.055, 'WI': 0.0765, 'WY': 0
};

// Calculate state income tax
function calculateStateIncomeTax(income, state) {
    const rate = STATE_TAX_RATES[state] || 0.05;
    return Math.max(0, income) * rate;
}

// FICA tax constants for 2026 (projected)
// Source: Social Security Administration
// Reference: https://www.ssa.gov/oact/cola/cbb.html
const FICA = {
    socialSecurityRate: 0.062,
    socialSecurityWageBase: 176100,  // Projected for 2026
    medicareRate: 0.0145,
    additionalMedicareRate: 0.009,
    additionalMedicareThresholdSingle: 200000,
    additionalMedicareThresholdMarried: 250000
};

// 2026 Retirement Account Limits (projected)
// Source: IRS, projected based on inflation adjustments
const RETIREMENT_LIMITS_2026 = {
    // 401(k), 403(b), most 457 plans
    employee401k: 24000,
    catchUp50Plus: 7500,
    superCatchUp60to63: 11250,  // New SECURE 2.0 provision
    total401kLimit: 71000,      // Employee + Employer combined

    // IRA limits
    iraContribution: 7500,
    iraCatchUp50Plus: 1000,

    // SEP IRA
    sepIraLimit: 70000,

    // SIMPLE IRA
    simpleIraLimit: 16500,
    simpleCatchUp: 3500,

    // HSA limits
    hsaIndividual: 4400,
    hsaFamily: 8750,
    hsaCatchUp55Plus: 1000
};

// Calculate FICA taxes
function calculateFICATaxes(income, filingStatus = 'single') {
    const ssWage = Math.min(income, FICA.socialSecurityWageBase);
    const socialSecurity = ssWage * FICA.socialSecurityRate;

    let medicare = income * FICA.medicareRate;
    const threshold = filingStatus === 'married'
        ? FICA.additionalMedicareThresholdMarried
        : FICA.additionalMedicareThresholdSingle;

    if (income > threshold) {
        medicare += (income - threshold) * FICA.additionalMedicareRate;
    }

    return { socialSecurity, medicare, total: socialSecurity + medicare };
}

// Loan/Mortgage calculation utilities
function calculateMonthlyPayment(principal, annualRate, years) {
    const monthlyRate = annualRate / 12;
    const numPayments = years * 12;

    if (monthlyRate === 0) {
        return principal / numPayments;
    }

    return principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
           (Math.pow(1 + monthlyRate, numPayments) - 1);
}

// Calculate future value with compound interest
function calculateFutureValue(principal, annualRate, years, monthlyContribution = 0, compoundingPerYear = 12) {
    const periodicRate = annualRate / compoundingPerYear;
    const totalPeriods = years * compoundingPerYear;

    // Future value of principal
    const fvPrincipal = principal * Math.pow(1 + periodicRate, totalPeriods);

    // Future value of periodic contributions
    let fvContributions = 0;
    if (monthlyContribution > 0 && periodicRate > 0) {
        fvContributions = monthlyContribution *
            ((Math.pow(1 + periodicRate, totalPeriods) - 1) / periodicRate);
    } else if (monthlyContribution > 0) {
        fvContributions = monthlyContribution * totalPeriods;
    }

    return fvPrincipal + fvContributions;
}

// Calculate present value
function calculatePresentValue(futureValue, annualRate, years) {
    return futureValue / Math.pow(1 + annualRate, years);
}

// Debounce function for input handlers
function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize calculator with auto-calculate on input change
function initCalculator(formId, calculateFn) {
    const form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        calculateFn();
    });

    // Auto-calculate on input change (debounced)
    const debouncedCalculate = debounce(calculateFn, 500);
    form.querySelectorAll('input, select').forEach(input => {
        input.addEventListener('input', debouncedCalculate);
        input.addEventListener('change', debouncedCalculate);
    });

    // Calculate on page load
    document.addEventListener('DOMContentLoaded', calculateFn);
}

// Export for module usage (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatCurrency,
        formatPercent,
        formatNumber,
        parseCurrency,
        validateNumber,
        showResults,
        triggerCalculationComplete,
        calculateFederalIncomeTax,
        calculateStateIncomeTax,
        calculateFICATaxes,
        calculateMonthlyPayment,
        calculateFutureValue,
        calculatePresentValue,
        debounce,
        initCalculator,
        FEDERAL_TAX_BRACKETS,
        STANDARD_DEDUCTIONS,
        STATE_TAX_RATES,
        FICA
    };
}
