/* ====================================
   THE NEURAL OBSERVATORY — Quantum Archive
   Fractal Engine + Interactions
   ==================================== */

// ---- SACRED GEOMETRY MANDALA (WebGL) ----
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
    const vertSrc = [
        'attribute vec2 a_pos;',
        'void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }'
    ].join('\n');

    const fragSrc = [
        'precision highp float;',
        'uniform vec2 u_res;',
        'uniform float u_time;',
        'uniform vec2 u_mouse;',
        '',
        '// High-variety, vibrant mystical palette',
        'vec3 pal(float t) {',
        '    vec3 a = vec3(0.5, 0.5, 0.5);',
        '    vec3 b = vec3(0.5, 0.5, 0.5);',
        '    vec3 c = vec3(1.0, 0.7, 0.4);',
        '    vec3 d = vec3(0.0, 0.15, 0.20);',
        '    return a + b * cos(6.28318531 * (c * t + d));',
        '}',
        '',
        'void main() {',
        '    // Centered, aspect-corrected coordinates',
        '    vec2 uv = (gl_FragCoord.xy * 2.0 - u_res) / u_res.y;',
        '    vec2 uv0 = uv;',
        '',
        '    // Smooth, slow animation for the Julia set constant C',
        '    float t = u_time * 0.15;',
        '    // Moving through a beautiful region of the Julia set',
        '    vec2 c = vec2(-0.4 + 0.1 * cos(t), 0.6 + 0.1 * sin(t * 1.3));',
        '',
        '    // Gentle mouse parallax on the starting coordinates',
        '    vec2 z = uv * 1.3 + (u_mouse - 0.5) * 0.1;',
        '',
        '    float iter = 0.0;',
        '    const float max_iter = 50.0; // Smooth, soft iteration count',
        '',
        '    // Julia set calculation: Z = Z^2 + C',
        '    for (float i = 0.0; i < 50.0; i++) {',
        '        if (dot(z, z) > 100.0) break;',
        '        z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;',
        '        iter++;',
        '    }',
        '',
        '    // Smooth fractional iteration count for perfectly smooth gradients',
        '    if (iter < max_iter) {',
        '        float nu = log(log(dot(z, z)) / 2.0) / log(2.0);',
        '        iter = iter + 1.0 - nu;',
        '    }',
        '',
        '    // Map iteration to our soft, glowing palette',
        '    float v = iter / max_iter;',
        '    vec3 color = vec3(0.0);',
        '',
        '    if (iter < max_iter) {',
        '        // Increased multiplier (3.5) for more color bands',
        '        color = pal(v * 3.5 - t * 0.5);',
        '    }',
        '',
        '    // Soften and blend the fractal',
        '    color *= smoothstep(1.0, 0.0, v);',
        '',
        '    // Premium glow: Full brightness',
        '    color *= 1.0;',
        '',
        '    // Weaker vignette to keep edges visible',
        '    float vig = 1.0 - length(uv0) * 0.2;',
        '    color *= smoothstep(0.0, 1.5, vig);',
        '',
        '    gl_FragColor = vec4(color, 1.0);',
        '}'
    ].join('\n');

    function mkShader(src, type) {
        const s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
            console.error('Shader compile error:', gl.getShaderInfoLog(s));
            return null;
        }
        return s;
    }

    const vs = mkShader(vertSrc, gl.VERTEX_SHADER);
    const fs = mkShader(fragSrc, gl.FRAGMENT_SHADER);

    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        console.error('Program link error:', gl.getProgramInfoLog(prog));
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1
    ]), gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, 'u_res');
    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');

    const t0 = Date.now();

    (function loop() {
        const sec = (Date.now() - t0) * 0.001;
        gl.uniform2f(uRes, width, height);
        gl.uniform1f(uTime, sec);
        gl.uniform2f(uMouse, mouseX, mouseY);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        requestAnimationFrame(loop);
    })();

} else {
    const ctx2d = canvas.getContext('2d');
    ctx2d.fillStyle = '#040814';
    ctx2d.fillRect(0, 0, width, height);
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
