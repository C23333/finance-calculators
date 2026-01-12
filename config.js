/**
 * Site Configuration
 * Update these values after purchasing your domain
 */
const SITE_CONFIG = {
    // Replace with your actual domain (no trailing slash)
    domain: 'https://financecalc.cc',

    // Site name for branding
    siteName: 'FinCalc',

    // Google Analytics ID (get from analytics.google.com)
    // Format: G-XXXXXXXXXX
    googleAnalyticsId: '',

    // Google AdSense Publisher ID (get from adsense.google.com)
    // Format: ca-pub-XXXXXXXXXXXXXXXX
    adsensePublisherId: '',

    // Social media (optional)
    social: {
        twitter: '',
        facebook: ''
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SITE_CONFIG;
}
