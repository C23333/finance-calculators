document.getElementById('takeHomePayForm').addEventListener('submit', function(e) {
    e.preventDefault();
    calculateTakeHomePay(true).catch((error) => {
        console.warn('[TakeHomePay] Calculation failed.', error);
    });
});

async function calculateTakeHomePay(shouldScroll = false) {
    const params = await TaxParams.load();
    const federalParams = params.federal || {};
    const ficaParams = params.fica || {};
    const stateParams = params.state || {};

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
    const federalTax = calculateFederalTax(federalTaxableIncome, filingStatus, federalParams);

    // Social Security Tax (6.2% up to $168,600)
    const socialSecurityWageBase = ficaParams.socialSecurityWageBase || 168600;
    const socialSecurityRate = ficaParams.socialSecurityRate || 0.062;
    const socialSecurityWage = Math.min(annualGross, socialSecurityWageBase);
    const socialSecurityTax = socialSecurityWage * socialSecurityRate;

    // Medicare Tax (1.45% + 0.9% additional over $200k single / $250k married)
    const medicareRate = ficaParams.medicareRate || 0.0145;
    let medicareTax = annualGross * medicareRate;
    const thresholdMap = ficaParams.additionalMedicareThreshold || {};
    const medicareThreshold = thresholdMap[filingStatus] || thresholdMap.single || 200000;
    if (annualGross > medicareThreshold) {
        const additionalRate = ficaParams.additionalMedicareRate || 0.009;
        medicareTax += (annualGross - medicareThreshold) * additionalRate;
    }

    // State Tax (simplified - using flat rates for common states)
    const stateTax = calculateStateTax(federalTaxableIncome, state, stateParams);

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
    document.getElementById('grossPay').textContent = I18n.formatCurrency(grossSalary);
    document.getElementById('netPay').textContent = I18n.formatCurrency(periodNetPay);
    document.getElementById('annualGross').textContent = I18n.formatCurrency(annualGross);
    document.getElementById('annualNet').textContent = I18n.formatCurrency(annualNetPay);
    document.getElementById('federalTax').textContent = I18n.formatCurrency(totalFederalTax / periodsPerYear);
    document.getElementById('stateTaxResult').textContent = I18n.formatCurrency(totalStateTax / periodsPerYear);
    document.getElementById('socialSecurity').textContent = I18n.formatCurrency(socialSecurityTax / periodsPerYear);
    document.getElementById('medicare').textContent = I18n.formatCurrency(medicareTax / periodsPerYear);
    document.getElementById('effectiveRate').textContent = effectiveTaxRate.toFixed(1) + '%';

    // Build breakdown table
    const breakdownBody = document.getElementById('breakdownBody');
    breakdownBody.innerHTML = `
        <tr>
            <td>${I18n.t('calculators.takeHomePay.grossPay')}</td>
            <td>${I18n.formatCurrency(grossSalary)}</td>
            <td>${I18n.formatCurrency(annualGross)}</td>
        </tr>
        <tr class="deduction">
            <td>${I18n.t('calculators.takeHomePay.federalIncomeTaxTable')}</td>
            <td>-${I18n.formatCurrency(totalFederalTax / periodsPerYear)}</td>
            <td>-${I18n.formatCurrency(totalFederalTax)}</td>
        </tr>
        <tr class="deduction">
            <td>${I18n.t('calculators.takeHomePay.stateIncomeTaxTable')} (${state})</td>
            <td>-${I18n.formatCurrency(totalStateTax / periodsPerYear)}</td>
            <td>-${I18n.formatCurrency(totalStateTax)}</td>
        </tr>
        <tr class="deduction">
            <td>${I18n.t('calculators.takeHomePay.socialSecurityTable')} (${formatRate(socialSecurityRate)}%)</td>
            <td>-${I18n.formatCurrency(socialSecurityTax / periodsPerYear)}</td>
            <td>-${I18n.formatCurrency(socialSecurityTax)}</td>
        </tr>
        <tr class="deduction">
            <td>${I18n.t('calculators.takeHomePay.medicareTable')} (${formatRate(medicareRate)}%)</td>
            <td>-${I18n.formatCurrency(medicareTax / periodsPerYear)}</td>
            <td>-${I18n.formatCurrency(medicareTax)}</td>
        </tr>
        ${annual401k > 0 ? `
        <tr class="deduction">
            <td>${I18n.t('calculators.takeHomePay.contribution401kTable')}</td>
            <td>-${I18n.formatCurrency(preTax401k)}</td>
            <td>-${I18n.formatCurrency(annual401k)}</td>
        </tr>` : ''}
        ${annualHealth > 0 ? `
        <tr class="deduction">
            <td>${I18n.t('calculators.takeHomePay.healthInsuranceTable')}</td>
            <td>-${I18n.formatCurrency(healthInsurance)}</td>
            <td>-${I18n.formatCurrency(annualHealth)}</td>
        </tr>` : ''}
        ${annualHSA > 0 ? `
        <tr class="deduction">
            <td>${I18n.t('calculators.takeHomePay.hsaContributionTable')}</td>
            <td>-${I18n.formatCurrency(hsaContribution)}</td>
            <td>-${I18n.formatCurrency(annualHSA)}</td>
        </tr>` : ''}
        ${annualOther > 0 ? `
        <tr class="deduction">
            <td>${I18n.t('calculators.takeHomePay.otherDeductionsTable')}</td>
            <td>-${I18n.formatCurrency(otherDeductions)}</td>
            <td>-${I18n.formatCurrency(annualOther)}</td>
        </tr>` : ''}
        <tr class="total">
            <td><strong>${I18n.t('calculators.takeHomePay.netPayTable')}</strong></td>
            <td><strong>${I18n.formatCurrency(periodNetPay)}</strong></td>
            <td><strong>${I18n.formatCurrency(annualNetPay)}</strong></td>
        </tr>
    `;

    document.getElementById('results').style.display = 'block';
    if (shouldScroll) {
        document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
    }
}

function calculateFederalTax(income, filingStatus, federalParams) {
    const brackets = (federalParams.brackets && federalParams.brackets[filingStatus]) || [];
    const standardDeduction = (federalParams.standardDeduction && federalParams.standardDeduction[filingStatus]) || 0;
    const taxableIncome = Math.max(0, income - standardDeduction);
    const taxBrackets = brackets;

    let tax = 0;
    for (const bracket of taxBrackets) {
        if (taxableIncome > bracket.min) {
            const max = bracket.max === null ? Infinity : bracket.max;
            const taxableInBracket = Math.min(taxableIncome, max) - bracket.min;
            tax += taxableInBracket * bracket.rate;
        }
    }

    return tax;
}

function calculateStateTax(income, state, stateParams) {
    const stateRates = stateParams.rates || {};
    const defaultRate = stateParams.defaultRate !== undefined ? stateParams.defaultRate : 0;
    const rate = stateRates[state] !== undefined ? stateRates[state] : defaultRate;
    return income * rate;
}

function formatRate(rate) {
    const value = (rate || 0) * 100;
    return value.toFixed(2).replace(/\.00$/, '');
}

// Listen for language changes and recalculate
document.addEventListener('languageChange', function() {
    // Recalculate to update currency formatting
    if (document.getElementById('results').style.display !== 'none') {
        calculateTakeHomePay(false).catch((error) => {
            console.warn('[TakeHomePay] Calculation failed.', error);
        });
    }
});

// Calculate on page load with default values
document.addEventListener('DOMContentLoaded', function() {
    calculateTakeHomePay(false).catch((error) => {
        console.warn('[TakeHomePay] Calculation failed.', error);
    });
});
