/* ====================================
   THE NEURAL OBSERVATORY — Neural Matrix Engine
   Binary Rain + Neural Network Visualization
   ==================================== */

// ---- NEURAL MATRIX ENGINE (Canvas 2D) ----
const canvas = document.getElementById('fractal-canvas');
const ctx = canvas.getContext('2d');

let width, height, mouseX = 0.5, mouseY = 0.5;
let lastW = 0, lastH = 0;

function resize() {
    const nw = window.innerWidth;
    const nh = window.innerHeight;
    if (nw !== lastW || Math.abs(nh - lastH) > 120) {
        width = nw;
        height = nh;
        lastW = nw;
        lastH = nh;
        canvas.width = width;
        canvas.height = height;
        initBinaryRain();
        initNeuralNetwork();
    }
}
window.addEventListener('resize', resize);

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX / window.innerWidth;
    mouseY = e.clientY / window.innerHeight;
});

// ========== BINARY RAIN ==========
const columns = [];
const CHAR_SIZE = 14;
const BINARY_CHARS = '01';
const CODE_SNIPPETS = [
    'def train():', 'loss.backward()', 'model.forward(x)',
    'import torch', 'np.array()', 'x = tf.Variable',
    'optimizer.step()', 'return logits', 'nn.Linear()',
    'conv2d(3,64)', 'relu(x)', 'softmax(z)',
    'grad = dL/dw', 'batch_size=32', 'epochs=100',
    'dropout(0.5)', 'LSTM(hidden)', 'attention(Q,K,V)',
    'embed_dim=768', 'num_heads=12', 'lr=0.0001'
];

function initBinaryRain() {
    columns.length = 0;
    const numCols = Math.floor(width / CHAR_SIZE);
    for (let i = 0; i < numCols; i++) {
        const isCodeCol = Math.random() < 0.08;
        columns.push({
            x: i * CHAR_SIZE,
            y: Math.random() * height * -1,
            speed: 1 + Math.random() * 3,
            chars: [],
            length: 8 + Math.floor(Math.random() * 20),
            isCode: isCodeCol,
            codeText: isCodeCol ? CODE_SNIPPETS[Math.floor(Math.random() * CODE_SNIPPETS.length)] : '',
            brightness: 0.3 + Math.random() * 0.7
        });
    }
    // Generate chars for each column
    columns.forEach(col => {
        col.chars = [];
        for (let j = 0; j < col.length; j++) {
            col.chars.push(BINARY_CHARS[Math.floor(Math.random() * 2)]);
        }
    });
}

function drawBinaryRain() {
    columns.forEach(col => {
        col.y += col.speed;
        if (col.y > height + col.length * CHAR_SIZE) {
            col.y = -col.length * CHAR_SIZE;
            col.speed = 1 + Math.random() * 3;
            col.brightness = 0.3 + Math.random() * 0.7;
            // Randomize chars occasionally
            if (Math.random() < 0.3) {
                for (let j = 0; j < col.chars.length; j++) {
                    col.chars[j] = BINARY_CHARS[Math.floor(Math.random() * 2)];
                }
            }
            if (col.isCode) {
                col.codeText = CODE_SNIPPETS[Math.floor(Math.random() * CODE_SNIPPETS.length)];
            }
        }

        if (col.isCode) {
            // Draw code snippet vertically
            const text = col.codeText;
            for (let j = 0; j < text.length; j++) {
                const cy = col.y + j * CHAR_SIZE;
                if (cy < -CHAR_SIZE || cy > height + CHAR_SIZE) continue;
                const headDist = j / text.length;
                const alpha = j === text.length - 1 ? 0.8 : (1 - headDist) * col.brightness * 0.4;
                if (j === text.length - 1) {
                    ctx.fillStyle = `rgba(255, 255, 255, 0.7)`;
                } else {
                    ctx.fillStyle = `rgba(0, 255, 157, ${alpha})`;
                }
                ctx.font = `${CHAR_SIZE - 2}px 'Courier New', monospace`;
                ctx.fillText(text[j], col.x, cy);
            }
        } else {
            // Draw binary characters
            for (let j = 0; j < col.chars.length; j++) {
                const cy = col.y + j * CHAR_SIZE;
                if (cy < -CHAR_SIZE || cy > height + CHAR_SIZE) continue;
                const headDist = j / col.chars.length;
                // Head char is bright white, tail fades to dark green
                if (j === col.chars.length - 1) {
                    ctx.fillStyle = `rgba(200, 255, 230, 0.7)`;
                    ctx.font = `bold ${CHAR_SIZE}px 'Courier New', monospace`;
                } else {
                    const alpha = (1 - headDist) * col.brightness * 0.3;
                    ctx.fillStyle = `rgba(0, 255, 157, ${alpha})`;
                    ctx.font = `${CHAR_SIZE}px 'Courier New', monospace`;
                }
                // Randomly flicker chars
                if (Math.random() < 0.005) {
                    col.chars[j] = BINARY_CHARS[Math.floor(Math.random() * 2)];
                }
                ctx.fillText(col.chars[j], col.x, cy);
            }
        }
    });
}

// ========== NEURAL NETWORK ==========
const nodes = [];
const connections = [];
const pulses = [];
const LAYERS = 5;

function initNeuralNetwork() {
    nodes.length = 0;
    connections.length = 0;
    pulses.length = 0;

    const layerSpacing = width / (LAYERS + 1);
    const nodesPerLayer = [3, 5, 7, 5, 3]; // classic NN shape

    for (let l = 0; l < LAYERS; l++) {
        const count = nodesPerLayer[l];
        const x = layerSpacing * (l + 1);
        const ySpacing = height / (count + 1);
        for (let n = 0; n < count; n++) {
            const y = ySpacing * (n + 1);
            nodes.push({
                x, y,
                layer: l,
                radius: 4 + Math.random() * 3,
                pulsePhase: Math.random() * Math.PI * 2,
                activity: 0.3 + Math.random() * 0.7
            });
        }
    }

    // Create connections between adjacent layers
    for (let i = 0; i < nodes.length; i++) {
        for (let j = 0; j < nodes.length; j++) {
            if (nodes[j].layer === nodes[i].layer + 1) {
                // Don't connect every single pair — keep it ~60%
                if (Math.random() < 0.6) {
                    connections.push({
                        from: i, to: j,
                        weight: 0.2 + Math.random() * 0.8
                    });
                }
            }
        }
    }

    // Spawn initial pulses
    for (let i = 0; i < 8; i++) {
        spawnPulse();
    }
}

function spawnPulse() {
    if (connections.length === 0) return;
    const conn = connections[Math.floor(Math.random() * connections.length)];
    pulses.push({
        connIdx: connections.indexOf(conn),
        progress: 0,
        speed: 0.003 + Math.random() * 0.008,
        color: Math.random() < 0.5 ? [0, 255, 157] : [0, 229, 255], // emerald or cyan
        size: 2 + Math.random() * 3
    });
}

function drawNeuralNetwork(time) {
    // Draw connections
    connections.forEach((conn, ci) => {
        const a = nodes[conn.from];
        const b = nodes[conn.to];
        const alpha = conn.weight * 0.08;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(0, 255, 157, ${alpha})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
    });

    // Draw and update pulses (data flowing!)
    for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.progress += p.speed;
        if (p.progress >= 1) {
            pulses.splice(i, 1);
            spawnPulse(); // respawn a new one
            continue;
        }
        const conn = connections[p.connIdx];
        if (!conn) { pulses.splice(i, 1); continue; }
        const a = nodes[conn.from];
        const b = nodes[conn.to];
        const px = a.x + (b.x - a.x) * p.progress;
        const py = a.y + (b.y - a.y) * p.progress;

        // Glowing pulse dot
        const grd = ctx.createRadialGradient(px, py, 0, px, py, p.size * 6);
        grd.addColorStop(0, `rgba(${p.color.join(',')}, 0.5)`);
        grd.addColorStop(0.3, `rgba(${p.color.join(',')}, 0.15)`);
        grd.addColorStop(1, `rgba(${p.color.join(',')}, 0)`);
        ctx.beginPath();
        ctx.arc(px, py, p.size * 6, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        // Core bright dot
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color.join(',')}, 0.6)`;
        ctx.fill();
    }

    // Draw nodes
    nodes.forEach(node => {
        const pulse = Math.sin(time * 2 + node.pulsePhase) * 0.3 + 0.7;
        const r = node.radius * pulse;

        // Outer glow
        const grd = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, r * 5);
        grd.addColorStop(0, `rgba(0, 229, 255, ${0.3 * node.activity})`);
        grd.addColorStop(1, 'rgba(0, 229, 255, 0)');
        ctx.beginPath();
        ctx.arc(node.x, node.y, r * 5, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        // Core ring
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 255, 157, ${0.3 * node.activity * pulse})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Inner dot
        ctx.beginPath();
        ctx.arc(node.x, node.y, r * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, 157, ${0.4 * node.activity})`;
        ctx.fill();
    });
}

// ========== MAIN RENDER LOOP ==========
const t0 = performance.now();

function render() {
    const time = (performance.now() - t0) * 0.001;

    // Dark fade (trail effect)
    ctx.fillStyle = 'rgba(3, 5, 8, 0.15)';
    ctx.fillRect(0, 0, width, height);

    // Draw layers
    drawBinaryRain();
    drawNeuralNetwork(time);

    // Mouse glow interaction
    const mx = mouseX * width;
    const my = mouseY * height;
    const mouseGrd = ctx.createRadialGradient(mx, my, 0, mx, my, 150);
    mouseGrd.addColorStop(0, 'rgba(0, 255, 157, 0.06)');
    mouseGrd.addColorStop(1, 'rgba(0, 255, 157, 0)');
    ctx.beginPath();
    ctx.arc(mx, my, 150, 0, Math.PI * 2);
    ctx.fillStyle = mouseGrd;
    ctx.fill();

    requestAnimationFrame(render);
}

resize();
render();

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
