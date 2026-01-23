/**
 * Share Buttons Module
 * Social sharing functionality with copy link and toast notifications
 */

(function() {
    'use strict';

    // Configuration
    const TOAST_DURATION = 3000;

    // Share URLs
    const SHARE_URLS = {
        twitter: (url, title) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
        facebook: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        linkedin: (url, title) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
        email: (url, title) => `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Check out this article: ${url}`)}`
    };

    // State
    let toastContainer = null;

    /**
     * Initialize share buttons
     */
    function init() {
        setupShareButtons();
        createToastContainer();
    }

    /**
     * Setup share button event listeners
     */
    function setupShareButtons() {
        document.addEventListener('click', (e) => {
            const shareBtn = e.target.closest('.share-btn');
            if (!shareBtn) return;

            e.preventDefault();

            const platform = shareBtn.dataset.platform;
            const url = shareBtn.dataset.url || window.location.href;
            const title = shareBtn.dataset.title || document.title;

            if (platform === 'copy') {
                copyToClipboard(url);
            } else if (platform === 'native' && navigator.share) {
                nativeShare(url, title);
            } else {
                openShareWindow(platform, url, title);
            }
        });
    }

    /**
     * Open share window for a platform
     */
    function openShareWindow(platform, url, title) {
        const shareUrl = SHARE_URLS[platform];
        if (!shareUrl) return;

        const finalUrl = shareUrl(url, title);

        if (platform === 'email') {
            window.location.href = finalUrl;
            return;
        }

        const width = 600;
        const height = 400;
        const left = (window.innerWidth - width) / 2 + window.screenX;
        const top = (window.innerHeight - height) / 2 + window.screenY;

        window.open(
            finalUrl,
            'share',
            `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes`
        );

        // Track share event
        trackShare(platform);
    }

    /**
     * Use native share API
     */
    async function nativeShare(url, title) {
        try {
            await navigator.share({
                title: title,
                url: url
            });
            trackShare('native');
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Share failed:', err);
            }
        }
    }

    /**
     * Copy URL to clipboard
     */
    async function copyToClipboard(url) {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(url);
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = url;
                textArea.style.position = 'fixed';
                textArea.style.left = '-9999px';
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
            }

            showToast('Link copied to clipboard!', 'success');
            trackShare('copy');
        } catch (err) {
            showToast('Failed to copy link', 'error');
            console.error('Copy failed:', err);
        }
    }

    /**
     * Create toast container
     */
    function createToastContainer() {
        if (document.querySelector('.toast-container')) return;

        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    /**
     * Show toast notification
     */
    function showToast(message, type = 'info') {
        if (!toastContainer) createToastContainer();

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';

        toast.innerHTML = `
            <span class="toast-icon">${icon}</span>
            <span class="toast-message">${message}</span>
        `;

        toastContainer.appendChild(toast);

        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Remove after duration
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, TOAST_DURATION);
    }

    /**
     * Track share event (for analytics)
     */
    function trackShare(platform) {
        // Google Analytics 4
        if (typeof gtag === 'function') {
            gtag('event', 'share', {
                method: platform,
                content_type: 'article',
                item_id: window.location.pathname
            });
        }
    }

    /**
     * Generate share buttons HTML
     */
    function generateShareButtonsHtml(options = {}) {
        const {
            url = window.location.href,
            title = document.title,
            platforms = ['twitter', 'facebook', 'linkedin', 'email', 'copy'],
            layout = 'horizontal', // 'horizontal' or 'vertical'
            showLabels = false
        } = options;

        const icons = {
            twitter: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
            facebook: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
            linkedin: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
            email: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
            copy: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`
        };

        const labels = {
            twitter: 'Twitter',
            facebook: 'Facebook',
            linkedin: 'LinkedIn',
            email: 'Email',
            copy: 'Copy Link'
        };

        const buttons = platforms.map(platform => {
            const icon = icons[platform] || '';
            const label = labels[platform] || platform;

            return `
                <button class="share-btn share-btn-${platform}"
                        data-platform="${platform}"
                        data-url="${url}"
                        data-title="${title.replace(/"/g, '&quot;')}"
                        aria-label="Share on ${label}"
                        title="Share on ${label}">
                    ${icon}
                    ${showLabels ? `<span class="share-label">${label}</span>` : ''}
                </button>
            `;
        }).join('');

        return `
            <div class="share-buttons share-${layout}">
                <span class="share-title">Share</span>
                <div class="share-buttons-list">
                    ${buttons}
                </div>
            </div>
        `;
    }

    /**
     * Insert share buttons into a container
     */
    function insertShareButtons(container, options = ) {
        if (typeof container === 'string') {
            container = document.querySelector(container);
        }
        if (!container) return;

        container.innerHTML = generateShareButtonsHtml(options);
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose public API
    window.ShareButtons = {
        init,
        showToast,
        copyToClipboard,
        generateShareButtonsHtml,
        insertShareButtons,
        share: (platform, url, title) => {
            if (platform === 'copy') {
                copyToClipboard(url || window.location.href);
            } else {
                openShareWindow(platform, url || window.location.href, title || document.title);
            }
        }
    };
})();
