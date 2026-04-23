// Fractal Canvas Background
const canvas = document.getElementById('fractal-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let time = 0;

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}

window.addEventListener('resize', resize);
resize();

function drawFractal() {
    ctx.fillStyle = 'rgba(10, 10, 15, 0.1)'; // Trail effect
    ctx.fillRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    
    // Slow rotation
    ctx.translate(centerX, centerY);
    ctx.rotate(time * 0.0005);
    ctx.translate(-centerX, -centerY);

    const numPoints = 6;
    const radius = Math.min(width, height) * 0.4;
    
    // Draw interconnected geometry
    ctx.beginPath();
    for (let i = 0; i <= numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2 + time * 0.001;
        const x = centerX + Math.cos(angle) * radius * Math.sin(time * 0.0005 + i);
        const y = centerY + Math.sin(angle) * radius * Math.cos(time * 0.0005 + i);
        
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        
        // Inner connections
        for(let j=0; j < numPoints; j++) {
            if(Math.random() > 0.98) {
                const angle2 = (j / numPoints) * Math.PI * 2;
                const x2 = centerX + Math.cos(angle2) * radius * 0.5;
                const y2 = centerY + Math.sin(angle2) * radius * 0.5;
                ctx.moveTo(x, y);
                ctx.lineTo(x2, y2);
            }
        }
    }
    
    // Dynamic color gradient
    const hue = (time * 0.05) % 360;
    ctx.strokeStyle = `hsla(${hue}, 80%, 50%, 0.15)`;
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Reset transform
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    
    time += 16; // Approx 60fps
    requestAnimationFrame(drawFractal);
}

drawFractal();

// Slideshow Logic
function initSlideshows() {
    const slideshows = document.querySelectorAll('.slideshow-container');
    
    slideshows.forEach(container => {
        let slideIndex = 1;
        const slides = container.querySelectorAll('.slide');
        const prevBtn = container.querySelector('.prev');
        const nextBtn = container.querySelector('.next');
        const counter = container.parentElement.querySelector('.slide-counter');
        
        function showSlides(n) {
            if (n > slides.length) slideIndex = 1;
            if (n < 1) slideIndex = slides.length;
            
            slides.forEach(slide => slide.classList.remove('active'));
            slides[slideIndex - 1].classList.add('active');
            
            if(counter) {
                counter.textContent = `Slide ${slideIndex} of ${slides.length}`;
            }
        }
        
        if(prevBtn && nextBtn) {
            prevBtn.addEventListener('click', () => {
                showSlides(slideIndex -= 1);
            });
            
            nextBtn.addEventListener('click', () => {
                showSlides(slideIndex += 1);
            });
        }
        
        // Initialize
        if(slides.length > 0) showSlides(slideIndex);
    });
}

document.addEventListener('DOMContentLoaded', initSlideshows);
