/**
 * Voicepatches Consult - Main Interactive Script
 * Features: Three.js Anatomical Models, Scroll Observers, Form Handling
 */

// 1. GLOBAL INITIALIZATION & THREE.JS CHECK
const heroContainer = document.getElementById('hero-scene');

window.addEventListener('load', () => {
    ensureThree().then(() => {
        console.log("Three.js ready. Initializing Hero...");
        if (heroContainer) createHeroScene(heroContainer);
    }).catch(err => console.error("Three.js failed to load:", err));
});

function ensureThree() {
    if (window.THREE) return Promise.resolve();
    return new Promise((resolve, reject) => {
        let attempts = 0;
        const interval = setInterval(() => {
            if (window.THREE) {
                clearInterval(interval);
                resolve();
            }
            if (attempts > 10) {
                clearInterval(interval);
                reject(new Error("Three.js timeout"));
            }
            attempts++;
        }, 100);
    });
}

// Set CSS var --header-height to the header's computed height so content clears the fixed header
function updateHeaderHeight() {
    const header = document.querySelector('.site-header');
    if (!header) return;
    const h = header.offsetHeight;
    document.documentElement.style.setProperty('--header-height', `${h}px`);
}

// Run on load and resize
window.addEventListener('load', updateHeaderHeight);
window.addEventListener('resize', updateHeaderHeight);
// Also run after DOMContentLoaded in case fonts/layout change
document.addEventListener('DOMContentLoaded', updateHeaderHeight);

// 2. SCROLL & UI OBSERVERS
document.addEventListener('DOMContentLoaded', () => {
    // Reveal sections on scroll
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.reveal-on-scroll').forEach(el => revealObserver.observe(el));

    // Footer Year
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
});

// 3. THREE.JS CORE ENGINE
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function createScene(container, setupFn, duration = 5200) {
    if (!container || prefersReducedMotion) {
        showFallback(container);
        return Promise.resolve({ stop: () => {} });
    }

    return ensureThree().then(() => {
        const width = container.clientWidth || 300;
        const height = container.clientHeight || 200;
        
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.z = 5;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        container.innerHTML = '';
        container.appendChild(renderer.domElement);

        // Lighting
        scene.add(new THREE.AmbientLight(0xffffff, 0.8));
        const dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.position.set(5, 5, 5);
        scene.add(dirLight);

        const ctx = setupFn(scene, camera);
        let running = true;
        const start = performance.now();

        function animate(now) {
            if (!running) return;
            const t = (now - start) / 1000;
            if (ctx && ctx.update) ctx.update(t);
            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        }
        requestAnimationFrame(animate);

        const cleanup = () => {
            running = false;
            if (ctx && ctx.dispose) ctx.dispose();
            renderer.dispose();
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
        };

        if (duration > 0) setTimeout(cleanup, duration);
        return { stop: cleanup };
    });
}

// 4. ANATOMICAL EXERCISE MODELS - REMOVED
// All 3D models have been replaced with professional AI-generated medical illustrations
// for better performance, accessibility, and visual consistency across devices.


// Tongue Twisters: Flying Phonemes
function createTongueTwisterScene(container) {
    return createScene(container, (scene) => {
        const particles = [];
        const geo = new THREE.BoxGeometry(0.2, 0.2, 0.05);
        const mat = new THREE.MeshStandardMaterial({ color: 0x0A84FF });

        return {
            update: (t) => {
                if (Math.random() > 0.8 && particles.length < 20) {
                    const p = new THREE.Mesh(geo, mat);
                    p.position.set(0, 0, 0);
                    p.userData.v = new THREE.Vector3((Math.random()-0.5)*0.1, Math.random()*0.1, (Math.random()-0.5)*0.1);
                    scene.add(p);
                    particles.push(p);
                }
                particles.forEach((p, i) => {
                    p.position.add(p.userData.v);
                    p.rotation.x += 0.1;
                    if (p.position.y > 2) {
                        scene.remove(p);
                        particles.splice(i, 1);
                    }
                });
            },
            dispose: () => { geo.dispose(); mat.dispose(); }
        };
    });
}

// Interactive NAV
window.onscroll = function() {
    const nav = document.querySelector('.glass-nav');
    if (window.scrollY > 50) {
        nav.style.padding = "10px 0";
        nav.style.width = "90%";
        nav.style.left = "5%";
        nav.style.top = "20px";
        nav.style.borderRadius = "50px";
    } else {
        nav.style.padding = "20px 0";
        nav.style.width = "100%";
        nav.style.left = "0";
        nav.style.top = "0";
        nav.style.borderRadius = "0";
    }
};

// 5. HERO SCENE (PARTICLE SYSTEM)
function createHeroScene(container) {
    const width = container.clientWidth;
    const height = container.clientHeight;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 15;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    const geo = new THREE.BufferGeometry();
    const count = 200;
    const pos = new Float32Array(count * 3);
    for(let i=0; i<count*3; i++) pos[i] = (Math.random() - 0.5) * 20;
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    const mat = new THREE.PointsMaterial({ color: 0xE33B2E, size: 0.15, transparent: true, opacity: 0.6 });
    const points = new THREE.Points(geo, mat);
    scene.add(points);

    function animate() {
        requestAnimationFrame(animate);
        points.rotation.y += 0.002;
        points.rotation.x += 0.001;
        renderer.render(scene, camera);
    }
    animate();
}

// 6. UI EVENT LISTENERS
let activeScene = null;
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.play-btn');
    if (!btn) return;

    const card = btn.closest('.service-card');
    const icon = btn.querySelector('.material-symbols-outlined');
    const type = btn.dataset.animation;
    const insightText = card.querySelector('.insight-text');

    if (card.classList.contains('playing')) {
        stopAllAnimations();
    } else {
        stopAllAnimations();
        card.classList.add('playing');
        icon.textContent = 'close';
        
        // --- INSIGHT LOGIC ---
        if (type === 'breathing') {
            runBreathingCycle(insightText);
        } else if (type === 'object-naming') {
            insightText.textContent = "Insight: Associating visual stimuli with phonemes builds neural pathways.";
        } else if (type === 'tongue-exercises') {
            insightText.textContent = "Insight: Strengthening the tongue tip improves 't', 'd', and 'l' clarity.";
        }
    }
});

function stopAllAnimations() {
    document.querySelectorAll('.service-card').forEach(c => {
        c.classList.remove('playing');
        const btnIcon = c.querySelector('.play-btn .material-symbols-outlined');
        if (btnIcon) btnIcon.textContent = 'play_arrow';
    });
}

function runBreathingCycle(el) {
    let phases = ["Inhale deeply...", "Hold for 2s...", "Exhale slowly..."];
    let i = 0;
    el.textContent = phases[0];
    const timer = setInterval(() => {
        i++;
        if (i < phases.length) el.textContent = phases[i];
        else clearInterval(timer);
    }, 2000);
}

function showFallback(container) {
    container.innerHTML = '<div class="fallback-blob"></div>';
}

// Accordion & Theme Toggle (Condensed)
document.querySelectorAll('.accordion-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const state = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', !state);
        document.getElementById(btn.getAttribute('aria-controls')).hidden = state;
    });
});

const themeBtn = document.getElementById('theme-toggle');
if (themeBtn) {
    themeBtn.addEventListener('click', () => {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('vp-theme', isDark ? 'dark' : 'light');
    });
}
if (localStorage.getItem('vp-theme') === 'dark') document.documentElement.classList.add('dark');

// MOBILE MENU TOGGLE & SCROLL-AWARE HEADER
(function() {
    const mobileToggle = document.getElementById('mobileMenuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const headerEl = document.getElementById('siteHeader');
    if (mobileToggle && mobileMenu) {
        mobileToggle.addEventListener('click', () => {
            const open = mobileToggle.getAttribute('aria-expanded') === 'true';
            mobileToggle.setAttribute('aria-expanded', String(!open));
            mobileMenu.classList.toggle('open');
            mobileToggle.classList.toggle('open');
            document.documentElement.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
        });

        mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
            mobileMenu.classList.remove('open');
            mobileToggle.classList.remove('open');
            mobileToggle.setAttribute('aria-expanded','false');
            document.documentElement.style.overflow = '';
        }));

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
                mobileMenu.classList.remove('open');
                mobileToggle.classList.remove('open');
                mobileToggle.setAttribute('aria-expanded','false');
                document.documentElement.style.overflow = '';
            }
        });

        // Ensure menu closes if resizing to desktop width
        window.addEventListener('resize', () => {
            if (window.innerWidth > 900 && mobileMenu.classList.contains('open')) {
                mobileMenu.classList.remove('open');
                mobileToggle.classList.remove('open');
                mobileToggle.setAttribute('aria-expanded','false');
                document.documentElement.style.overflow = '';
            }
        });
    }

    // Navbar blur microinteraction on scroll
    const navElement = document.querySelector('.glass-nav');
    let scrollThreshold = 50;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > scrollThreshold) {
            navElement?.classList.add('scrolled');
        } else {
            navElement?.classList.remove('scrolled');
        }
    }, { passive: true });

    // scroll-aware header: hide on scroll down, show on scroll up
    let lastScroll = 0;
    const headerElement = document.querySelector('.site-header');
    window.addEventListener('scroll', () => {
        const current = window.scrollY;
        if (!headerElement) return;
        if (current > lastScroll && current > 120) {
            headerElement.classList.add('hidden');
        } else {
            headerElement.classList.remove('hidden');
        }
        lastScroll = current;
    }, { passive: true });
})();

// For cursor trail
const cursor = document.createElement('div');
cursor.className = 'custom-cursor';
document.body.appendChild(cursor);

document.addEventListener('mousemove', e => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
});