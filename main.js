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

// 4. ANATOMICAL EXERCISE MODELS

// Object Naming: A Realistic Apple
function createObjectNamingScene(container) {
    return createScene(container, (scene) => {
        const appleGroup = new THREE.Group();
        const bodyGeo = new THREE.IcosahedronGeometry(0.8, 3);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0xFF3B30, roughness: 0.4 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.scale.set(1, 0.85, 1);

        const stemGeo = new THREE.CylinderGeometry(0.04, 0.02, 0.4);
        const stemMat = new THREE.MeshStandardMaterial({ color: 0x5D4037 });
        const stem = new THREE.Mesh(stemGeo, stemMat);
        stem.position.y = 0.75;
        
        appleGroup.add(body, stem);
        scene.add(appleGroup);

        return {
            update: (t) => {
                appleGroup.rotation.y = t * 1.5;
                appleGroup.position.x = Math.sin(t) * 0.5;
                appleGroup.position.y = Math.cos(t * 2) * 0.2;
            },
            dispose: () => { bodyGeo.dispose(); stemGeo.dispose(); }
        };
    });
}

// Breathing: Expanding Lungs
function createBreathingScene(container) {
    return createScene(container, (scene) => {
        const lungs = new THREE.Group();
        const lungGeo = new THREE.CapsuleGeometry(0.4, 0.8, 4, 16);
        const lungMat = new THREE.MeshStandardMaterial({ color: 0xFFD23F, roughness: 0.6 });
        
        const left = new THREE.Mesh(lungGeo, lungMat);
        left.position.x = -0.45;
        left.rotation.z = 0.15;
        
        const right = new THREE.Mesh(lungGeo, lungMat);
        right.position.x = 0.45;
        right.rotation.z = -0.15;
        
        lungs.add(left, right);
        scene.add(lungs);

        return {
            update: (t) => {
                const scale = 1 + Math.sin(t * 2) * 0.2;
                lungs.scale.set(scale, scale, scale);
                left.rotation.z = 0.15 + (scale - 1) * 0.5;
                right.rotation.z = -0.15 - (scale - 1) * 0.5;
            },
            dispose: () => lungGeo.dispose()
        };
    });
}

// Tongue Exercises: Anatomical Mouth & Tongue
function createTongueExerciseScene(container) {
    return createScene(container, (scene) => {
        const lipGeo = new THREE.TorusGeometry(0.8, 0.08, 12, 48);
        const lipMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const lips = new THREE.Mesh(lipGeo, lipMat);
        lips.rotation.x = Math.PI / 2.2;
        scene.add(lips);

        const tongueGeo = new THREE.CapsuleGeometry(0.25, 0.6, 8, 16);
        const tongueMat = new THREE.MeshStandardMaterial({ color: 0xE33B2E });
        const tongue = new THREE.Mesh(tongueGeo, tongueMat);
        tongue.rotation.x = Math.PI / 2;
        scene.add(tongue);

        return {
            update: (t) => {
                tongue.position.x = Math.sin(t * 4) * 0.5;
                tongue.rotation.z = Math.sin(t * 4) * 0.3;
                tongue.position.z = Math.cos(t * 2) * 0.2;
            },
            dispose: () => { lipGeo.dispose(); tongueGeo.dispose(); }
        };
    });
}

// Mirror Therapy: Synchronized Mouths
function createMirrorScene(container) {
    return createScene(container, (scene, camera) => {
        camera.position.z = 4;
        const mouthGroup = new THREE.Group();
        const geo = new THREE.TorusGeometry(0.4, 0.05, 12, 32, Math.PI);
        const mat = new THREE.MeshStandardMaterial({ color: 0xffffff });
        
        const createMouth = (x) => {
            const g = new THREE.Group();
            const top = new THREE.Mesh(geo, mat);
            const bottom = new THREE.Mesh(geo, mat);
            bottom.rotation.z = Math.PI;
            g.add(top, bottom);
            g.position.x = x;
            return { g, top, bottom };
        };

        const left = createMouth(-0.8);
        const right = createMouth(0.8);
        scene.add(left.g, right.g);

        return {
            update: (t) => {
                const open = Math.abs(Math.sin(t * 3)) * 0.4;
                left.top.position.y = open;
                left.bottom.position.y = -open;
                right.top.position.y = open;
                right.bottom.position.y = -open;
            },
            dispose: () => geo.dispose()
        };
    });
}

// Facial Expressions: Smiling Face
function createFacialExpressionScene(container) {
    return createScene(container, (scene) => {
        const headGeo = new THREE.SphereGeometry(1, 32, 32);
        const headMat = new THREE.MeshStandardMaterial({ color: 0xFFD23F, roughness: 0.3 });
        const head = new THREE.Mesh(headGeo, headMat);
        scene.add(head);

        const eyeGeo = new THREE.SphereGeometry(0.1, 12, 12);
        const eyeMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
        const lEye = new THREE.Mesh(eyeGeo, eyeMat);
        lEye.position.set(-0.3, 0.3, 0.9);
        const rEye = lEye.clone();
        rEye.position.x = 0.3;
        scene.add(lEye, rEye);

        const smileGeo = new THREE.TorusGeometry(0.4, 0.04, 12, 32, Math.PI);
        const smile = new THREE.Mesh(smileGeo, eyeMat);
        smile.position.set(0, -0.2, 0.9);
        smile.rotation.z = Math.PI;
        scene.add(smile);

        return {
            update: (t) => {
                head.rotation.y = Math.sin(t) * 0.5;
                smile.scale.x = 1 + Math.sin(t * 2) * 0.2;
            },
            dispose: () => { headGeo.dispose(); eyeGeo.dispose(); smileGeo.dispose(); }
        };
    });
}

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

    const type = btn.dataset.animation;
    const spot = document.querySelector(`.canvas-spot[data-for="${type}"]`);
    const icon = btn.querySelector('.material-symbols-outlined');

    if (activeScene) activeScene.stop();
    
    btn.disabled = true;
    icon.textContent = 'motion_photos_on';

    const map = {
        'object-naming': createObjectNamingScene,
        'breathing': createBreathingScene,
        'mirror': createMirrorScene,
        'tongue-twisters': createTongueTwisterScene,
        'facial-expressions': createFacialExpressionScene,
        'tongue-exercises': createTongueExerciseScene
    };

    if (map[type]) {
        map[type](spot).then(runner => {
            activeScene = runner;
            setTimeout(() => {
                icon.textContent = 'play_arrow';
                btn.disabled = false;
            }, 5200);
        });
    }
});

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