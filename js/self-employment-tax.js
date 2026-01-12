document.getElementById('selfEmploymentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    calculateSelfEmploymentTax(true);
});

function calculateSelfEmploymentTax(shouldScroll = false) {
    const grossIncome = parseFloat(document.getElementById('grossIncome').value);
    const businessExpenses = parseFloat(document.getElementById('businessExpenses').value) || 0;
    const filingStatus = document.getElementById('filingStatus').value;
    const state = document.getElementById('state').value;
    const otherIncome = parseFloat(document.getElementById('otherIncome').value) || 0;
    const retirementContribution = parseFloat(document.getElementById('retirementContribution').value) || 0;
    const healthInsurance = parseFloat(document.getElementById('healthInsurance').value) || 0;

    // Calculate net self-employment income
    const netSEIncome = grossIncome - businessExpenses;

    // SE tax is calculated on 92.35% of net self-employment income
    const seTaxableIncome = netSEIncome * 0.9235;

    // Social Security tax (12.4% up to wage base)
    const ssWageBase = 168600;
    const ssFromOtherIncome = Math.min(otherIncome, ssWageBase);
    const remainingSSBase = Math.max(0, ssWageBase - ssFromOtherIncome);
    const ssTaxableAmount = Math.min(seTaxableIncome, remainingSSBase);
    const socialSecurityTax = ssTaxableAmount * 0.124;

    // Medicare tax (2.9% on all SE income)
    let medicareTax = seTaxableIncome * 0.029;

    // Additional Medicare Tax (0.9% on income over threshold)
    const medicareThreshold = filingStatus === 'married' ? 250000 : 200000;
    const totalIncome = netSEIncome + otherIncome;
    if (totalIncome > medicareThreshold) {
        const additionalMedicareIncome = Math.min(netSEIncome, totalIncome - medicareThreshold);
        medicareTax += Math.max(0, additionalMedicareIncome) * 0.009;
    }

    // Total SE tax
    const totalSETax = socialSecurityTax + medicareTax;

    // Deduction for half of SE tax (for income tax purposes)
    const seDeduction = totalSETax / 2;

    // Calculate adjusted gross income for federal tax
    let agi = netSEIncome + otherIncome - seDeduction - retirementContribution - healthInsurance;

    // Federal income tax
    const federalTax = calculateFederalTax(agi, filingStatus);

    // State income tax (simplified)
    const stateTax = calculateStateTax(agi, state);

    // Total tax
    const totalTax = totalSETax + federalTax + stateTax;

    // Quarterly payment
    const quarterlyPayment = totalTax / 4;

    // Effective tax rate
    const effectiveRate = (totalTax / (netSEIncome + otherIncome)) * 100;

    // Display results
    document.getElementById('quarterlyPayment').textContent = formatCurrency(quarterlyPayment);
    document.getElementById('netIncome').textContent = formatCurrency(netSEIncome);
    document.getElementById('seTax').textContent = formatCurrency(totalSETax);
    document.getElementById('socialSecurityTax').textContent = formatCurrency(socialSecurityTax);
    document.getElementById('medicareTax').textContent = formatCurrency(medicareTax);
    document.getElementById('federalTax').textContent = formatCurrency(federalTax);
    document.getElementById('stateTax').textContent = formatCurrency(stateTax);
    document.getElementById('totalTax').textContent = formatCurrency(totalTax);
    document.getElementById('effectiveRate').textContent = effectiveRate.toFixed(1) + '%';

    // Build deductions table
    const deductionsBody = document.getElementById('deductionsBody');
    deductionsBody.innerHTML = `
        <tr>
            <td>Business Expenses</td>
            <td>${formatCurrency(businessExpenses)}</td>
        </tr>
        <tr>
            <td>Half of SE Tax (Deductible)</td>
            <td>${formatCurrency(seDeduction)}</td>
        </tr>
        ${retirementContribution > 0 ? `
        <tr>
            <td>Retirement Contribution</td>
            <td>${formatCurrency(retirementContribution)}</td>
        </tr>` : ''}
        ${healthInsurance > 0 ? `
        <tr>
            <td>Health Insurance Premium</td>
            <td>${formatCurrency(healthInsurance)}</td>
        </tr>` : ''}
        <tr style="font-weight: bold; border-top: 2px solid #ddd;">
            <td>Total Deductions</td>
            <td>${formatCurrency(businessExpenses + seDeduction + retirementContribution + healthInsurance)}</td>
        </tr>
    `;

    // Build breakdown table
    const breakdownBody = document.getElementById('breakdownBody');
    breakdownBody.innerHTML = `
        <tr>
            <td>Social Security Tax</td>
            <td>${formatCurrency(socialSecurityTax)}</td>
            <td>12.4% (up to $168,600)</td>
        </tr>
        <tr>
            <td>Medicare Tax</td>
            <td>${formatCurrency(medicareTax)}</td>
            <td>2.9% + 0.9% additional</td>
        </tr>
        <tr style="background: #f8f9fa;">
            <td><strong>Total SE Tax</strong></td>
            <td><strong>${formatCurrency(totalSETax)}</strong></td>
            <td>15.3%</td>
        </tr>
        <tr>
            <td>Federal Income Tax</td>
            <td>${formatCurrency(federalTax)}</td>
            <td>10-37% (progressive)</td>
        </tr>
        <tr>
            <td>State Income Tax (${state})</td>
            <td>${formatCurrency(stateTax)}</td>
            <td>Varies by state</td>
        </tr>
        <tr style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
            <td><strong>Total Annual Tax</strong></td>
            <td><strong>${formatCurrency(totalTax)}</strong></td>
            <td>${effectiveRate.toFixed(1)}% effective</td>
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

function calculateStateTax(income, state) {
    // Simplified state tax rates
    const stateRates = {
        'CA': 0.0725,
        'TX': 0,
        'FL': 0,
        'NY': 0.0685,
        'WA': 0,
        'other': 0.05
    };

    const rate = stateRates[state] || 0.05;
    return Math.max(0, income) * rate;
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Calculate on page load with default values
document.addEventListener('DOMContentLoaded', function() {
    calculateSelfEmploymentTax(false);
});
