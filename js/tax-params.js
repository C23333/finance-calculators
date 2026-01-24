(function() {
    const fallback = {
        metadata: {
            taxYear: 2024,
            lastUpdated: '2026-01-24'
        },
        federal: {
            standardDeduction: { single: 14600, married: 29200, head: 21900 },
            brackets: {
                single: [
                    { min: 0, max: 11600, rate: 0.1 },
                    { min: 11600, max: 47150, rate: 0.12 },
                    { min: 47150, max: 100525, rate: 0.22 },
                    { min: 100525, max: 191950, rate: 0.24 },
                    { min: 191950, max: 243725, rate: 0.32 },
                    { min: 243725, max: 609350, rate: 0.35 },
                    { min: 609350, max: null, rate: 0.37 }
                ],
                married: [
                    { min: 0, max: 23200, rate: 0.1 },
                    { min: 23200, max: 94300, rate: 0.12 },
                    { min: 94300, max: 201050, rate: 0.22 },
                    { min: 201050, max: 383900, rate: 0.24 },
                    { min: 383900, max: 487450, rate: 0.32 },
                    { min: 487450, max: 731200, rate: 0.35 },
                    { min: 731200, max: null, rate: 0.37 }
                ],
                head: [
                    { min: 0, max: 16550, rate: 0.1 },
                    { min: 16550, max: 63100, rate: 0.12 },
                    { min: 63100, max: 100500, rate: 0.22 },
                    { min: 100500, max: 191950, rate: 0.24 },
                    { min: 191950, max: 243700, rate: 0.32 },
                    { min: 243700, max: 609350, rate: 0.35 },
                    { min: 609350, max: null, rate: 0.37 }
                ]
            }
        },
        fica: {
            socialSecurityRate: 0.062,
            socialSecurityWageBase: 168600,
            medicareRate: 0.0145,
            additionalMedicareRate: 0.009,
            additionalMedicareThreshold: { single: 200000, married: 250000, head: 200000 }
        },
        seTax: {
            seTaxableShare: 0.9235,
            socialSecurityRate: 0.124,
            medicareRate: 0.029,
            additionalMedicareRate: 0.009,
            socialSecurityWageBase: 168600,
            additionalMedicareThreshold: { single: 200000, married: 250000, head: 200000 }
        },
        state: {
            defaultRate: 0.05,
            rates: {
                AL: 0.05,
                AK: 0,
                AZ: 0.025,
                AR: 0.047,
                CA: 0.0725,
                CO: 0.044,
                CT: 0.05,
                DE: 0.066,
                FL: 0,
                GA: 0.055,
                HI: 0.0725,
                ID: 0.058,
                IL: 0.0495,
                IN: 0.0315,
                IA: 0.057,
                KS: 0.057,
                KY: 0.04,
                LA: 0.0425,
                ME: 0.0715,
                MD: 0.0575,
                MA: 0.05,
                MI: 0.0425,
                MN: 0.0785,
                MS: 0.05,
                MO: 0.048,
                MT: 0.059,
                NE: 0.0584,
                NV: 0,
                NH: 0,
                NJ: 0.0637,
                NM: 0.049,
                NY: 0.0685,
                NC: 0.0475,
                ND: 0.0195,
                OH: 0.04,
                OK: 0.0475,
                OR: 0.099,
                PA: 0.0307,
                RI: 0.0599,
                SC: 0.064,
                SD: 0,
                TN: 0,
                TX: 0,
                UT: 0.0465,
                VT: 0.0875,
                VA: 0.0575,
                WA: 0,
                WV: 0.055,
                WI: 0.0765,
                WY: 0,
                other: 0.05
            }
        },
        socialSecurity: {
            bendPoints: { year: 2024, first: 1174, second: 7078 },
            taxableEarningsCap: 168600
        }
    };

    async function loadTaxParams() {
        if (window.__taxParams) {
            return window.__taxParams;
        }

        try {
            const response = await fetch('/data/tax-params.json', { cache: 'no-store' });
            if (response.ok) {
                window.__taxParams = await response.json();
                applyLabels(window.__taxParams);
                return window.__taxParams;
            }
        } catch (error) {
            console.warn('[TaxParams] Failed to load data file, using fallback.', error);
        }

        window.__taxParams = fallback;
        applyLabels(window.__taxParams);
        return window.__taxParams;
    }

    function applyLabels(params) {
        if (!params || !params.metadata) {
            return;
        }
        const year = params.metadata.taxYear || 'N/A';
        const updated = params.metadata.lastUpdated || 'N/A';
        document.querySelectorAll('[data-tax-param="year"]').forEach((el) => {
            el.textContent = year;
        });
        document.querySelectorAll('[data-tax-param="updated"]').forEach((el) => {
            el.textContent = updated;
        });
    }

    window.TaxParams = {
        load: loadTaxParams,
        get: function() {
            return window.__taxParams || fallback;
        },
        applyLabels: applyLabels
    };
})();
