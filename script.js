/* ====================================
   THE NEURAL OBSERVATORY — Quantum Archive
   Fractal Engine + Interactions
   ==================================== */

// ---- FRACTAL CANVAS (DMT / Sci-Fi Scientist Vibe) ----
const canvas = document.getElementById('fractal-canvas');
const ctx = canvas.getContext('2d');
let width, height, time = 0, mouseX = 0, mouseY = 0;

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}
window.addEventListener('resize', resize);
resize();

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

function drawPsychedelicFractal() {
    const cx = width / 2;
    const cy = height / 2;
    
    // Constant zooming parameters
    const S = 2; // Perfect geometric scaling factor
    const zoomSpeed = 0.0004;
    const t = time * zoomSpeed;
    const progress = t % 1; // Continuous progress from 0 to 1
    
    // Solid dark background to emphasize clean, precise mathematical lines
    ctx.fillStyle = 'rgba(4, 8, 20, 1)'; 
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(cx, cy);
    
    // Smooth, slow global rotation
    ctx.rotate(time * 0.0001);
    
    // Mouse interaction subtly shifts the center perspective
    const dx = (mouseX - cx) * 0.05;
    const dy = (mouseY - cy) * 0.05;
    ctx.translate(dx, dy);

    ctx.globalCompositeOperation = 'screen';
    
    // Number of layers to ensure the screen is completely covered from center pixel to far off-screen
    const minLayer = -8;
    const maxLayer = 6;
    
    // Base radius of the math annulus geometry
    const R = 150;
    
    for (let layer = minLayer; layer <= maxLayer; layer++) {
        const continuousLayer = layer + progress;
        const scale = Math.pow(S, continuousLayer);
        
        // Alpha blending to fade in at the microscopic center and fade out at the massive edge
        const normalizedDepth = (continuousLayer - minLayer) / (maxLayer - minLayer); 
        const alpha = Math.pow(Math.sin(normalizedDepth * Math.PI), 1.5); // Smooth fade
        
        if (alpha <= 0.01) continue; // Optimization

        ctx.save();
        ctx.scale(scale, scale);
        
        // Keep physical line width perfectly crisp and constant (1.5 pixels) regardless of scale
        ctx.lineWidth = 1.5 / scale;
        
        // Rainbow hue progression across the mathematical layers
        const hue = (continuousLayer * 45 - time * 0.02) % 360;

        // ---- LAYER GEOMETRY (Defined perfectly in the annulus between R/2 and R) ----
        
        // 1. Bounding Circle at R (perfectly overlaps the R/2 circle of the next macro layer)
        ctx.beginPath();
        ctx.arc(0, 0, R, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${alpha * 0.5})`;
        ctx.stroke();

        // 2. Mathematically Exact 12-Fold Polar Wave (Spirograph)
        // Oscillates perfectly between R/2 and R
        ctx.beginPath();
        for (let i = 0; i <= 360; i += 2) {
            const theta = i * Math.PI / 180;
            const rad = R * 0.75 + R * 0.25 * Math.cos(12 * theta + time * 0.001);
            if (i === 0) ctx.moveTo(rad * Math.cos(theta), rad * Math.sin(theta));
            else ctx.lineTo(rad * Math.cos(theta), rad * Math.sin(theta));
        }
        ctx.closePath();
        ctx.strokeStyle = `hsla(${(hue + 60) % 360}, 90%, 65%, ${alpha * 0.8})`;
        ctx.stroke();

        // 3. Counter-Rotating Inner Polar Wave
        ctx.beginPath();
        for (let i = 0; i <= 360; i += 2) {
            const theta = i * Math.PI / 180;
            const rad = R * 0.75 + R * 0.25 * Math.sin(12 * theta - time * 0.0015);
            if (i === 0) ctx.moveTo(rad * Math.cos(theta), rad * Math.sin(theta));
            else ctx.lineTo(rad * Math.cos(theta), rad * Math.sin(theta));
        }
        ctx.closePath();
        ctx.strokeStyle = `hsla(${(hue + 120) % 360}, 90%, 65%, ${alpha * 0.8})`;
        ctx.stroke();

        // 4. 12 Intersecting Circles (Flower of Life geometry)
        // Centered exactly at R/2, with radius R/2. They pass precisely through (0,0) and touch R.
        ctx.beginPath();
        for (let i = 0; i < 12; i++) {
            const angle = i * Math.PI / 6;
            const cx_circle = (R / 2) * Math.cos(angle);
            const cy_circle = (R / 2) * Math.sin(angle);
            ctx.moveTo(cx_circle + R/2, cy_circle);
            ctx.arc(cx_circle, cy_circle, R / 2, 0, Math.PI * 2);
        }
        ctx.strokeStyle = `hsla(${(hue + 180) % 360}, 70%, 55%, ${alpha * 0.4})`;
        ctx.stroke();

        // 5. 12-Pointed Star Polygon (Zig-zag connecting R/2 and R)
        ctx.beginPath();
        for (let i = 0; i < 12; i++) {
            const a1 = i * Math.PI / 6;
            const a2 = (i + 0.5) * Math.PI / 6;
            const a3 = (i + 1) * Math.PI / 6;
            ctx.moveTo((R / 2) * Math.cos(a1), (R / 2) * Math.sin(a1));
            ctx.lineTo(R * Math.cos(a2), R * Math.sin(a2));
            ctx.lineTo((R / 2) * Math.cos(a3), (R / 2) * Math.sin(a3));
        }
        ctx.strokeStyle = `hsla(${(hue + 240) % 360}, 80%, 65%, ${alpha * 0.6})`;
        ctx.stroke();

        // 6. Precise Radial Grid Lines connecting the inner and outer boundaries
        ctx.beginPath();
        for (let i = 0; i < 12; i++) {
            const angle = i * Math.PI / 6;
            ctx.moveTo((R / 2) * Math.cos(angle), (R / 2) * Math.sin(angle));
            ctx.lineTo(R * Math.cos(angle), R * Math.sin(angle));
        }
        ctx.strokeStyle = `hsla(${(hue + 300) % 360}, 60%, 50%, ${alpha * 0.5})`;
        ctx.stroke();

        // 7. Glowing Data Nodes at intersections (at radius R)
        ctx.beginPath();
        for (let i = 0; i < 12; i++) {
            const angle = (i + 0.5) * Math.PI / 6;
            ctx.moveTo(R * Math.cos(angle) + 2.5/scale, R * Math.sin(angle));
            ctx.arc(R * Math.cos(angle), R * Math.sin(angle), 2.5 / scale, 0, Math.PI * 2);
        }
        ctx.fillStyle = `hsla(${hue}, 100%, 75%, ${alpha * 0.9})`;
        ctx.fill();

        ctx.restore();
    }
    
    ctx.restore();
}

function animate() {
    drawPsychedelicFractal();
    time += 16;
    requestAnimationFrame(animate);
}

animate();

// ---- SLIDESHOW ----
function initSlideshows() {
    document.querySelectorAll('.slideshow-container').forEach(container => {
        let idx = 1;
        const slides = container.querySelectorAll('.slide');
        const prev = container.querySelector('.slide-prev');
        const next = container.querySelector('.slide-next');
        const counter = container.parentElement.querySelector('.slide-counter');

        function show(n) {
            if (n > slides.length) idx = 1;
            if (n < 1) idx = slides.length;
            slides.forEach(s => s.classList.remove('active'));
            slides[idx - 1].classList.add('active');
            if (counter) counter.textContent = `ARTIFACT ${idx} // ${slides.length}`;
        }

        if (prev) prev.addEventListener('click', () => show(idx -= 1));
        if (next) next.addEventListener('click', () => show(idx += 1));
        if (slides.length) show(idx);
    });
}

// ---- SCROLL ANIMATIONS ----
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

// ---- HAMBURGER MENU ----
function initHamburger() {
    const btn = document.querySelector('.hamburger');
    const links = document.querySelector('.nav-links');
    if (btn && links) {
        btn.addEventListener('click', () => {
            links.classList.toggle('open');
        });
    }
}

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
    initSlideshows();
    initScrollAnimations();
    initHamburger();
});

// Deployment nudge: 2026-04-23T16:16:30Z
