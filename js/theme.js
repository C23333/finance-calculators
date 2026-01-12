/**
 * Theme Manager for FinCalc
 * Supports: light, dark, auto (system preference)
 * Persists user preference in localStorage
 */

const ThemeManager = {
    STORAGE_KEY: 'fincalc-theme',
    THEMES: ['light', 'dark', 'auto'],

    /**
     * Initialize theme system
     */
    init() {
        // Apply saved theme or detect system preference
        const savedTheme = localStorage.getItem(this.STORAGE_KEY);

        if (savedTheme && this.THEMES.includes(savedTheme)) {
            this.setTheme(savedTheme, false);
        } else {
            this.setTheme('auto', false);
        }

        // Listen for system preference changes
        this.watchSystemPreference();

        // Create toggle button if not exists
        this.createToggleButton();

        // Add keyboard shortcut (Ctrl/Cmd + Shift + L)
        this.addKeyboardShortcut();
    },

    /**
     * Get current effective theme (resolves 'auto' to actual theme)
     */
    getEffectiveTheme() {
        const theme = document.documentElement.getAttribute('data-theme') || 'auto';
        if (theme === 'auto') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return theme;
    },

    /**
     * Get stored theme preference
     */
    getStoredTheme() {
        return localStorage.getItem(this.STORAGE_KEY) || 'auto';
    },

    /**
     * Set theme
     * @param {string} theme - 'light', 'dark', or 'auto'
     * @param {boolean} save - Whether to save to localStorage
     */
    setTheme(theme, save = true) {
        if (!this.THEMES.includes(theme)) {
            console.warn(`Invalid theme: ${theme}`);
            return;
        }

        // Set data attribute
        document.documentElement.setAttribute('data-theme', theme);

        // Apply effective theme class for CSS
        const effectiveTheme = theme === 'auto'
            ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
            : theme;

        document.documentElement.setAttribute('data-effective-theme', effectiveTheme);

        // Update meta theme-color for mobile browsers
        this.updateMetaThemeColor(effectiveTheme);

        // Save preference
        if (save) {
            localStorage.setItem(this.STORAGE_KEY, theme);
        }

        // Update toggle button
        this.updateToggleButton(theme);

        // Dispatch event for other components
        document.dispatchEvent(new CustomEvent('themechange', {
            detail: { theme, effectiveTheme }
        }));
    },

    /**
     * Cycle through themes: light -> dark -> auto -> light
     */
    cycle() {
        const current = this.getStoredTheme();
        const currentIndex = this.THEMES.indexOf(current);
        const nextIndex = (currentIndex + 1) % this.THEMES.length;
        this.setTheme(this.THEMES[nextIndex]);
    },

    /**
     * Toggle between light and dark (ignores auto)
     */
    toggle() {
        const effective = this.getEffectiveTheme();
        this.setTheme(effective === 'dark' ? 'light' : 'dark');
    },

    /**
     * Watch for system preference changes
     */
    watchSystemPreference() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        mediaQuery.addEventListener('change', (e) => {
            const storedTheme = this.getStoredTheme();
            if (storedTheme === 'auto') {
                const effectiveTheme = e.matches ? 'dark' : 'light';
                document.documentElement.setAttribute('data-effective-theme', effectiveTheme);
                this.updateMetaThemeColor(effectiveTheme);
                this.updateToggleButton('auto');

                document.dispatchEvent(new CustomEvent('themechange', {
                    detail: { theme: 'auto', effectiveTheme }
                }));
            }
        });
    },

    /**
     * Update meta theme-color for mobile browsers
     */
    updateMetaThemeColor(theme) {
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');

        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }

        metaThemeColor.content = theme === 'dark' ? '#0f172a' : '#ffffff';
    },

    /**
     * Create theme toggle button in header
     */
    createToggleButton() {
        // Check if button already exists
        if (document.querySelector('.theme-toggle')) return;

        const navControls = document.querySelector('.nav-controls');
        const nav = document.querySelector('header nav');
        if (!navControls && !nav) return;

        const button = document.createElement('button');
        button.className = 'theme-toggle';
        button.setAttribute('aria-label', 'Toggle theme');
        button.setAttribute('title', 'Toggle theme (Ctrl+Shift+L)');
        button.innerHTML = `
            <svg class="theme-icon sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
            <svg class="theme-icon moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
            <svg class="theme-icon auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 2a10 10 0 0 1 0 20V2z" fill="currentColor" opacity="0.3"></path>
                <circle cx="12" cy="12" r="3"></circle>
            </svg>
        `;

        button.addEventListener('click', () => this.cycle());

        // Insert into nav-controls if available, otherwise append to nav
        if (navControls) {
            navControls.appendChild(button);
        } else if (nav) {
            nav.appendChild(button);
        }

        this.updateToggleButton(this.getStoredTheme());
    },

    /**
     * Update toggle button appearance
     */
    updateToggleButton(theme) {
        const button = document.querySelector('.theme-toggle');
        if (!button) return;

        button.setAttribute('data-theme', theme);

        const labels = {
            light: 'Light mode (click for dark)',
            dark: 'Dark mode (click for auto)',
            auto: 'Auto mode (click for light)'
        };

        button.setAttribute('aria-label', labels[theme] || 'Toggle theme');
    },

    /**
     * Add keyboard shortcut
     */
    addKeyboardShortcut() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Shift + L
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'L') {
                e.preventDefault();
                this.cycle();
            }
        });
    }
};

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ThemeManager.init());
} else {
    ThemeManager.init();
}

// Prevent flash of wrong theme
(function() {
    const theme = localStorage.getItem('fincalc-theme') || 'auto';
    const effective = theme === 'auto'
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : theme;
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-effective-theme', effective);
})();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
}

window.ThemeManager = ThemeManager;
