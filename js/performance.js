/**
 * Performance monitoring for Core Web Vitals
 * Sends metrics to GA4 when available
 */
(function() {
    'use strict';

    function sendToGA4(metricName, value, labels = {}) {
        if (typeof gtag === 'function') {
            gtag('event', metricName, {
                value: Math.round(value),
                event_category: 'Web Vitals',
                event_label: labels.id || 'unknown',
                non_interaction: true
            });
        }
    }

    function reportWebVitals() {
        if (!window.PerformanceObserver || !window.performance) return;

        // Largest Contentful Paint (LCP)
        try {
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                if (lastEntry) {
                    sendToGA4('LCP', lastEntry.startTime, { id: lastEntry.entryType });
                }
            });
            lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
        } catch (e) {}

        // First Input Delay (FID)
        try {
            const fidObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                    sendToGA4('FID', entry.processingStart - entry.startTime, { id: entry.name });
                });
            });
            fidObserver.observe({ type: 'first-input', buffered: true });
        } catch (e) {}

        // Cumulative Layout Shift (CLS)
        try {
            let clsValue = 0;
            const clsObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (!entry.hadRecentInput) clsValue += entry.value;
                }
                sendToGA4('CLS', clsValue, { id: 'cls' });
            });
            clsObserver.observe({ type: 'layout-shift', buffered: true });
        } catch (e) {}
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', reportWebVitals);
    } else {
        reportWebVitals();
    }
})();
