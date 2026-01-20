/**
 * Interactive Tools JavaScript
 * Handles calculations and UI for embedded article tools
 */

(function() {
    'use strict';

    // Global tool calculations registry
    window.toolCalculations = window.toolCalculations || {};

    /**
     * Get all input values from a tool form
     */
    window.getToolInputs = function(toolId) {
        const tool = document.getElementById(toolId);
        if (!tool) return {};

        const inputs = {};
        const form = tool.querySelector('.tool-form');
        if (!form) return inputs;

        // Get all input elements
        form.querySelectorAll('input, select').forEach(el => {
            const name = el.name || el.id.replace(toolId + '-', '');
            if (el.type === 'checkbox') {
                inputs[name] = el.checked;
            } else if (el.type === 'number' || el.type === 'range') {
                inputs[name] = parseFloat(el.value) || 0;
            } else {
                inputs[name] = el.value;
            }
        });

        return inputs;
    };

    /**
     * Format number as currency
     */
    window.formatCurrency = function(value) {
        if (typeof value !== 'number' || isNaN(value)) return '--';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(value);
    };

    /**
     * Format number as percentage
     */
    window.formatPercentage = function(value) {
        if (typeof value !== 'number' || isNaN(value)) return '--';
        return value.toFixed(2) + '%';
    };

    /**
     * Calculate and display results for a tool
     */
    window.calculateTool = function(toolId) {
        const tool = document.getElementById(toolId);
        if (!tool) {
            console.error('Tool not found:', toolId);
            return;
        }

        // Get calculation function
        const calcFn = window.toolCalculations[toolId];
        if (!calcFn) {
            console.error('No calculation function for tool:', toolId);
            // Try to run a default calculation based on tool type
            runDefaultCalculation(toolId);
            return;
        }

        try {
            // Run calculation
            const results = calcFn();

            // Display results
            displayResults(toolId, results);

            // Track event
            trackToolUsage(toolId, tool.dataset.toolType);
        } catch (err) {
            console.error('Calculation error:', err);
            showToolError(toolId, 'Calculation error. Please check your inputs.');
        }
    };

    /**
     * Run default calculation based on tool type
     */
    function runDefaultCalculation(toolId) {
        const tool = document.getElementById(toolId);
        const toolType = tool?.dataset.toolType;
        const inputs = window.getToolInputs(toolId);

        let results = {};

        switch (toolType) {
            case 'rate-calculator':
            case 'mortgage-comparison':
                const principal = inputs.loanAmount || inputs.principal || 300000;
                const oldRate = (inputs.currentRate || inputs.oldRate || 7) / 100 / 12;
                const newRate = (inputs.newRate || 6.5) / 100 / 12;
                const term = (inputs.loanTerm || inputs.term || 30) * 12;

                const calcPayment = (p, r, n) => {
                    if (r === 0) return p / n;
                    return p * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
                };

                const currentPayment = calcPayment(principal, oldRate, term);
                const newPayment = calcPayment(principal, newRate, term);

                results = {
                    currentPayment: formatCurrency(currentPayment),
                    newPayment: formatCurrency(newPayment),
                    monthlyIncrease: formatCurrency(newPayment - currentPayment),
                    monthlySavings: formatCurrency(currentPayment - newPayment),
                    totalDifference: formatCurrency((newPayment - currentPayment) * term)
                };
                break;

            case 'savings-estimator':
                const current = inputs.currentMonthly || inputs.current || 0;
                const newVal = inputs.newMonthly || inputs.newValue || 0;
                const months = inputs.months || inputs.period || 12;
                const monthly = current - newVal;

                results = {
                    monthlySavings: formatCurrency(monthly),
                    yearlySavings: formatCurrency(monthly * 12),
                    totalSavings: formatCurrency(monthly * months)
                };
                break;

            case 'impact-calculator':
                const before = inputs.currentValue || inputs.before || 0;
                const changeRate = (inputs.changeRate || inputs.rate || 5) / 100;
                const after = before * (1 + changeRate);

                results = {
                    beforeValue: formatCurrency(before),
                    afterValue: formatCurrency(after),
                    difference: formatCurrency(after - before),
                    percentChange: (changeRate * 100).toFixed(1) + '%'
                };
                break;

            case 'eligibility-checker':
            case 'policy-checker':
                let eligible = true;
                let reasons = [];

                if (inputs.income && inputs.income > 150000) {
                    eligible = false;
                    reasons.push('Income exceeds typical limit');
                }
                if (inputs.creditScore && inputs.creditScore < 620) {
                    eligible = false;
                    reasons.push('Credit score below minimum');
                }
                if (inputs.age && (inputs.age < 18 || inputs.age > 100)) {
                    eligible = false;
                    reasons.push('Age outside eligible range');
                }

                results = {
                    eligible: eligible ? '✅ You likely qualify!' : '❌ You may not qualify',
                    details: reasons.length > 0 ? reasons.join('; ') : 'All criteria appear to be met',
                    recommendation: eligible
                        ? 'Consider taking the next step - use our detailed calculator for more info.'
                        : 'Review the requirements and consider how to improve your situation.'
                };
                break;

            default:
                results = {
                    result: 'Calculation complete',
                    note: 'Check the detailed calculator for more accurate results'
                };
        }

        displayResults(toolId, results);
        trackToolUsage(toolId, toolType);
    }

    /**
     * Display results in the tool UI
     */
    function displayResults(toolId, results) {
        const tool = document.getElementById(toolId);
        if (!tool) return;

        const resultsDiv = tool.querySelector('.tool-results');
        if (!resultsDiv) return;

        // Show results container
        resultsDiv.style.display = 'block';

        // Update each output value
        Object.keys(results).forEach(key => {
            const outputEl = resultsDiv.querySelector(`#${toolId}-output-${key} .output-value`);
            if (outputEl) {
                outputEl.textContent = results[key];
                outputEl.classList.add('updated');
                setTimeout(() => outputEl.classList.remove('updated'), 300);
            }
        });

        // Scroll results into view
        resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        // Add animation class
        resultsDiv.classList.add('tool-results-show');
    }

    /**
     * Show error message in tool
     */
    function showToolError(toolId, message) {
        const tool = document.getElementById(toolId);
        if (!tool) return;

        const resultsDiv = tool.querySelector('.tool-results');
        if (resultsDiv) {
            resultsDiv.style.display = 'block';
            resultsDiv.innerHTML = `
                <div class="tool-error">
                    <p>⚠️ ${message}</p>
                    <p>Please check your inputs and try again.</p>
                </div>
            `;
        }
    }

    /**
     * Track tool usage with analytics
     */
    function trackToolUsage(toolId, toolType) {
        // Google Analytics 4
        if (window.gtag) {
            gtag('event', 'tool_calculation', {
                'tool_id': toolId,
                'tool_type': toolType,
                'page_path': window.location.pathname
            });
        }

        // Console log for debugging
        console.log('[Tool] Calculation completed:', { toolId, toolType });
    }

    /**
     * Initialize tools on page load
     */
    function initTools() {
        // Add input change listeners for real-time preview
        document.querySelectorAll('.interactive-tool').forEach(tool => {
            const inputs = tool.querySelectorAll('input, select');
            inputs.forEach(input => {
                // Update range display values
                if (input.type === 'range') {
                    const valueDisplay = document.getElementById(input.id + '-value');
                    if (valueDisplay) {
                        input.addEventListener('input', () => {
                            valueDisplay.textContent = input.value;
                        });
                    }
                }

                // Format currency inputs
                if (input.type === 'number' && input.id.includes('Amount')) {
                    input.addEventListener('blur', () => {
                        if (input.value) {
                            // Store raw value
                            input.dataset.rawValue = input.value;
                        }
                    });
                }
            });

            // Add enter key support
            tool.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const calcBtn = tool.querySelector('.tool-calculate-btn');
                    if (calcBtn) calcBtn.click();
                }
            });
        });

        console.log('[Tools] Initialized', document.querySelectorAll('.interactive-tool').length, 'tools');
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTools);
    } else {
        initTools();
    }

})();
