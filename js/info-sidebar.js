/**
 * Info Sidebar - Toggle functionality
 * Handles opening/closing the educational content sidebar
 * Requirements: 4.2, 4.6, 5.4
 */

(function() {
    'use strict';

    // DOM elements
    let sidebar = null;
    let overlay = null;
    let toggleBtn = null;
    let closeBtn = null;

    /**
     * Initialize the sidebar functionality
     * Called when DOM is ready
     */
    function init() {
        sidebar = document.getElementById('infoSidebar');
        overlay = document.getElementById('sidebarOverlay');
        toggleBtn = document.querySelector('.info-toggle');
        closeBtn = document.querySelector('.info-sidebar-close');

        if (!sidebar || !overlay) {
            return; // Sidebar elements not present on this page
        }

        // Bind event listeners
        if (toggleBtn) {
            toggleBtn.addEventListener('click', toggleSidebar);
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', closeSidebar);
        }

        if (overlay) {
            overlay.addEventListener('click', closeSidebar);
        }

        // Keyboard support - close on Escape
        document.addEventListener('keydown', handleKeydown);
    }

    /**
     * Toggle sidebar open/close state
     */
    function toggleSidebar() {
        if (sidebar.classList.contains('open')) {
            closeSidebar();
        } else {
            openSidebar();
        }
    }

    /**
     * Open the sidebar
     * Updates ARIA states for accessibility
     */
    function openSidebar() {
        sidebar.classList.add('open');
        overlay.classList.add('active');
        
        // Update ARIA states
        sidebar.setAttribute('aria-hidden', 'false');
        if (toggleBtn) {
            toggleBtn.setAttribute('aria-expanded', 'true');
        }

        // Prevent body scroll when sidebar is open
        document.body.style.overflow = 'hidden';

        // Focus the close button for keyboard users
        if (closeBtn) {
            closeBtn.focus();
        }
    }

    /**
     * Close the sidebar
     * Updates ARIA states for accessibility
     */
    function closeSidebar() {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
        
        // Update ARIA states
        sidebar.setAttribute('aria-hidden', 'true');
        if (toggleBtn) {
            toggleBtn.setAttribute('aria-expanded', 'false');
        }

        // Restore body scroll
        document.body.style.overflow = '';

        // Return focus to toggle button for keyboard users
        if (toggleBtn) {
            toggleBtn.focus();
        }
    }

    /**
     * Handle keyboard events
     * Close sidebar on Escape key
     * @param {KeyboardEvent} event
     */
    function handleKeydown(event) {
        if (event.key === 'Escape' && sidebar && sidebar.classList.contains('open')) {
            closeSidebar();
        }
    }

    /**
     * Check if sidebar is currently open
     * @returns {boolean}
     */
    function isOpen() {
        return sidebar && sidebar.classList.contains('open');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose public API
    window.InfoSidebar = {
        open: openSidebar,
        close: closeSidebar,
        toggle: toggleSidebar,
        isOpen: isOpen
    };
})();
