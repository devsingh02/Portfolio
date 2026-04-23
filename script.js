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
    const segments = 12; // 12-fold sacred geometry symmetry
    const t = time * 0.00015; // Slowed down base time for smoother zooming

    // Deep celestial void fade (lower opacity for longer trails)
    ctx.fillStyle = 'rgba(6, 14, 32, 0.15)'; 
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(cx, cy);
    
    // Mouse interaction subtly shifts the center perspective
    const dx = (mouseX - cx) * 0.05;
    const dy = (mouseY - cy) * 0.05;
    ctx.translate(dx, dy);

    ctx.globalCompositeOperation = 'lighter';
    
    // Constant zooming loop using layered scaling
    const numLayers = 14; // More layers for denser geometry
    for (let layer = 0; layer < numLayers; layer++) {
        // Continuous progression from 0 to 1 for each layer
        const layerProgress = (layer / numLayers + t * 0.8) % 1; 
        
        // Exponential scale for endless zoom (from microscopic to massive)
        const scale = Math.pow(200, layerProgress); 
        
        // Smooth fade in and out based on progress (0 -> 1 -> 0)
        // Squaring the sine makes the fade sharper so the extremes are completely invisible
        const alpha = Math.pow(Math.sin(layerProgress * Math.PI), 1.5); 

        ctx.save();
        ctx.scale(scale, scale);
        // Slowly rotate layers in alternating directions for complex parallax
        const rotationDir = layer % 2 === 0 ? 1 : -1;
        ctx.rotate(t * 0.5 * rotationDir + layer * (Math.PI * 2 / numLayers));

        // Draw intricate symmetrical shapes
        for (let i = 0; i < segments; i++) {
            ctx.rotate((Math.PI * 2) / segments);
            
            // Dynamic colorful hues
            const baseHue = 190 + Math.sin(t * 2) * 60; 
            const hue = (baseHue + layerProgress * 360 + i * 10) % 360;
            
            // Draw main tendrils/branches
            ctx.beginPath();
            for (let j = 0; j < 12; j++) {
                // Intricate mathematical pattern
                const rad = 1 + j * 1.5; 
                // Wave motion along the tendril
                const angle = Math.sin(t * 3 + j * 0.3) * 0.5;
                const x = rad * Math.cos(angle);
                const y = rad * Math.sin(angle);
                if (j === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            
            // Keep line width consistent physically regardless of scale
            ctx.strokeStyle = `hsla(${hue}, 80%, 65%, ${alpha * 0.6})`;
            ctx.lineWidth = 1.2 / scale; 
            ctx.stroke();
            
            // Draw glowing data nodes at the ends
            const endRad = 1 + 11 * 1.5;
            const endAngle = Math.sin(t * 3 + 11 * 0.3) * 0.5;
            const nodeX = endRad * Math.cos(endAngle);
            const nodeY = endRad * Math.sin(endAngle);
            
            ctx.beginPath();
            // Physical radius of 2.5 pixels
            ctx.arc(nodeX, nodeY, 2.5 / scale, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${(hue + 60) % 360}, 100%, 75%, ${alpha * 0.9})`;
            ctx.fill();

            // Cross-connections to form a geometric web
            ctx.beginPath();
            // Start at a mid point on the current tendril
            const startRad = 1 + 6 * 1.5;
            const startAngle = Math.sin(t * 3 + 6 * 0.3) * 0.5;
            ctx.moveTo(startRad * Math.cos(startAngle), startRad * Math.sin(startAngle));
            
            // Connect to an inner point on the next tendril
            const nextSegmentAngle = (Math.PI * 2) / segments;
            const targetRad = 1 + 3 * 1.5;
            const targetAngleOffset = Math.sin(t * 3 + 3 * 0.3) * 0.5;
            const targetX = targetRad * Math.cos(nextSegmentAngle + targetAngleOffset);
            const targetY = targetRad * Math.sin(nextSegmentAngle + targetAngleOffset);
            ctx.lineTo(targetX, targetY);

            ctx.strokeStyle = `hsla(${(hue + 120) % 360}, 70%, 55%, ${alpha * 0.4})`;
            ctx.lineWidth = 0.8 / scale;
            ctx.stroke();

            // Add floating geometric diamonds
            const dRad = 1 + 4 * 1.5;
            const dAngle = Math.sin(t * 3 + 4 * 0.3) * 0.5;
            const dX = dRad * Math.cos(dAngle);
            const dY = dRad * Math.sin(dAngle);
            
            ctx.save();
            ctx.translate(dX, dY);
            ctx.rotate(t * 5); // Rapid local spin
            ctx.beginPath();
            const dSize = 3 / scale; // 6x6 pixels physically
            ctx.moveTo(0, -dSize);
            ctx.lineTo(dSize, 0);
            ctx.lineTo(0, dSize);
            ctx.lineTo(-dSize, 0);
            ctx.closePath();
            ctx.fillStyle = `hsla(${(hue + 180) % 360}, 90%, 65%, ${alpha * 0.7})`;
            ctx.fill();
            ctx.restore();
        }
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
