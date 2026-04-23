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
        '#define PI 3.14159265',
        '#define TAU 6.28318531',
        '',
        '// Rich, warm, mystical palette (Purples, Teals, Golds)',
        'vec3 pal(float t) {',
        '    vec3 a = vec3(0.5, 0.2, 0.5);',
        '    vec3 b = vec3(0.4, 0.3, 0.4);',
        '    vec3 c = vec3(1.0, 1.0, 1.0);',
        '    vec3 d = vec3(0.0, 0.15, 0.30);',
        '    return a + b * cos(TAU * (c * t + d));',
        '}',
        '',
        'void main() {',
        '    // Centered, aspect-corrected coordinates',
        '    vec2 uv = (gl_FragCoord.xy * 2.0 - u_res) / u_res.y;',
        '    vec2 uv0 = uv;', // Store original for radial effects
        '',
        '    // Gentle mouse parallax',
        '    uv += (u_mouse - 0.5) * 0.1;',
        '',
        '    // 8-Fold Sacred Geometry Symmetry Fold',
        '    float a = atan(uv.y, uv.x);',
        '    float r = length(uv);',
        '    float folds = 8.0;',
        '    a = mod(a, TAU/folds) - TAU/(folds*2.0);',
        '    a = abs(a);',
        '    uv = r * vec2(cos(a), sin(a));',
        '',
        '    vec3 finalColor = vec3(0.0);',
        '    float t = u_time * 0.15; // Slow, chill moving speed',
        '',
        '    // Kaleidoscopic Iterated Function System (KIFS)',
        '    // Iterations increased from 4.0 to 5.0 for massively upgraded mathematical complexity',
        '    for (float i = 0.0; i < 5.0; i++) {',
        '        // Absolute reflection fold added before scaling. ',
        '        // This creates highly complex interlocking diamond structures (true KIFS math)',
        '        uv = abs(uv) - 0.2;',
        '        ',
        '        // Space folding and continuous sliding (Creates the infinite zoom effect)',
        '        uv = fract(uv * 1.5 - t * 0.2) - 0.5;',
        '',
        '        // Continuous slow rotation for each fractal layer',
        '        float s = sin(t * 0.3 + i * 0.5), c = cos(t * 0.3 + i * 0.5);',
        '        uv *= mat2(c, -s, s, c);',
        '',
        '        // Distance field calculated with exponential decay from center',
        '        float d = length(uv) * exp(-length(uv0));',
        '',
        '        // Dynamic color shifting based on depth and time',
        '        vec3 col = pal(length(uv0) + i * 0.4 + t);',
        '',
        '        // Create glowing neon sine rings. Frequency increased for finer detail.',
        '        d = sin(d * 14.0 + t) / 14.0;',
        '        d = abs(d);',
        '',
        '        // Inverse exponential for strong neon glow falloff',
        '        d = pow(0.012 / d, 1.2);',
        '',
        '        // Additive blending',
        '        finalColor += col * d;',
        '    }',
        '',
        '    // Chill vibes: reduce overall brightness so it acts as a subtle background',
        '    finalColor *= 0.18;',
        '',
        '    // Vignette heavily reduced so the fractal pattern fills the ENTIRE screen',
        '    float vig = 1.0 - length(uv0) * 0.3;',
        '    finalColor *= smoothstep(0.0, 1.5, vig);',
        '',
        '    gl_FragColor = vec4(finalColor, 1.0);',
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
