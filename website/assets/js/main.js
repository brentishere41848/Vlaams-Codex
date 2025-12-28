(function() {
    'use strict';

    initVercelAnalytics();

    document.addEventListener('DOMContentLoaded', function() {
        initMobileMenu();
        initSmoothScroll();
        initCopyCodeButtons();
        initDarkMode();
        initTooltips();
    });

    function initVercelAnalytics() {
        try {
            if (typeof window === 'undefined') return;
            import('https://cdn.jsdelivr.net/npm/@vercel/analytics/+esm')
                .then(({ inject }) => {
                    if (typeof inject === 'function') inject();
                })
                .catch(() => {});
        } catch {
            // ignore
        }
    }

    function initMobileMenu() {
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        const navCenter = document.querySelector('.nav-center');

        if (mobileMenuToggle && navCenter) {
            mobileMenuToggle.addEventListener('click', function() {
                this.classList.toggle('active');
                navCenter.classList.toggle('active');
            });

            document.addEventListener('click', function(e) {
                if (!mobileMenuToggle.contains(e.target) && !navCenter.contains(e.target)) {
                    mobileMenuToggle.classList.remove('active');
                    navCenter.classList.remove('active');
                }
            });
        }
    }

    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;

                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();
                    const headerOffset = 80;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });

                    document.querySelectorAll('.nav-menu a').forEach(link => {
                        link.classList.remove('active');
                    });
                    this.classList.add('active');
                }
            });
        });
    }

    function initCopyCodeButtons() {
        document.querySelectorAll('.code-block').forEach(block => {
            const copyBtn = block.querySelector('.copy-btn');
            if (!copyBtn) return;

            const pre = block.querySelector('pre');
            if (!pre) return;

            copyBtn.addEventListener('click', function() {
                const text = pre.textContent;
                navigator.clipboard.writeText(text).then(() => {
                    const originalText = this.textContent;
                    this.textContent = '✓';
                    this.classList.add('copied');

                    setTimeout(() => {
                        this.textContent = originalText;
                        this.classList.remove('copied');
                    }, 2000);
                }).catch(err => {
                    console.error('Failed to copy:', err);
                });
            });
        });
    }

    function initDarkMode() {
        const toggle = document.querySelector('.dark-mode-toggle');
        if (!toggle) return;

        const savedTheme = localStorage.getItem('theme') || 'light';
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
        }

        toggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            const theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
            localStorage.setItem('theme', theme);
        });
    }

    function initTooltips() {
        document.querySelectorAll('.tooltip').forEach(tooltip => {
            tooltip.addEventListener('mouseenter', function() {
                const tooltipText = this.getAttribute('data-tooltip');
                if (tooltipText) {
                    this.style.cursor = 'help';
                }
            });
        });
    }

    function initAccordion() {
        document.querySelectorAll('.accordion-header').forEach(header => {
            header.addEventListener('click', function() {
                const content = this.nextElementSibling;
                const isActive = this.classList.contains('active');

                document.querySelectorAll('.accordion-header').forEach(h => {
                    h.classList.remove('active');
                    h.nextElementSibling.classList.remove('active');
                });

                if (!isActive) {
                    this.classList.add('active');
                    content.classList.add('active');
                }
            });
        });
    }

    function initTabs() {
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', function() {
                const tabGroup = this.closest('.tabs');
                const targetId = this.getAttribute('data-tab');

                tabGroup.querySelectorAll('.tab').forEach(t => {
                    t.classList.remove('active');
                });

                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });

                this.classList.add('active');
                const targetContent = document.getElementById(targetId);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });
    }

    function initModal() {
        const modals = document.querySelectorAll('.modal');

        document.querySelectorAll('[data-modal]').forEach(trigger => {
            trigger.addEventListener('click', function(e) {
                e.preventDefault();
                const modalId = this.getAttribute('data-modal');
                const modal = document.getElementById(modalId);
                if (modal) {
                    modal.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            });
        });

        modals.forEach(modal => {
            const closeBtn = modal.querySelector('.modal-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', function() {
                    modal.classList.remove('active');
                    document.body.style.overflow = '';
                });
            }

            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    modal.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        });
    }

    function initLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (!loadingScreen) return;
    }

    function showLoadingScreen(callback) {
        const loadingScreen = document.getElementById('loadingScreen');
        if (!loadingScreen) return;

        loadingScreen.classList.add('active');
        setTimeout(() => {
            loadingScreen.classList.remove('active');
            if (callback) callback();
        }, 800);
    }

    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    window.VlaamsCodex = {
        initAccordion,
        initTabs,
        initModal,
        showToast,
        showLoadingScreen
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = window.VlaamsCodex;
    }
})();
