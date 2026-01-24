document.getElementById('selfEmploymentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    calculateSelfEmploymentTax(true).catch((error) => {
        console.warn('[SelfEmploymentTax] Calculation failed.', error);
    });
});

async function calculateSelfEmploymentTax(shouldScroll = false) {
    const params = await TaxParams.load();
    const seParams = params.seTax || {};
    const federalParams = params.federal || {};
    const stateParams = params.state || {};

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
    const seTaxableShare = seParams.seTaxableShare || 0.9235;
    const seTaxableIncome = netSEIncome * seTaxableShare;

    // Social Security tax (12.4% up to wage base)
    const ssWageBase = seParams.socialSecurityWageBase || 168600;
    const ssFromOtherIncome = Math.min(otherIncome, ssWageBase);
    const remainingSSBase = Math.max(0, ssWageBase - ssFromOtherIncome);
    const ssTaxableAmount = Math.min(seTaxableIncome, remainingSSBase);
    const socialSecurityTaxRate = seParams.socialSecurityRate || 0.124;
    const socialSecurityTax = ssTaxableAmount * socialSecurityTaxRate;

    // Medicare tax (2.9% on all SE income)
    const medicareRate = seParams.medicareRate || 0.029;
    let medicareTax = seTaxableIncome * medicareRate;

    // Additional Medicare Tax (0.9% on income over threshold)
    const thresholdMap = seParams.additionalMedicareThreshold || {};
    const medicareThreshold = thresholdMap[filingStatus] || thresholdMap.single || 200000;
    const totalIncome = netSEIncome + otherIncome;
    if (totalIncome > medicareThreshold) {
        const additionalMedicareIncome = Math.min(netSEIncome, totalIncome - medicareThreshold);
        const additionalMedicareRate = seParams.additionalMedicareRate || 0.009;
        medicareTax += Math.max(0, additionalMedicareIncome) * additionalMedicareRate;
    }

    // Total SE tax
    const totalSETax = socialSecurityTax + medicareTax;

    // Deduction for half of SE tax (for income tax purposes)
    const seDeduction = totalSETax / 2;

    // Calculate adjusted gross income for federal tax
    let agi = netSEIncome + otherIncome - seDeduction - retirementContribution - healthInsurance;

    // Federal income tax
    const federalTax = calculateFederalTax(agi, filingStatus, federalParams);

    // State income tax (simplified)
    const stateTax = calculateStateTax(agi, state, stateParams);

    // Total tax
    const totalTax = totalSETax + federalTax + stateTax;

    // Quarterly payment
    const quarterlyPayment = totalTax / 4;

    // Effective tax rate
    const effectiveRate = (totalTax / (netSEIncome + otherIncome)) * 100;

    // Display results
    document.getElementById('quarterlyPayment').textContent = I18n.formatCurrency(quarterlyPayment, { decimals: 0 });
    document.getElementById('netIncome').textContent = I18n.formatCurrency(netSEIncome, { decimals: 0 });
    document.getElementById('seTax').textContent = I18n.formatCurrency(totalSETax, { decimals: 0 });
    document.getElementById('socialSecurityTax').textContent = I18n.formatCurrency(socialSecurityTax, { decimals: 0 });
    document.getElementById('medicareTax').textContent = I18n.formatCurrency(medicareTax, { decimals: 0 });
    document.getElementById('federalTax').textContent = I18n.formatCurrency(federalTax, { decimals: 0 });
    document.getElementById('stateTax').textContent = I18n.formatCurrency(stateTax, { decimals: 0 });
    document.getElementById('totalTax').textContent = I18n.formatCurrency(totalTax, { decimals: 0 });
    document.getElementById('effectiveRate').textContent = effectiveRate.toFixed(1) + '%';

    // Build deductions table
    const deductionsBody = document.getElementById('deductionsBody');
    deductionsBody.innerHTML = `
        <tr>
            <td data-i18n="calculators.selfEmploymentTax.businessExpensesLabel">${I18n.t('calculators.selfEmploymentTax.businessExpensesLabel')}</td>
            <td>${I18n.formatCurrency(businessExpenses, { decimals: 0 })}</td>
        </tr>
        <tr>
            <td data-i18n="calculators.selfEmploymentTax.halfSeTaxDeductible">${I18n.t('calculators.selfEmploymentTax.halfSeTaxDeductible')}</td>
            <td>${I18n.formatCurrency(seDeduction, { decimals: 0 })}</td>
        </tr>
        ${retirementContribution > 0 ? `
        <tr>
            <td data-i18n="calculators.selfEmploymentTax.retirementContributionLabel">${I18n.t('calculators.selfEmploymentTax.retirementContributionLabel')}</td>
            <td>${I18n.formatCurrency(retirementContribution, { decimals: 0 })}</td>
        </tr>` : ''}
        ${healthInsurance > 0 ? `
        <tr>
            <td data-i18n="calculators.selfEmploymentTax.healthInsurancePremium">${I18n.t('calculators.selfEmploymentTax.healthInsurancePremium')}</td>
            <td>${I18n.formatCurrency(healthInsurance, { decimals: 0 })}</td>
        </tr>` : ''}
        <tr style="font-weight: bold; border-top: 2px solid #ddd;">
            <td data-i18n="calculators.selfEmploymentTax.totalDeductions">${I18n.t('calculators.selfEmploymentTax.totalDeductions')}</td>
            <td>${I18n.formatCurrency(businessExpenses + seDeduction + retirementContribution + healthInsurance, { decimals: 0 })}</td>
        </tr>
    `;

    // Build breakdown table
    const breakdownBody = document.getElementById('breakdownBody');
    breakdownBody.innerHTML = `
        <tr>
            <td data-i18n="calculators.selfEmploymentTax.socialSecurityTax">${I18n.t('calculators.selfEmploymentTax.socialSecurityTax')}</td>
            <td>${I18n.formatCurrency(socialSecurityTax, { decimals: 0 })}</td>
            <td data-i18n="calculators.selfEmploymentTax.ssRateNote">${I18n.t('calculators.selfEmploymentTax.ssRateNote')}</td>
        </tr>
        <tr>
            <td data-i18n="calculators.selfEmploymentTax.medicareTax">${I18n.t('calculators.selfEmploymentTax.medicareTax')}</td>
            <td>${I18n.formatCurrency(medicareTax, { decimals: 0 })}</td>
            <td data-i18n="calculators.selfEmploymentTax.medicareRateNote">${I18n.t('calculators.selfEmploymentTax.medicareRateNote')}</td>
        </tr>
        <tr style="background: #f8f9fa;">
            <td><strong data-i18n="calculators.selfEmploymentTax.totalSeTax">${I18n.t('calculators.selfEmploymentTax.totalSeTax')}</strong></td>
            <td><strong>${I18n.formatCurrency(totalSETax, { decimals: 0 })}</strong></td>
            <td data-i18n="calculators.selfEmploymentTax.seTaxRate">${I18n.t('calculators.selfEmploymentTax.seTaxRate')}</td>
        </tr>
        <tr>
            <td data-i18n="calculators.selfEmploymentTax.federalTax">${I18n.t('calculators.selfEmploymentTax.federalTax')}</td>
            <td>${I18n.formatCurrency(federalTax, { decimals: 0 })}</td>
            <td data-i18n="calculators.selfEmploymentTax.federalRateNote">${I18n.t('calculators.selfEmploymentTax.federalRateNote')}</td>
        </tr>
        <tr>
            <td>${I18n.t('calculators.selfEmploymentTax.stateTax')} (${state})</td>
            <td>${I18n.formatCurrency(stateTax, { decimals: 0 })}</td>
            <td data-i18n="calculators.selfEmploymentTax.stateRateNote">${I18n.t('calculators.selfEmploymentTax.stateRateNote')}</td>
        </tr>
        <tr style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
            <td><strong data-i18n="calculators.selfEmploymentTax.totalTax">${I18n.t('calculators.selfEmploymentTax.totalTax')}</strong></td>
            <td><strong>${I18n.formatCurrency(totalTax, { decimals: 0 })}</strong></td>
            <td>${effectiveRate.toFixed(1)}% ${I18n.t('calculators.selfEmploymentTax.effective')}</td>
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
    return Math.max(0, income) * rate;
}

// Listen for language changes and recalculate
document.addEventListener('languageChange', function() {
    // Recalculate to update currency formatting
    if (document.getElementById('results').style.display !== 'none') {
        calculateSelfEmploymentTax(false).catch((error) => {
            console.warn('[SelfEmploymentTax] Calculation failed.', error);
        });
    }
});

// Calculate on page load with default values
document.addEventListener('DOMContentLoaded', function() {
    calculateSelfEmploymentTax(false).catch((error) => {
        console.warn('[SelfEmploymentTax] Calculation failed.', error);
    });
});
