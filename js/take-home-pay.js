document.getElementById('takeHomePayForm').addEventListener('submit', function(e) {
    e.preventDefault();
    calculateTakeHomePay(true);
});

function calculateTakeHomePay(shouldScroll = false) {
    const grossSalary = parseFloat(document.getElementById('grossSalary').value);
    const payFrequency = document.getElementById('payFrequency').value;
    const filingStatus = document.getElementById('filingStatus').value;
    const state = document.getElementById('state').value;
    const allowances = parseInt(document.getElementById('allowances').value) || 0;
    const preTax401k = parseFloat(document.getElementById('preTax401k').value) || 0;
    const healthInsurance = parseFloat(document.getElementById('healthInsurance').value) || 0;
    const hsaContribution = parseFloat(document.getElementById('hsaContribution').value) || 0;
    const otherDeductions = parseFloat(document.getElementById('otherDeductions').value) || 0;

    // Convert to annual
    let annualGross = grossSalary;
    let periodsPerYear = 1;
    switch (payFrequency) {
        case 'weekly': periodsPerYear = 52; annualGross = grossSalary * 52; break;
        case 'biweekly': periodsPerYear = 26; annualGross = grossSalary * 26; break;
        case 'semimonthly': periodsPerYear = 24; annualGross = grossSalary * 24; break;
        case 'monthly': periodsPerYear = 12; annualGross = grossSalary * 12; break;
        case 'annual': periodsPerYear = 1; break;
    }

    // Annual pre-tax deductions
    const annual401k = preTax401k * periodsPerYear;
    const annualHealth = healthInsurance * periodsPerYear;
    const annualHSA = hsaContribution * periodsPerYear;
    const annualOther = otherDeductions * periodsPerYear;
    const totalPreTaxDeductions = annual401k + annualHealth + annualHSA + annualOther;

    // Taxable income for federal
    const federalTaxableIncome = Math.max(0, annualGross - totalPreTaxDeductions);

    // 2024 Federal Tax Brackets
    const federalTax = calculateFederalTax(federalTaxableIncome, filingStatus);

    // Social Security Tax (6.2% up to $168,600)
    const socialSecurityWage = Math.min(annualGross, 168600);
    const socialSecurityTax = socialSecurityWage * 0.062;

    // Medicare Tax (1.45% + 0.9% additional over $200k single / $250k married)
    let medicareTax = annualGross * 0.0145;
    const medicareThreshold = filingStatus === 'married' ? 250000 : 200000;
    if (annualGross > medicareThreshold) {
        medicareTax += (annualGross - medicareThreshold) * 0.009;
    }

    // State Tax (simplified - using flat rates for common states)
    const stateTax = calculateStateTax(federalTaxableIncome, state, filingStatus);

    // Total taxes
    const totalFederalTax = federalTax;
    const totalFICA = socialSecurityTax + medicareTax;
    const totalStateTax = stateTax;
    const totalTaxes = totalFederalTax + totalFICA + totalStateTax;

    // Net pay
    const annualNetPay = annualGross - totalTaxes - totalPreTaxDeductions;
    const periodNetPay = annualNetPay / periodsPerYear;

    // Effective tax rate
    const effectiveTaxRate = (totalTaxes / annualGross) * 100;

    // Display results
    document.getElementById('grossPay').textContent = formatCurrency(grossSalary);
    document.getElementById('netPay').textContent = formatCurrency(periodNetPay);
    document.getElementById('annualGross').textContent = formatCurrency(annualGross);
    document.getElementById('annualNet').textContent = formatCurrency(annualNetPay);
    document.getElementById('federalTax').textContent = formatCurrency(totalFederalTax / periodsPerYear);
    document.getElementById('stateTaxResult').textContent = formatCurrency(totalStateTax / periodsPerYear);
    document.getElementById('socialSecurity').textContent = formatCurrency(socialSecurityTax / periodsPerYear);
    document.getElementById('medicare').textContent = formatCurrency(medicareTax / periodsPerYear);
    document.getElementById('effectiveRate').textContent = effectiveTaxRate.toFixed(1) + '%';

    // Build breakdown table
    const breakdownBody = document.getElementById('breakdownBody');
    breakdownBody.innerHTML = `
        <tr>
            <td>Gross Pay</td>
            <td>${formatCurrency(grossSalary)}</td>
            <td>${formatCurrency(annualGross)}</td>
        </tr>
        <tr class="deduction">
            <td>Federal Income Tax</td>
            <td>-${formatCurrency(totalFederalTax / periodsPerYear)}</td>
            <td>-${formatCurrency(totalFederalTax)}</td>
        </tr>
        <tr class="deduction">
            <td>State Income Tax (${state})</td>
            <td>-${formatCurrency(totalStateTax / periodsPerYear)}</td>
            <td>-${formatCurrency(totalStateTax)}</td>
        </tr>
        <tr class="deduction">
            <td>Social Security (6.2%)</td>
            <td>-${formatCurrency(socialSecurityTax / periodsPerYear)}</td>
            <td>-${formatCurrency(socialSecurityTax)}</td>
        </tr>
        <tr class="deduction">
            <td>Medicare (1.45%)</td>
            <td>-${formatCurrency(medicareTax / periodsPerYear)}</td>
            <td>-${formatCurrency(medicareTax)}</td>
        </tr>
        ${annual401k > 0 ? `
        <tr class="deduction">
            <td>401(k) Contribution</td>
            <td>-${formatCurrency(preTax401k)}</td>
            <td>-${formatCurrency(annual401k)}</td>
        </tr>` : ''}
        ${annualHealth > 0 ? `
        <tr class="deduction">
            <td>Health Insurance</td>
            <td>-${formatCurrency(healthInsurance)}</td>
            <td>-${formatCurrency(annualHealth)}</td>
        </tr>` : ''}
        ${annualHSA > 0 ? `
        <tr class="deduction">
            <td>HSA Contribution</td>
            <td>-${formatCurrency(hsaContribution)}</td>
            <td>-${formatCurrency(annualHSA)}</td>
        </tr>` : ''}
        ${annualOther > 0 ? `
        <tr class="deduction">
            <td>Other Deductions</td>
            <td>-${formatCurrency(otherDeductions)}</td>
            <td>-${formatCurrency(annualOther)}</td>
        </tr>` : ''}
        <tr class="total">
            <td><strong>Net Pay (Take Home)</strong></td>
            <td><strong>${formatCurrency(periodNetPay)}</strong></td>
            <td><strong>${formatCurrency(annualNetPay)}</strong></td>
        </tr>
    `;

    document.getElementById('results').style.display = 'block';
    if (shouldScroll) {
        document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
    }
}

function calculateFederalTax(income, filingStatus) {
    // 2024 Federal Tax Brackets
    const brackets = {
        single: [
            { min: 0, max: 11600, rate: 0.10 },
            { min: 11600, max: 47150, rate: 0.12 },
            { min: 47150, max: 100525, rate: 0.22 },
            { min: 100525, max: 191950, rate: 0.24 },
            { min: 191950, max: 243725, rate: 0.32 },
            { min: 243725, max: 609350, rate: 0.35 },
            { min: 609350, max: Infinity, rate: 0.37 }
        ],
        married: [
            { min: 0, max: 23200, rate: 0.10 },
            { min: 23200, max: 94300, rate: 0.12 },
            { min: 94300, max: 201050, rate: 0.22 },
            { min: 201050, max: 383900, rate: 0.24 },
            { min: 383900, max: 487450, rate: 0.32 },
            { min: 487450, max: 731200, rate: 0.35 },
            { min: 731200, max: Infinity, rate: 0.37 }
        ],
        head: [
            { min: 0, max: 16550, rate: 0.10 },
            { min: 16550, max: 63100, rate: 0.12 },
            { min: 63100, max: 100500, rate: 0.22 },
            { min: 100500, max: 191950, rate: 0.24 },
            { min: 191950, max: 243700, rate: 0.32 },
            { min: 243700, max: 609350, rate: 0.35 },
            { min: 609350, max: Infinity, rate: 0.37 }
        ]
    };

    // Standard deduction
    const standardDeduction = {
        single: 14600,
        married: 29200,
        head: 21900
    };

    const taxableIncome = Math.max(0, income - standardDeduction[filingStatus]);
    const taxBrackets = brackets[filingStatus];

    let tax = 0;
    for (const bracket of taxBrackets) {
        if (taxableIncome > bracket.min) {
            const taxableInBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
            tax += taxableInBracket * bracket.rate;
        }
    }

    return tax;
}

function calculateStateTax(income, state, filingStatus) {
    // Simplified state tax rates (2024 approximations)
    const stateRates = {
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

    const rate = stateRates[state] || 0.05;
    return income * rate;
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

// Calculate on page load with default values
document.addEventListener('DOMContentLoaded', function() {
    calculateTakeHomePay(false);
});
