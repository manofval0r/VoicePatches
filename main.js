// Main interactive behavior: accordion, lazy Three.js loader, contact form handling, and Scroll Animations
document.addEventListener('DOMContentLoaded', () => {
    // Scroll Reveal Observer
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: stop observing once revealed
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal-on-scroll').forEach(el => revealObserver.observe(el));
});

// Utility: Check if Three.js is loaded
function ensureThree() {
    if (window.THREE) return Promise.resolve();
    return new Promise((resolve, reject) => {
        // Wait a bit in case it's still parsing
        if (window.THREE) resolve();
        else {
            // Fallback retry
            setTimeout(() => {
                if (window.THREE) resolve();
                else reject(new Error('Three.js not loaded'));
            }, 1000);
        }
    });
}

// High-level helper to create short, low-cost scenes with cleanup
const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function createScene(container, setupFn, duration = 5000) {
    if (!container) return;
    if (prefersReducedMotion) { showFallback(container); return Promise.resolve(); }

    return ensureThree().then(() => {
        try {
            const width = container.clientWidth || 200;
            const height = container.clientHeight || 120;
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
            renderer.setSize(width, height);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
            container.innerHTML = '';
            container.appendChild(renderer.domElement);

            const ambient = new THREE.AmbientLight(0xffffff, 0.6);
            scene.add(ambient);
            const light = new THREE.DirectionalLight(0xffffff, 0.8);
            light.position.set(4, 4, 4);
            scene.add(light);

            camera.position.z = 4;

            const ctx = setupFn ? setupFn(scene, camera) : null;

            let running = true;
            const start = performance.now();

            function animate(now) {
                if (!running) return;
                const t = (now - start) / 1000; // seconds
                if (ctx && typeof ctx.update === 'function') ctx.update(t);
                renderer.render(scene, camera);
                requestAnimationFrame(animate);
            }

            requestAnimationFrame(animate);

            function handleResize() {
                const w = container.clientWidth || 200;
                const h = container.clientHeight || 120;
                renderer.setSize(w, h);
                camera.aspect = w / h;
                camera.updateProjectionMatrix();
            }

            window.addEventListener('resize', handleResize);

            // Stop and cleanup after duration (if duration <= 0, keep running until stopped)
            let timeout = null;
            function cleanup() {
                running = false;
                if (ctx && typeof ctx.dispose === 'function') ctx.dispose();
                try { renderer.dispose(); } catch (e) { /* ignore */ }
                if (renderer.domElement && renderer.domElement.parentElement === container) {
                    container.removeChild(renderer.domElement);
                }
                window.removeEventListener('resize', handleResize);
            }
            if (duration && duration > 0) {
                timeout = setTimeout(() => cleanup(), duration + 150);
            }

            return { stop: () => { if (timeout) clearTimeout(timeout); cleanup(); } };
        } catch (err) {
            console.error("Three.js Scene Error:", err);
            showFallback(container);
        }
    }).catch((e) => {
        console.error("Three.js Load/Promise Error:", e);
        showFallback(container);
    });
}

// Object Naming scene: therapist passes an apple to client; subtle airflow bubble at the end
function createObjectNamingScene(container) {
    return createScene(container, (scene) => {
        const therapistGeo = new THREE.SphereGeometry(0.35, 8, 8);
        const clientGeo = therapistGeo.clone();
        const appleGeo = new THREE.SphereGeometry(0.15, 8, 8);

        const therapistMat = new THREE.MeshStandardMaterial({ color: 0x34C759, roughness: 0.7 });
        const clientMat = new THREE.MeshStandardMaterial({ color: 0x0A84FF, roughness: 0.7 });
        const appleMat = new THREE.MeshStandardMaterial({ color: 0xFF3B30, roughness: 0.6, metalness: 0.1 });
        const bubbleMat = new THREE.MeshStandardMaterial({ color: 0x34C759, transparent: true, opacity: 0.18 });

        const therapist = new THREE.Mesh(therapistGeo, therapistMat);
        therapist.position.x = -1.2;
        const client = new THREE.Mesh(clientGeo, clientMat);
        client.position.x = 1.2;
        const apple = new THREE.Mesh(appleGeo, appleMat);
        apple.position.set(-1.6, -0.2, 0);
        const bubble = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), bubbleMat);
        bubble.position.set(1.3, 0.2, 0);
        bubble.scale.set(0.001, 0.001, 0.001);
        bubble.position.set(1.3, 0.2, 0);
        bubble.scale.set(0.001, 0.001, 0.001);

        scene.add(therapist, client, apple, bubble);

        function update(t) {
            // t grows from 0; move apple across over first ~2.2s
            const moveProgress = Math.min(1, t / 2.2);
            apple.position.x = -1.6 + moveProgress * 3.2;
            apple.position.y = -0.2 + Math.sin(moveProgress * Math.PI) * 0.08;

            // bubble appears as apple arrives and pulses
            const bubbleProgress = Math.max(0, (t - 2.2));
            if (bubbleProgress > 0) {
                const s = 0.8 + Math.sin(bubbleProgress * 6) * 0.12;
                bubble.scale.set(s, s, s);
                bubble.material.opacity = Math.max(0.08, 0.18 - bubbleProgress * 0.12);
                bubble.position.y = 0.2 + bubbleProgress * 0.12;
            }
        }

        function dispose() {
            [therapistGeo, clientGeo, appleGeo].forEach(g => g.dispose && g.dispose());
            [therapistMat, clientMat, appleMat, bubbleMat].forEach(m => m.dispose && m.dispose());
        }

        return { update, dispose };
    }, 5200);
}

// Breathing scene: lungs inflate/deflate, a gentle voice bubble on exhale
function createBreathingScene(container) {
    return createScene(container, (scene) => {
        const lungGeo = new THREE.SphereGeometry(0.9, 12, 12);
        const lungMat = new THREE.MeshStandardMaterial({ color: 0x34C759, roughness: 0.75 });
        const lungs = new THREE.Mesh(lungGeo, lungMat);
        lungs.scale.set(0.9, 0.9, 0.9);
        scene.add(lungs);

        const bubbleGeo = new THREE.SphereGeometry(0.12, 8, 8);
        const bubbleMat = new THREE.MeshStandardMaterial({ color: 0x0A84FF, transparent: true, opacity: 0.9 });
        const bubble = new THREE.Mesh(bubbleGeo, bubbleMat);
        bubble.position.set(0, -0.4, 0);
        scene.add(bubble);

        let cycle = 0;
        function update(t) {
            // breathing: 3-4 second cycles
            cycle = Math.sin(t * Math.PI * 0.8) * 0.15 + 1.0;
            lungs.scale.y = cycle;

            // voice bubble rises modestly and fades
            const bubblePhase = (t % 2.5) / 2.5;
            bubble.position.y = -0.4 + bubblePhase * 0.9;
            bubble.material.opacity = 0.9 * (1 - bubblePhase);
            if (bubble.position.y > 0.55) {
                bubble.position.y = -0.4; // reset
            }
        }

        function dispose() {
            lungGeo.dispose(); lungMat.dispose(); bubbleGeo.dispose(); bubbleMat.dispose();
        }

        return { update, dispose };
    }, 5200);
}

// Mirror practice scene: mirrored articulatory shapes with small movements
function createMirrorScene(container) {
    return createScene(container, (scene) => {
        const lipGeo = new THREE.BoxGeometry(0.5, 0.15, 0.05);
        const lipMat = new THREE.MeshStandardMaterial({ color: 0xd9c0b8, roughness: 0.8 });

        const left = new THREE.Mesh(lipGeo, lipMat);
        left.position.set(-0.6, 0, 0);
        const right = new THREE.Mesh(lipGeo, lipMat);
        right.position.set(0.6, 0, 0);

        scene.add(left, right);

        function update(t) {
            const a = 0.75 + Math.abs(Math.sin(t * 4)) * 0.4; // open/close
            left.scale.y = a;
            right.scale.y = a * (0.95 + Math.sin(t * 6) * 0.05); // slight phase shift
        }

        function dispose() {
            lipGeo.dispose(); lipMat.dispose();
        }

        return { update, dispose };
    }, 5200);
}

// Tongue Twisters: Letters flying out of a mouth location
function createTongueTwisterScene(container) {
    return createScene(container, (scene) => {
        const mouthGeo = new THREE.TorusGeometry(0.5, 0.05, 16, 32, Math.PI);
        const mouthMat = new THREE.MeshStandardMaterial({ color: 0xFF3B30, roughness: 0.5 });
        const mouth = new THREE.Mesh(mouthGeo, mouthMat);
        mouth.rotation.x = Math.PI;
        mouth.position.y = -0.2;
        scene.add(mouth);

        // Letters pool
        const letters = [];
        const letterGeo = new THREE.BoxGeometry(0.15, 0.15, 0.02);
        const letterMat = new THREE.MeshStandardMaterial({ color: 0x0A84FF });

        function spawnLetter() {
            const l = new THREE.Mesh(letterGeo, letterMat);
            l.position.set((Math.random() - 0.5) * 0.2, 0, 0);
            l.userData = {
                vel: new THREE.Vector3((Math.random() - 0.5) * 2, 1 + Math.random(), 0),
                rot: Math.random() * 0.2
            };
            scene.add(l);
            letters.push(l);
        }

        let time = 0;
        function update(t) {
            time += 0.016;
            // Spawn letters rapidly
            if (t > 0.5 && Math.random() < 0.15) spawnLetter();

            // Animate mouth
            mouth.scale.y = 1 + Math.sin(t * 15) * 0.3;

            // Update letters
            for (let i = letters.length - 1; i >= 0; i--) {
                const l = letters[i];
                l.position.addScaledVector(l.userData.vel, 0.016);
                l.rotation.z += l.userData.rot;
                if (l.position.y > 3 || Math.abs(l.position.x) > 3) {
                    scene.remove(l);
                    letters.splice(i, 1);
                }
            }
        }

        function dispose() {
            mouthGeo.dispose(); mouthMat.dispose(); letterGeo.dispose(); letterMat.dispose();
        }

        return { update, dispose };
    }, 5200);
}

// Facial Expressions: Abstract face shifting emotions
function createFacialExpressionScene(container) {
    return createScene(container, (scene) => {
        const headGeo = new THREE.SphereGeometry(1.2, 32, 32);
        const headMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.9, roughness: 0.2 });
        const head = new THREE.Mesh(headGeo, headMat);
        scene.add(head);

        // Eyes
        const eyeGeo = new THREE.SphereGeometry(0.12, 16, 16);
        const eyeMat = new THREE.MeshStandardMaterial({ color: 0x1C1C1E });
        const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
        const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
        leftEye.position.set(-0.4, 0.2, 1.05);
        rightEye.position.set(0.4, 0.2, 1.05);
        scene.add(leftEye, rightEye);

        // Mouth (Torus segment)
        const mouthGeo = new THREE.TorusGeometry(0.3, 0.04, 16, 32, Math.PI);
        const mouthMat = new THREE.MeshStandardMaterial({ color: 0x1C1C1E });
        const mouth = new THREE.Mesh(mouthGeo, mouthMat);
        mouth.position.set(0, -0.3, 1.1);
        scene.add(mouth);

        function update(t) {
            // Cycle emotions: 0-2s Neutral, 2-4s Happy, 4-6s Sad
            const cycle = t % 6;

            if (cycle < 2) {
                // Neutral
                mouth.rotation.z = 0;
                mouth.scale.set(1, 0.2, 1); // flat line
            } else if (cycle < 4) {
                // Happy
                mouth.rotation.z = Math.PI; // Smile up
                mouth.scale.set(1, 1, 1);
            } else {
                // Sad/Concerned
                mouth.rotation.z = 0; // Frown down
                mouth.scale.set(1, 1, 1);
            }

            // Subtle head float
            head.rotation.y = Math.sin(t * 0.5) * 0.1;
        }

        function dispose() {
            headGeo.dispose(); headMat.dispose(); eyeGeo.dispose(); eyeMat.dispose(); mouthGeo.dispose(); mouthMat.dispose();
        }

        return { update, dispose };
    }, 6000);
}

// Tongue Exercises: Tongue model doing specific movements
function createTongueExerciseScene(container) {
    return createScene(container, (scene) => {
        // Mouth frame (cylinder)
        const frameGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.5, 32, 1, true);
        const frameMat = new THREE.MeshBasicMaterial({ color: 0xcccccc, wireframe: true, transparent: true, opacity: 0.3 });
        const frame = new THREE.Mesh(frameGeo, frameMat);
        frame.rotation.x = Math.PI / 2;
        scene.add(frame);

        // Tongue (Capsule-like)
        const tongueGeo = new THREE.CapsuleGeometry(0.3, 0.8, 4, 8);
        const tongueMat = new THREE.MeshStandardMaterial({ color: 0xFF3B30, roughness: 0.4 });
        const tongue = new THREE.Mesh(tongueGeo, tongueMat);
        scene.add(tongue);

        function update(t) {
            // Circle movement
            const angle = t * 3;
            tongue.position.x = Math.cos(angle) * 0.4;
            tongue.position.y = Math.sin(angle) * 0.4;
            tongue.rotation.z = angle + Math.PI / 2;
        }

        function dispose() {
            frameGeo.dispose(); frameMat.dispose(); tongueGeo.dispose(); tongueMat.dispose();
        }

        return { update, dispose };
    }, 5200);
}

function showFallback(container) {
    container.innerHTML = '';
    const el = document.createElement('div');
    el.style.width = '100%';
    el.style.height = '100%';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.innerHTML = '<div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(90deg,#6aa6b9,#8ec3a7);animation:pulse 1.2s infinite"></div>';
    container.appendChild(el);
}

// Pulse keyframes injection for fallback
const styleSheet = document.createElement('style');
styleSheet.textContent = '@keyframes pulse {0% { transform: scale(0.9); opacity: 0.8 } 50% { transform: scale(1.05); opacity: 1 } 100% { transform: scale(0.9); opacity: 0.8 }}';
document.head.appendChild(styleSheet);

// Wire up play buttons (routes to optimized scenes)
let activeSceneRunner = null;
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.play-btn');
    if (!btn) return;
    const animation = btn.getAttribute('data-animation');
    const spot = document.querySelector(`.canvas-spot[data-for="${animation}"]`);
    if (!spot) return;

    // Prevent double clicks
    if (btn.disabled) return;

    // UI Feedback: Don't change text, just spin icon
    const icon = btn.querySelector('.material-symbols-outlined');
    const originalIcon = icon.textContent;
    icon.textContent = 'hourglass_empty'; // Loading/Playing state
    btn.disabled = true;

    const map = {
        'object-naming': createObjectNamingScene,
        'breathing': createBreathingScene,
        'mirror': createMirrorScene,
        'tongue-twisters': createTongueTwisterScene,
        'facial-expressions': createFacialExpressionScene,
        'tongue-exercises': createTongueExerciseScene
    };
    const createFn = map[animation] || ((c) => createScene(c, null, 5200));

    // Stop previous if running
    if (activeSceneRunner && typeof activeSceneRunner.stop === 'function') {
        activeSceneRunner.stop();
        activeSceneRunner = null;
    }

    // Start the scene
    createFn(spot).then(r => { activeSceneRunner = r; }).catch(() => { /* ignore */ });

    // Restore button after duration
    setTimeout(() => {
        icon.textContent = 'play_arrow'; // Reset to play
        btn.disabled = false;
        if (activeSceneRunner && typeof activeSceneRunner.stop === 'function') {
            activeSceneRunner.stop();
        }
        activeSceneRunner = null;
    }, 5400); // 5.4s duration
});

// Typing effect for elements with class .type-in (trigger when visible)
function typeElement(el) {
    const full = el.textContent.trim();
    if (!full) return;
    if (prefersReducedMotion) { /* show text instantly */ el.textContent = full; return; }
    el.textContent = '';
    el.classList.add('typing');
    let i = 0;
    function step() {
        el.textContent += full.charAt(i);
        i++;
        if (i < full.length) {
            const delay = 18 + Math.random() * 40;
            setTimeout(step, delay);
        } else {
            el.classList.remove('typing');
        }
    }
    step();
}

const typerObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const el = entry.target;
            if (!el.dataset.typed) {
                typeElement(el);
                el.dataset.typed = 'true';
            }
            obs.unobserve(el);
        }
    });
}, { threshold: 0.2 });

document.querySelectorAll('.type-in').forEach(el => {
    el.dataset.typed = el.dataset.typed || '';
    typerObserver.observe(el);
});

// Accordion behavior
document.querySelectorAll('.accordion-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        const panel = document.getElementById(btn.getAttribute('aria-controls'));
        btn.setAttribute('aria-expanded', String(!expanded));
        if (panel) panel.hidden = expanded;
    });
});

// Contact form handling (simple demonstration)
const form = document.getElementById('contact-form');
const status = document.getElementById('form-status');
if (form) {
    form.addEventListener('submit', (ev) => {
        ev.preventDefault();
        const data = new FormData(form);
        // Basic client-side validation
        if (!data.get('name') || !data.get('email') || !data.get('message')) {
            status.hidden = false;
            status.textContent = 'Please fill in all required fields.';
            return;
        }
        // Simulate send
        status.hidden = false;
        status.textContent = 'Sending...';
        setTimeout(() => {
            status.textContent = 'Thank you! We received your message.';
            form.reset();
            // Add a small animation hint
            status.classList.add('sent');
            setTimeout(() => status.classList.remove('sent'), 1200);
        }, 900);
    });
}

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Lazy-load about scene when in viewport
let aboutObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const container = document.getElementById('about-scene');
            createScene(container, (scene) => {
                // small ambient motion to make the hero visual calm
                const g = new THREE.IcosahedronGeometry(1.0, 0);
                const m = new THREE.MeshStandardMaterial({ color: 0x6aa6b9, roughness: 0.7 });
                const mesh = new THREE.Mesh(g, m);
                scene.add(mesh);
                return {
                    update: (t) => { mesh.rotation.y = t * 0.25; },
                    dispose: () => { g.dispose(); m.dispose(); }
                };
            }, 8000);
            aboutObserver.disconnect();
        }
    });
}, { root: null, threshold: 0.22 });
const aboutNode = document.getElementById('about-scene');
if (aboutNode) aboutObserver.observe(aboutNode);

// Hero scene using new Particles/Abstract medical look
// Replaces the old bars with a floating organic particle system
function createHeroScene(container) {
    // Clear previous if any
    if (!container) return Promise.resolve();
    container.innerHTML = '';

    return ensureThree().then(() => {
        const width = container.clientWidth;
        const height = container.clientHeight;
        const scene = new THREE.Scene();
        // Transparent background

        const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
        camera.position.z = 20;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        // Create particles
        const particleCount = 120;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 30; // x
            positions[i * 3 + 1] = (Math.random() - 0.5) * 20; // y
            positions[i * 3 + 2] = (Math.random() - 0.5) * 10; // z
            sizes[i] = Math.random();
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        // Custom shader material for soft glowing dots
        const material = new THREE.PointsMaterial({
            color: 0x34C759, // Medical green/blue
            size: 0.4,
            transparent: true,
            opacity: 0.6,
        });

        const particles = new THREE.Points(geometry, material);
        scene.add(particles);

        let animationId;
        const clock = new THREE.Clock();

        function animate() {
            animationId = requestAnimationFrame(animate);
            const t = clock.getElapsedTime();

            // Gentle wave motion
            const positions = particles.geometry.attributes.position.array;
            for (let i = 0; i < particleCount; i++) {
                // Modulate Y based on X and time
                const x = positions[i * 3];
                // positions[i*3+1] += Math.sin(t + x) * 0.01; 
                // Just rotate the whole system slightly
            }
            particles.rotation.y = t * 0.05;
            particles.rotation.z = Math.sin(t * 0.2) * 0.1;

            renderer.render(scene, camera);
        }
        animate();

        // Handle Resize
        function onResize() {
            const w = container.clientWidth;
            const h = container.clientHeight;
            renderer.setSize(w, h);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        }
        window.addEventListener('resize', onResize);

        return {
            stop: () => {
                cancelAnimationFrame(animationId);
                renderer.dispose();
                window.removeEventListener('resize', onResize);
            }
        };
    });
}

// Initialize Hero Scene on Load (or Scroll)
const heroContainer = document.getElementById('hero-scene');
if (heroContainer) {
    createHeroScene(heroContainer);
}

// Remove old hero observer code to avoid conflicts
// ... (removing lines 392-401 from original)

// Hero controls (removed legacy code)

// Theme toggle behavior
function applyTheme(theme) {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    try { localStorage.setItem('vp-theme', theme); } catch (e) { }
    const btn = document.getElementById('theme-toggle');
    if (btn) {
        btn.setAttribute('aria-pressed', String(theme === 'dark'));
        btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
        // keep tooltip/title in sync for sighted users
        btn.title = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
    }
}

(function initTheme() {
    const saved = localStorage.getItem('vp-theme');
    if (saved) applyTheme(saved);
    else {
        const prefers = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        applyTheme(prefers ? 'dark' : 'light');
    }
    const tbtn = document.getElementById('theme-toggle');
    if (tbtn) tbtn.addEventListener('click', () => {
        const isDark = document.documentElement.classList.contains('dark');
        applyTheme(isDark ? 'light' : 'dark');
    });
})();

// Contact form: submit to Formspree endpoint (progress + feedback)
const cf = document.getElementById('contact-form');
const cfStatus = document.getElementById('form-status');
if (cf) {
    cf.addEventListener('submit', async (ev) => {
        ev.preventDefault();
        const data = new FormData(cf);
        if (!data.get('name') || !data.get('email') || !data.get('message')) {
            cfStatus.hidden = false; cfStatus.textContent = 'Please fill in required fields.'; return;
        }
        cfStatus.hidden = false; cfStatus.textContent = 'Sending...';
        try {
            const res = await fetch(cf.action, { method: 'POST', body: data, headers: { 'Accept': 'application/json' } });
            if (res.ok) {
                cfStatus.textContent = 'Thank you — we received your message.';
                cf.reset();
            } else {
                cfStatus.textContent = 'Sorry, there was a problem sending your message.';
            }
        } catch (err) {
            cfStatus.textContent = 'Network error. Please try again.';
        }
        setTimeout(() => cfStatus.classList.add('sent'), 1200);
    });
}

