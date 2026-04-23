/* ====================================
   THE NEURAL OBSERVATORY — Quantum Archive
   Fractal Engine + Interactions
   ==================================== */

// ---- FRACTAL CANVAS (WebGL Infinite Mandelbrot Zoom) ----
const canvas = document.getElementById('fractal-canvas');
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

let width, height, mouseX = 0.5, mouseY = 0.5;

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    if (gl) gl.viewport(0, 0, width, height);
}
window.addEventListener('resize', resize);
resize();

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX / window.innerWidth;
    mouseY = e.clientY / window.innerHeight;
});

if (gl) {
    const vertexShaderSource = `
    attribute vec2 position;
    void main() {
        gl_Position = vec4(position, 0.0, 1.0);
    }
    `;

    const fragmentShaderSource = `
    precision highp float;
    uniform vec2 resolution;
    uniform vec2 center;
    uniform float time;

    const fragmentShaderSource = `
    precision highp float;
    uniform vec2 resolution;
    uniform vec2 center;
    uniform float time;

    // Extremely dark, minimalist palette to avoid brightness
    vec3 palette( in float t ) {
        // Barely visible base with tiny amplitude
        vec3 a = vec3(0.03, 0.05, 0.08); 
        vec3 b = vec3(0.02, 0.04, 0.06); 
        vec3 c = vec3(1.0, 1.0, 1.0);
        vec3 d = vec3(0.0, 0.10, 0.20);
        return a + b * cos( 6.28318 * (c * t + d) );
    }

    // Calculates Mandelbrot iteration count with continuous smooth shading
    float getMandelbrot(vec2 c) {
        vec2 z = vec2(0.0);
        // Severely restricted max iterations (40). This forcefully strips away all 
        // the chaotic 'detail' and leaves only massive, soft, bloated blobs.
        // This completely eliminates the blurry moiré effect.
        for(int i = 0; i < 40; i++) {
            z = vec2(z.x * z.x - z.y * z.y + c.x, 2.0 * z.x * z.y + c.y);
            if(dot(z, z) > 4.0) {
                float slz = log(log(dot(z, z)) / 2.0) / log(2.0);
                return float(i) + 1.0 - slz;
            }
        }
        return -1.0;
    }

    void main() {
        // Normalized pixel coordinates (from 0 to 1) maintaining aspect ratio
        vec2 uv = (gl_FragCoord.xy - 0.5 * resolution.xy) / min(resolution.x, resolution.y);
        
        float minZoom = 0.000015;
        float maxZoom = 2.5;
        float zoomRatio = minZoom / maxZoom;
        
        // Time-driven zoom mechanics (Extremely slow crawl)
        float t = time * 0.004; 
        float p1 = fract(t);
        float p2 = fract(t + 0.5);
        
        // Two independent zoom layers offset by half a cycle
        float zoom1 = maxZoom * pow(zoomRatio, p1);
        float zoom2 = maxZoom * pow(zoomRatio, p2);
        
        vec2 c1 = center + uv * zoom1;
        vec2 c2 = center + uv * zoom2;
        
        float m1 = getMandelbrot(c1);
        float m2 = getMandelbrot(c2);
        
        // Color mapping. Using a massive divisor (100.0 instead of 30.0) 
        // stretches the color gradient out massively, removing any thin striped details.
        vec3 col1 = vec3(0.0);
        if(m1 > 0.0) col1 = palette(m1 / 100.0 - time * 0.05);
        
        vec3 col2 = vec3(0.0);
        if(m2 > 0.0) col2 = palette(m2 / 100.0 - time * 0.05);
        
        // Smooth sine wave crossfade between the two zoom depths to create infinite loop
        float w1 = sin(p1 * 3.14159265);
        float w2 = sin(p2 * 3.14159265);
        
        // Darken at the extremes to completely hide any precision rendering artifacts
        w1 *= smoothstep(0.0, 0.1, p1) * smoothstep(1.0, 0.9, p1);
        w2 *= smoothstep(0.0, 0.1, p2) * smoothstep(1.0, 0.9, p2);
        
        vec3 finalCol = (col1 * w1 + col2 * w2) / max(w1 + w2, 0.001);
        
        // Massive, heavy vignette to crush the corners into total black
        float vignette = 1.0 - length((gl_FragCoord.xy / resolution.xy) - 0.5) * 1.8;
        finalCol *= smoothstep(0.0, 0.9, vignette);
        
        // Extreme global darkening
        gl_FragColor = vec4(finalCol * 0.3, 1.0);
    }
    `;

    function compileShader(source, type) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader error:', gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    }

    const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Full screen quad
    const vertices = new Float32Array([
        -1.0, -1.0,  1.0, -1.0, -1.0,  1.0,
        -1.0,  1.0,  1.0, -1.0,  1.0,  1.0
    ]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const positionLoc = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    const resLoc = gl.getUniformLocation(program, "resolution");
    const centerLoc = gl.getUniformLocation(program, "center");
    const timeLoc = gl.getUniformLocation(program, "time");

    // Deep zoom target: Seahorse Valley intricate spiral
    const targetCX = -0.743643887037151;
    const targetCY = 0.131825904205330;
    
    let startTime = Date.now();

    function animate() {
        const time = (Date.now() - startTime) * 0.001;
        
        // Mouse interaction adds a tiny, chaotic wobble to the spiral center
        const cx = targetCX + (mouseX - 0.5) * 0.00002 * Math.sin(time * 0.5);
        const cy = targetCY + (mouseY - 0.5) * 0.00002 * Math.cos(time * 0.5);
        
        gl.uniform2f(resLoc, width, height);
        gl.uniform2f(centerLoc, cx, cy);
        gl.uniform1f(timeLoc, time);
        
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        requestAnimationFrame(animate);
    }
    animate();
} else {
    // Fallback if WebGL isn't supported (renders a solid dark theme)
    const ctx = canvas.getContext('2d');
    function fallback() {
        ctx.fillStyle = '#040814';
        ctx.fillRect(0, 0, width, height);
        requestAnimationFrame(fallback);
    }
    fallback();
}

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
