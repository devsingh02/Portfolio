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
        'void main() {',
        '    vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / min(u_res.x, u_res.y);',
        '    uv += (u_mouse - 0.5) * 0.02;',
        '    float r = length(uv);',
        '    float a = atan(uv.y, uv.x) + u_time * 0.02;',
        '    float t = u_time;',
        '',
        '    // Deep purple base',
        '    vec3 col = vec3(0.05, 0.02, 0.10);',
        '',
        '    // === ORNATE LAYERED PATTERN ===',
        '    float p = 0.0;',
        '    p += sin(a*8.0 + r*15.0 + t*0.3)*0.35;',
        '    p += sin(a*16.0 - r*22.0 + t*0.15)*cos(r*10.0)*0.25;',
        '    p += cos(a*12.0 + r*18.0 + t*0.2)*sin(a*6.0 - r*8.0)*0.2;',
        '    p += sin(a*24.0 + r*30.0 - t*0.1)*0.12;',
        '    p += sin(a*32.0 - r*35.0 + t*0.08)*0.08;',
        '    p = p * 0.5 + 0.5;',
        '',
        '    vec3 patCol = mix(vec3(0.08,0.03,0.18), vec3(0.16,0.08,0.30), p);',
        '    col += patCol * smoothstep(1.5, 0.0, r);',
        '',
        '    // Warm directional gradient (magenta <-> teal)',
        '    float ga = (a + PI) / TAU;',
        '    vec3 warmG = mix(vec3(0.12,0.02,0.08), vec3(0.02,0.06,0.12), ga);',
        '    col += warmG * 0.25 * smoothstep(1.2, 0.1, r);',
        '',
        '    // === CONCENTRIC MANDALA RINGS ===',
        '    float rSum = 0.0;',
        '    for (int i = 1; i <= 8; i++) {',
        '        float ri = float(i) * 0.1;',
        '        float rw = 0.004 + 0.002*sin(t*0.5 + float(i));',
        '        float ring = smoothstep(rw, 0.0, abs(r - ri));',
        '        ring *= 0.7 + 0.3*sin(a*(4.0 + float(i)*4.0) + t*0.1*float(i));',
        '        rSum += ring;',
        '    }',
        '    col += vec3(0.20, 0.12, 0.35) * rSum;',
        '',
        '    // === GOLDEN GLOW NODES (16 outer) ===',
        '    for (int i = 0; i < 16; i++) {',
        '        float na = float(i)*TAU/16.0 + t*0.05;',
        '        vec2 np = vec2(cos(na), sin(na)) * 0.38;',
        '        float d = length(uv - np);',
        '        col += vec3(1.0,0.82,0.35) * 0.0001 / (d*d + 0.0005);',
        '    }',
        '',
        '    // === INNER PURPLE NODES (12) ===',
        '    for (int i = 0; i < 12; i++) {',
        '        float na = float(i)*TAU/12.0 - t*0.04;',
        '        vec2 np = vec2(cos(na), sin(na)) * 0.22;',
        '        float d = length(uv - np);',
        '        col += vec3(0.7,0.5,1.0) * 0.00005 / (d*d + 0.0003);',
        '    }',
        '',
        '    // === COLORFUL CENTER ===',
        '    vec3 rainbow = 0.5 + 0.5*cos(TAU*(vec3(0.0,0.33,0.67) + a/TAU + t*0.15));',
        '    float cMask = smoothstep(0.18, 0.02, r);',
        '    col = mix(col, rainbow * 0.45, cMask * 0.6);',
        '    col += vec3(0.6,0.4,0.9) * 0.006 / (r*r + 0.003);',
        '',
        '    // === VIGNETTE & BRIGHTNESS ===',
        '    col *= max(1.0 - r*0.4, 0.15);',
        '    col *= 1.1;',
        '',
        '    gl_FragColor = vec4(col, 1.0);',
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
