/**
 * Voicepatches Consult - Main Interactive Script
 * Features: Scroll Observers, Form Handling, UI Interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. SCROLL REVEAL OBSERVER
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.reveal-on-scroll').forEach(el => revealObserver.observe(el));

    // 2. HEADER HEIGHT & SCROLL BEHAVIOR
    const updateHeaderHeight = () => {
        const header = document.querySelector('.site-header');
        if (header) {
            document.documentElement.style.setProperty('--header-height', `${header.offsetHeight}px`);
        }
    };

    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);

    let lastScroll = 0;
    const siteHeader = document.querySelector('.site-header');
    
    window.addEventListener('scroll', () => {
        const current = window.scrollY;
        if (!siteHeader) return;
        
        // Hide/Show header on scroll
        if (current > lastScroll && current > 120) {
            siteHeader.classList.add('hidden');
        } else {
            siteHeader.classList.remove('hidden');
        }
        
        // Glass effect on scroll
        if (current > 50) {
            siteHeader.classList.add('scrolled');
        } else {
            siteHeader.classList.remove('scrolled');
        }
        
        lastScroll = current;
    }, { passive: true });

    // 3. MOBILE MENU TOGGLE
    const mobileToggle = document.getElementById('mobileMenuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (mobileToggle && mobileMenu) {
        mobileToggle.addEventListener('click', () => {
            const isOpen = mobileToggle.getAttribute('aria-expanded') === 'true';
            mobileToggle.setAttribute('aria-expanded', String(!isOpen));
            mobileMenu.classList.toggle('open');
            mobileToggle.classList.toggle('open');
            document.body.style.overflow = !isOpen ? 'hidden' : '';
        });

        // Close on link click
        mobileMenu.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', () => {
                mobileMenu.classList.remove('open');
                mobileToggle.classList.remove('open');
                mobileToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });
    }

    // 4. ACCORDIONS
    document.querySelectorAll('.accordion-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const expanded = btn.getAttribute('aria-expanded') === 'true';
            btn.setAttribute('aria-expanded', !expanded);
            const panel = document.getElementById(btn.getAttribute('aria-controls'));
            if (panel) panel.hidden = expanded;
        });
    });

    // 5. THEME TOGGLE
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const isDark = document.documentElement.classList.toggle('dark');
            localStorage.setItem('vp-theme', isDark ? 'dark' : 'light');
        });
    }
    
    if (localStorage.getItem('vp-theme') === 'dark') {
        document.documentElement.classList.add('dark');
    }

    // 6. FORM HANDLING (SIMULATED)
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button');
            const originalText = btn.textContent;
            
            btn.textContent = 'Sending...';
            btn.disabled = true;
            
            // Simulate API call
            setTimeout(() => {
                btn.textContent = 'Message Sent!';
                contactForm.reset();
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.disabled = false;
                }, 3000);
            }, 1500);
        });
    }

    // 7. FOOTER YEAR
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
});