/* ====================================
   THE NEURAL OBSERVATORY — Quantum Archive
   Fractal Engine + Interactions
   ==================================== */

// ---- SACRED GEOMETRY MANDALA (WebGL) ----
const canvas = document.getElementById('fractal-canvas');
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

let width, height, mouseX = 0.5, mouseY = 0.5;
let lastW = 0, lastH = 0;

function resize() {
    const nw = window.innerWidth;
    const nh = window.innerHeight;
    
    // Mobile fix: Only resize if width changes (orientation) 
    // or height changes significantly (ignoring address bar toggle)
    if (nw !== lastW || Math.abs(nh - lastH) > 120) {
        width = nw;
        height = nh;
        lastW = nw;
        lastH = nh;
        
        canvas.width = width;
        canvas.height = height;
        if (gl) gl.viewport(0, 0, width, height);
    }
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
        'float hash(vec2 p) {',
        '    p = fract(p * vec2(123.34, 456.21));',
        '    p += dot(p, p + 45.32);',
        '    return fract(p.x * p.y);',
        '}',
        '',
        '// --- NEURAL NETWORK LAYER ---',
        'float getNeural(vec2 uv, float t) {',
        '    float m = 0.0;',
        '    vec2 gv = fract(uv) - 0.5;',
        '    vec2 id = floor(uv);',
        '    ',
        '    vec2 p[9];',
        '    int idx = 0;',
        '    for(float y=-1.0; y<=1.0; y++) {',
        '        for(float x=-1.0; x<=1.0; x++) {',
        '            vec2 offs = vec2(x, y);',
        '            float n = hash(id + offs);',
        '            p[idx++] = offs + sin(n * 6.2831 + t) * 0.4;',
        '        }',
        '    }',
        '    ',
        '    for(int i=0; i<9; i++) {',
        '        // Nodes',
        '        float d = length(gv - p[i]);',
        '        m += smoothstep(0.05, 0.0, d) * 0.5;', // Pulsing dots
        '        ',
        '        // Connections',
        '        for(int j=i+1; j<9; j++) {',
        '            float dLine = length(p[i] - p[j]);',
        '            if(dLine < 1.2) {',
        '                float dist = length(gv - mix(p[i], p[j], clamp(dot(gv-p[i], p[j]-p[i])/dot(p[j]-p[i], p[j]-p[i]), 0.0, 1.0)));',
        '                m += smoothstep(0.02, 0.0, dist) * smoothstep(1.2, 0.4, dLine) * 0.2;',
        '            }',
        '        }',
        '    }',
        '    return m;',
        '}',
        '',
        '// --- MATRIX CODE LAYER ---',
        'float getMatrix(vec2 uv, float t) {',
        '    uv.y += t * 0.5 * (hash(vec2(floor(uv.x), 0.0)) + 0.5); // Vertical falling',
        '    vec2 gv = fract(uv * vec2(1.0, 15.0)) - 0.5; // Grid cells',
        '    float charHash = hash(floor(uv * vec2(1.0, 15.0)));',
        '    ',
        '    // Simulate digital characters',
        '    float char = smoothstep(0.4, 0.1, length(gv));',
        '    if(charHash > 0.5) char *= step(0.1, abs(gv.x));', // Split some
        '    ',
        '    // Column brightness gradient',
        '    float colDist = fract(uv.y * 0.2 + t * 0.1);',
        '    return char * smoothstep(0.1, 0.0, colDist) * 1.5;',
        '}',
        '',
        'void main() {',
        '    vec2 uv = (gl_FragCoord.xy * 2.0 - u_res) / u_res.y;',
        '    vec2 uv0 = uv;',
        '    float t = u_time;',
        '    ',
        '    vec3 col = vec3(0.01, 0.02, 0.03); // Deep tech black',
        '    ',
        '    // Layers',
        '    float matrix = getMatrix(uv * 12.0, t);',
        '    float neural = getNeural(uv * 4.0, t * 0.5);',
        '    ',
        '    // Colors',
        '    vec3 matrixCol = vec3(0.0, 1.0, 0.6) * matrix; // Emerald/Cyan',
        '    vec3 neuralCol = vec3(0.0, 0.8, 1.0) * neural; // Ghost Cyan',
        '    ',
        '    col += matrixCol * 0.4;',
        '    col += neuralCol * 0.6;',
        '    ',
        '    // Mouse Glow',
        '    float mouseDist = length(uv - (u_mouse - 0.5) * vec2(u_res.x/u_res.y, 1.0) * 2.0);',
        '    col += vec3(0.0, 1.0, 0.8) * 0.01 / (mouseDist + 0.05);',
        '    ',
        '    // Vignette',
        '    col *= smoothstep(1.5, 0.5, length(uv0));',
        '    ',
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
