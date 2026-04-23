/* ====================================
   THE NEURAL OBSERVATORY — Quantum Archive
   Fractal Engine + Interactions
   ==================================== */

// ---- FRACTAL CANVAS (WebGL Minimalist Mandelbrot Zoom) ----
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
        'uniform vec2 u_center;',
        'uniform float u_time;',
        '',
        '// Moody dark palette — deep ocean blues and teals',
        'vec3 pal(float t) {',
        '    vec3 a = vec3(0.02, 0.03, 0.06);',
        '    vec3 b = vec3(0.04, 0.06, 0.10);',
        '    vec3 c = vec3(1.0, 1.0, 1.0);',
        '    vec3 d = vec3(0.0, 0.10, 0.20);',
        '    return a + b * cos(6.28318 * (c * t + d));',
        '}',
        '',
        '// Mandelbrot with low iteration count for clean, smooth shapes',
        'float mandel(vec2 c) {',
        '    vec2 z = vec2(0.0);',
        '    for (int i = 0; i < 50; i++) {',
        '        z = vec2(z.x*z.x - z.y*z.y + c.x, 2.0*z.x*z.y + c.y);',
        '        if (dot(z,z) > 256.0) {',
        '            return float(i) - log2(log2(dot(z,z))) + 4.0;',
        '        }',
        '    }',
        '    return -1.0;',
        '}',
        '',
        'void main() {',
        '    vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / min(u_res.x, u_res.y);',
        '',
        '    // Very slow continuous zoom',
        '    float speed = 0.006;',
        '    float minZ = 0.00005;',
        '    float maxZ = 2.0;',
        '    float ratio = minZ / maxZ;',
        '',
        '    float t = u_time * speed;',
        '    float p1 = fract(t);',
        '    float p2 = fract(t + 0.5);',
        '',
        '    float z1 = maxZ * pow(ratio, p1);',
        '    float z2 = maxZ * pow(ratio, p2);',
        '',
        '    float m1 = mandel(u_center + uv * z1);',
        '    float m2 = mandel(u_center + uv * z2);',
        '',
        '    // Broad color bands — no thin stripes',
        '    vec3 c1 = m1 > 0.0 ? pal(m1 * 0.015 + u_time * 0.02) : vec3(0.0);',
        '    vec3 c2 = m2 > 0.0 ? pal(m2 * 0.015 + u_time * 0.02) : vec3(0.0);',
        '',
        '    // Crossfade the two layers for infinite loop',
        '    float w1 = sin(p1 * 3.14159) * smoothstep(0.0, 0.08, p1) * smoothstep(1.0, 0.92, p1);',
        '    float w2 = sin(p2 * 3.14159) * smoothstep(0.0, 0.08, p2) * smoothstep(1.0, 0.92, p2);',
        '    vec3 col = (c1 * w1 + c2 * w2) / max(w1 + w2, 0.001);',
        '',
        '    // Heavy vignette for dark edges',
        '    float vig = 1.0 - length(gl_FragCoord.xy / u_res - 0.5) * 1.6;',
        '    col *= smoothstep(0.0, 0.8, vig);',
        '',
        '    // Global darkening — keeps it a subtle background, not a screensaver',
        '    gl_FragColor = vec4(col * 0.35, 1.0);',
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

    // Full-screen quad
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1
    ]), gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, 'u_res');
    const uCenter = gl.getUniformLocation(prog, 'u_center');
    const uTime = gl.getUniformLocation(prog, 'u_time');

    // Seahorse Valley — beautiful spirals
    const CX = -0.743643887037151;
    const CY =  0.131825904205330;

    const t0 = Date.now();

    (function loop() {
        const sec = (Date.now() - t0) * 0.001;
        const cx = CX + (mouseX - 0.5) * 0.00001 * Math.sin(sec * 0.3);
        const cy = CY + (mouseY - 0.5) * 0.00001 * Math.cos(sec * 0.3);

        gl.uniform2f(uRes, width, height);
        gl.uniform2f(uCenter, cx, cy);
        gl.uniform1f(uTime, sec);
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
