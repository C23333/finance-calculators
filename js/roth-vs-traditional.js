document.getElementById('rothTraditionalForm').addEventListener('submit', function(e) {
    e.preventDefault();
    calculateRothVsTraditional(true);
});

function calculateRothVsTraditional(shouldScroll = false) {
    const currentAge = parseInt(document.getElementById('currentAge').value);
    const retirementAge = parseInt(document.getElementById('retirementAge').value);
    const annualContribution = parseFloat(document.getElementById('annualContribution').value);
    const currentTaxRate = parseFloat(document.getElementById('currentTaxRate').value) / 100;
    const retirementTaxRate = parseFloat(document.getElementById('retirementTaxRate').value) / 100;
    const expectedReturn = parseFloat(document.getElementById('expectedReturn').value) / 100;
    const currentTraditional = parseFloat(document.getElementById('currentTraditional').value) || 0;
    const currentRoth = parseFloat(document.getElementById('currentRoth').value) || 0;

    const yearsToRetirement = retirementAge - currentAge;

    // Traditional IRA/401k calculations
    // Pre-tax contribution, taxed at withdrawal
    const traditionalContribution = annualContribution;
    let traditionalBalance = currentTraditional;

    for (let i = 0; i < yearsToRetirement; i++) {
        traditionalBalance = (traditionalBalance + traditionalContribution) * (1 + expectedReturn);
    }

    // Tax savings now (invested in taxable account)
    const annualTaxSavings = annualContribution * currentTaxRate;
    let taxSavingsGrowth = 0;
    for (let i = 0; i < yearsToRetirement; i++) {
        taxSavingsGrowth = (taxSavingsGrowth + annualTaxSavings) * (1 + expectedReturn * 0.85); // Assume 15% tax drag
    }

    const traditionalAfterTax = traditionalBalance * (1 - retirementTaxRate) + taxSavingsGrowth * 0.85;

    // Roth IRA/401k calculations
    // After-tax contribution, tax-free withdrawal
    const rothContribution = annualContribution * (1 - currentTaxRate);
    let rothBalance = currentRoth;

    for (let i = 0; i < yearsToRetirement; i++) {
        rothBalance = (rothBalance + rothContribution) * (1 + expectedReturn);
    }

    const rothAfterTax = rothBalance; // No tax on withdrawal

    // Calculate equivalent values
    const traditionalPreTax = traditionalBalance;
    const rothPreTaxEquivalent = rothBalance / (1 - retirementTaxRate);

    // Determine winner
    const difference = rothAfterTax - traditionalAfterTax;
    const percentDifference = (difference / traditionalAfterTax) * 100;

    // Calculate break-even tax rate
    // At what retirement tax rate are they equal?
    // Traditional after tax = Traditional * (1 - r) + taxSavings
    // Roth after tax = Roth
    // Solve for r where Traditional * (1 - r) + taxSavings = Roth
    const breakEvenRate = 1 - (rothBalance - taxSavingsGrowth * 0.85) / traditionalBalance;

    // Monthly income in retirement (assuming 4% withdrawal rate)
    const traditionalMonthlyIncome = (traditionalAfterTax * 0.04) / 12;
    const rothMonthlyIncome = (rothAfterTax * 0.04) / 12;

    // Display results
    document.getElementById('traditionalBalance').textContent = I18n.formatCurrency(traditionalBalance, { decimals: 0 });
    document.getElementById('rothBalance').textContent = I18n.formatCurrency(rothBalance, { decimals: 0 });
    document.getElementById('traditionalAfterTax').textContent = I18n.formatCurrency(traditionalAfterTax, { decimals: 0 });
    document.getElementById('rothAfterTax').textContent = I18n.formatCurrency(rothAfterTax, { decimals: 0 });
    document.getElementById('traditionalMonthly').textContent = I18n.formatCurrency(traditionalMonthlyIncome, { decimals: 0 });
    document.getElementById('rothMonthly').textContent = I18n.formatCurrency(rothMonthlyIncome, { decimals: 0 });
    document.getElementById('difference').textContent = I18n.formatCurrency(Math.abs(difference), { decimals: 0 });
    document.getElementById('breakEvenRate').textContent = (breakEvenRate * 100).toFixed(1) + '%';

    // Recommendation
    const recommendationEl = document.getElementById('recommendation');
    if (difference > 0) {
        const rothBetterTitle = I18n.t('calculators.rothVsTraditional.rothBetterTitle') || 'Roth is Better for You';
        const rothBetterDesc = I18n.t('calculators.rothVsTraditional.rothBetterDesc') || 'Based on your inputs, a Roth account would provide <strong>{amount}</strong> more in after-tax retirement savings ({percent}% more).';
        const rothBetterReason = I18n.t('calculators.rothVsTraditional.rothBetterReason') || 'This is because your expected retirement tax rate ({retirementRate}%) is higher than or close to your current rate ({currentRate}%).';

        recommendationEl.innerHTML = `
            <div class="recommendation roth-better">
                <h4>${rothBetterTitle}</h4>
                <p>${rothBetterDesc.replace('{amount}', I18n.formatCurrency(difference, { decimals: 0 })).replace('{percent}', percentDifference.toFixed(1))}</p>
                <p>${rothBetterReason.replace('{retirementRate}', (retirementTaxRate * 100).toFixed(0)).replace('{currentRate}', (currentTaxRate * 100).toFixed(0))}</p>
            </div>
        `;
    } else if (difference < 0) {
        const traditionalBetterTitle = I18n.t('calculators.rothVsTraditional.traditionalBetterTitle') || 'Traditional is Better for You';
        const traditionalBetterDesc = I18n.t('calculators.rothVsTraditional.traditionalBetterDesc') || 'Based on your inputs, a Traditional account would provide <strong>{amount}</strong> more in after-tax retirement savings ({percent}% more).';
        const traditionalBetterReason = I18n.t('calculators.rothVsTraditional.traditionalBetterReason') || 'This is because your current tax rate ({currentRate}%) is higher than your expected retirement rate ({retirementRate}%).';

        recommendationEl.innerHTML = `
            <div class="recommendation traditional-better">
                <h4>${traditionalBetterTitle}</h4>
                <p>${traditionalBetterDesc.replace('{amount}', I18n.formatCurrency(Math.abs(difference), { decimals: 0 })).replace('{percent}', Math.abs(percentDifference).toFixed(1))}</p>
                <p>${traditionalBetterReason.replace('{currentRate}', (currentTaxRate * 100).toFixed(0)).replace('{retirementRate}', (retirementTaxRate * 100).toFixed(0))}</p>
            </div>
        `;
    } else {
        const equalTitle = I18n.t('calculators.rothVsTraditional.equalTitle') || 'Both Options Are Equal';
        const equalDesc = I18n.t('calculators.rothVsTraditional.equalDesc') || 'Based on your inputs, both Traditional and Roth accounts would provide similar after-tax retirement savings.';
        const equalAdvice = I18n.t('calculators.rothVsTraditional.equalAdvice') || 'Consider other factors like tax diversification and flexibility.';

        recommendationEl.innerHTML = `
            <div class="recommendation equal">
                <h4>${equalTitle}</h4>
                <p>${equalDesc}</p>
                <p>${equalAdvice}</p>
            </div>
        `;
    }

    // Build comparison table
    const comparisonBody = document.getElementById('comparisonBody');
    const annualContributionLabel = I18n.t('calculators.rothVsTraditional.tableAnnualContribution') || 'Annual Contribution';
    const taxSavingsNowLabel = I18n.t('calculators.rothVsTraditional.tableTaxSavingsNow') || 'Tax Savings Now';
    const balanceAtRetirementLabel = I18n.t('calculators.rothVsTraditional.tableBalanceAtRetirement') || 'Balance at Retirement';
    const taxesAtWithdrawalLabel = I18n.t('calculators.rothVsTraditional.tableTaxesAtWithdrawal') || 'Taxes at Withdrawal';
    const afterTaxValueLabel = I18n.t('calculators.rothVsTraditional.tableAfterTaxValue') || 'After-Tax Value';
    const monthlyIncomeLabel = I18n.t('calculators.rothVsTraditional.tableMonthlyIncome') || 'Monthly Income (4% rule)';
    const perYearLabel = I18n.t('common.perYear') || '/year';

    comparisonBody.innerHTML = `
        <tr>
            <td>${annualContributionLabel}</td>
            <td>${I18n.formatCurrency(traditionalContribution, { decimals: 0 })}</td>
            <td>${I18n.formatCurrency(rothContribution, { decimals: 0 })}</td>
        </tr>
        <tr>
            <td>${taxSavingsNowLabel}</td>
            <td>${I18n.formatCurrency(annualTaxSavings, { decimals: 0 })}${perYearLabel}</td>
            <td>$0</td>
        </tr>
        <tr>
            <td>${balanceAtRetirementLabel}</td>
            <td>${I18n.formatCurrency(traditionalBalance, { decimals: 0 })}</td>
            <td>${I18n.formatCurrency(rothBalance, { decimals: 0 })}</td>
        </tr>
        <tr>
            <td>${taxesAtWithdrawalLabel}</td>
            <td>${I18n.formatCurrency(traditionalBalance * retirementTaxRate, { decimals: 0 })}</td>
            <td>$0</td>
        </tr>
        <tr>
            <td>${afterTaxValueLabel}</td>
            <td>${I18n.formatCurrency(traditionalAfterTax, { decimals: 0 })}</td>
            <td>${I18n.formatCurrency(rothAfterTax, { decimals: 0 })}</td>
        </tr>
        <tr>
            <td>${monthlyIncomeLabel}</td>
            <td>${I18n.formatCurrency(traditionalMonthlyIncome, { decimals: 0 })}</td>
            <td>${I18n.formatCurrency(rothMonthlyIncome, { decimals: 0 })}</td>
        </tr>
    `;

    document.getElementById('results').style.display = 'block';
    if (shouldScroll) {
        document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
    }
}

// Listen for language changes and recalculate
document.addEventListener('languageChange', function() {
    // Recalculate to update currency formatting
    if (document.getElementById('results').style.display !== 'none') {
        calculateRothVsTraditional(false);
    }
});

// Calculate on page load with default values
document.addEventListener('DOMContentLoaded', function() {
    calculateRothVsTraditional(false);
});
