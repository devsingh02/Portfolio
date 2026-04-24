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
        '// --- MATRIX CODE LAYER ---',
        'float getMatrix(vec2 uv, float t) {',
        '    float time = t * 0.8;',
        '    vec2 id = floor(uv);',
        '    uv.y += time * (hash(vec2(id.x, 0.0)) * 0.5 + 0.5);',
        '    vec2 gv = fract(uv * vec2(1.0, 15.0)) - 0.5;',
        '    float charHash = hash(floor(uv * vec2(1.0, 15.0)));',
        '    ',
        '    // Simulate digital characters',
        '    float d = length(gv);',
        '    float char = smoothstep(0.4, 0.1, d);',
        '    if(charHash > 0.5) char *= step(0.1, abs(gv.x));', // Split some to look like different chars
        '    if(charHash < 0.2) char *= step(0.1, abs(gv.y));',
        '    ',
        '    // Column brightness gradient (fading tail)',
        '    float colDist = fract(uv.y * 0.2 + time);',
        '    return char * smoothstep(0.1, 0.0, colDist) * 1.5;',
        '}',
        '',
        '// --- NEURAL NODES LAYER ---',
        'float getNodes(vec2 uv, float t) {',
        '    vec2 id = floor(uv);',
        '    vec2 gv = fract(uv) - 0.5;',
        '    float m = 0.0;',
        '    for(int y=-1; y<=1; y++) {',
        '        for(int x=-1; x<=1; x++) {',
        '            vec2 offs = vec2(float(x), float(y));',
        '            float n = hash(id + offs);',
        '            vec2 p = offs + sin(n * 6.2831 + t) * 0.4;',
        '            float d = length(gv - p);',
        '            // Core dot',
        '            m += smoothstep(0.08, 0.0, d) * 0.8;',
        '            // Outer glow',
        '            m += smoothstep(0.3, 0.0, d) * 0.3;',
        '        }',
        '    }',
        '    return m;',
        '}',
        '',
        'void main() {',
        '    vec2 uv = (gl_FragCoord.xy * 2.0 - u_res) / u_res.y;',
        '    float t = u_time;',
        '    ',
        '    vec3 col = vec3(0.01, 0.02, 0.03); // Deep tech black',
        '    ',
        '    // Matrix Rain Layers (Parallax)',
        '    float matrix1 = getMatrix(uv * 10.0, t);',
        '    float matrix2 = getMatrix(uv * 15.0 + 10.0, t * 0.8);',
        '    vec3 matrixCol = vec3(0.0, 1.0, 0.6) * (matrix1 + matrix2 * 0.4);',
        '    ',
        '    // Neural Nodes Layer',
        '    float nodes = getNodes(uv * 4.0, t * 0.5);',
        '    vec3 neuralCol = vec3(0.0, 0.8, 1.0) * nodes;',
        '    ',
        '    // Composite',
        '    col += matrixCol * 0.6;',
        '    col += neuralCol * 0.8;',
        '    ',
        '    // Interactive Mouse Glow',
        '    float mouseDist = length(uv - (u_mouse - 0.5) * vec2(u_res.x/u_res.y, 1.0) * 2.0);',
        '    col += vec3(0.0, 1.0, 0.8) * 0.015 / (mouseDist + 0.05);',
        '    ',
        '    // Subtle Vignette',
        '    col *= smoothstep(1.5, 0.5, length(uv));',
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
