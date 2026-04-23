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

// The highly detailed kaleidoscope fractal generator
function drawPsychedelicFractal() {
    const cx = width / 2;
    const cy = height / 2;
    const segments = 12; // 12-fold sacred geometry symmetry
    const t = time * 0.0003;

    // Deep celestial void fade
    ctx.fillStyle = 'rgba(6, 14, 32, 0.12)'; 
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(cx, cy);
    
    // Mouse interaction subtly shifts the center perspective
    const dx = (mouseX - cx) * 0.05;
    const dy = (mouseY - cy) * 0.05;
    ctx.translate(dx, dy);

    ctx.globalCompositeOperation = 'lighter';

    // Core pulsing energy ring
    const pulse = Math.sin(t * 5) * 20;
    ctx.beginPath();
    ctx.arc(0, 0, 100 + pulse, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(140, 231, 255, 0.1)`;
    ctx.lineWidth = 4;
    ctx.stroke();

    // Kaleidoscope rendering
    for (let i = 0; i < segments; i++) {
        ctx.rotate((Math.PI * 2) / segments);
        
        ctx.beginPath();
        for (let j = 0; j < 60; j++) {
            // Complex parametric equation for intricate structures
            const rad = j * 15 + Math.sin(t + j * 0.1) * 80;
            const angle = Math.sin(t * 0.5 + j * 0.03) * 2.5;
            
            const x = rad * Math.cos(angle);
            const y = rad * Math.sin(angle);
            
            if (j === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        
        // Color palette: deep teals, ultraviolet, cyan
        // Base hue shifts slowly between cyan (190) and violet (270)
        const baseHue = 190 + (Math.sin(t * 0.5) + 1) * 40; 
        const hue = (baseHue + i * 5 + t * 50) % 360;
        
        ctx.strokeStyle = `hsla(${hue}, 80%, 65%, 0.15)`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        // Data nodes (glowing dots) along the structural lines
        for(let j = 5; j < 60; j += 8) {
            const rad = j * 15 + Math.sin(t + j * 0.1) * 80;
            const angle = Math.sin(t * 0.5 + j * 0.03) * 2.5;
            const nodeX = rad * Math.cos(angle);
            const nodeY = rad * Math.sin(angle);
            
            // Pulsing nodes
            const nodeSize = 1.5 + Math.sin(t * 10 + j) * 1.5;
            if (nodeSize > 0) {
                ctx.beginPath();
                ctx.arc(nodeX, nodeY, nodeSize, 0, Math.PI*2);
                ctx.fillStyle = `hsla(${(hue + 60) % 360}, 100%, 75%, 0.6)`;
                ctx.fill();
            }
        }

        // Inner secondary web (Biological/Synaptic connections)
        ctx.beginPath();
        for (let k = 0; k < 20; k++) {
            const rad2 = k * 25 + Math.cos(t * 2 + k * 0.2) * 30;
            const angle2 = Math.cos(t * 0.8 + k * 0.1) * 1.5;
            const x2 = rad2 * Math.cos(angle2);
            const y2 = rad2 * Math.sin(angle2);
            
            if (k === 0) ctx.moveTo(x2, y2);
            else ctx.lineTo(x2, y2);
        }
        ctx.strokeStyle = `hsla(${(baseHue + 120) % 360}, 70%, 50%, 0.08)`; // Deep Teal
        ctx.lineWidth = 2;
        ctx.stroke();
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
