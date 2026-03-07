// ==========================================
// ドット絵の夜の街並みアニメーション背景
// ==========================================

const canvas = document.getElementById('pixel-bg');
const ctx = canvas.getContext('2d');

// ピクセルサイズ（1ドット絵の1マスのサイズ）
const PIXEL = 6;

let W, H, cols, rows;
let stars = [];
let buildings = [];
let scrollX = 0;

// =====================
// 色パレット（サイバーパンク風ドット絵）
// =====================
const COLORS = {
    sky: '#050510',
    moon: '#ffffcc',
    star: '#ffffff',
    buildingA: ['#140e2e', '#0e0a1c', '#1a1030'],
    buildingB: ['#0d1a2b', '#0a1220', '#121e33'],
    windowOn: ['#00e5ff', '#ff00c8', '#39ff14', '#ff9000', '#ffffaa'],
    windowOff: '#0a0a18',
    ground: '#0d0a1a',
    groundLine: '#00e5ff',
    neonSign: ['#ff00c8', '#00e5ff', '#ff9000'],
};

// =====================
// 初期化
// =====================
function init() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    cols = Math.ceil(W / PIXEL) + 2;
    rows = Math.ceil(H / PIXEL) + 2;

    // 星を生成
    stars = [];
    const skyRows = Math.floor(H * 0.6 / PIXEL);
    for (let i = 0; i < 80; i++) {
        stars.push({
            x: Math.floor(Math.random() * cols),
            y: Math.floor(Math.random() * skyRows),
            brightness: Math.random(),
            twinkle: Math.random() * 0.05 + 0.01,
        });
    }

    // ビルを生成（横に長くスクロール用に多めに作る）
    buildings = [];
    const totalWidth = W * 4;
    let bx = 0;
    while (bx < totalWidth) {
        const bw = Math.floor(Math.random() * 12 + 4) * PIXEL;
        const bh = Math.floor(Math.random() * 20 + 8) * PIXEL;
        const by = H - PIXEL * 3 - bh;
        const colorSet = Math.random() > 0.5 ? COLORS.buildingA : COLORS.buildingB;
        const color = colorSet[Math.floor(Math.random() * colorSet.length)];
        const layer = Math.random() > 0.5 ? 'front' : 'back';
        buildings.push({ x: bx, y: by, w: bw, h: bh, color, layer, windows: [] });

        // ビルの窓を定義
        for (let wy = by + PIXEL; wy < by + bh - PIXEL; wy += PIXEL * 2) {
            for (let wx = bx + PIXEL; wx < bx + bw - PIXEL; wx += PIXEL * 2) {
                buildings[buildings.length - 1].windows.push({
                    x: wx, y: wy,
                    on: Math.random() > 0.4,
                    color: COLORS.windowOn[Math.floor(Math.random() * COLORS.windowOn.length)],
                });
            }
        }

        bx += bw + Math.floor(Math.random() * 4) * PIXEL;
    }
}

// =====================
// 描画：星
// =====================
function drawStars(time) {
    stars.forEach(s => {
        const alpha = 0.4 + 0.6 * Math.abs(Math.sin(time * s.twinkle + s.x));
        ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(2)})`;
        ctx.fillRect(s.x * PIXEL, s.y * PIXEL, PIXEL, PIXEL);
    });
}

// =====================
// 描画：月
// =====================
function drawMoon() {
    const mx = Math.floor(W * 0.8 / PIXEL) * PIXEL;
    const my = Math.floor(H * 0.12 / PIXEL) * PIXEL;
    const moonSize = 4 * PIXEL;
    ctx.fillStyle = COLORS.moon;
    ctx.fillRect(mx, my, moonSize, moonSize);
    // 月の影（三日月風）
    ctx.fillStyle = COLORS.sky;
    ctx.fillRect(mx + PIXEL, my, moonSize, moonSize);
}

// =====================
// 描画：建物
// =====================
function drawBuildings(time) {
    ['back', 'front'].forEach(layer => {
        buildings.forEach(b => {
            if (b.layer !== layer) return;
            const drawX = ((b.x - scrollX) % (W * 4) + W * 4) % (W * 4) - W;
            if (drawX > W + b.w || drawX + b.w < -W) return;

            // ビル本体
            ctx.fillStyle = b.color;
            ctx.fillRect(
                Math.round(drawX / PIXEL) * PIXEL,
                Math.round(b.y / PIXEL) * PIXEL,
                b.w, b.h
            );

            // 窓
            b.windows.forEach(win => {
                const wx = Math.round((drawX + (win.x - b.x)) / PIXEL) * PIXEL;
                const wy = Math.round(win.y / PIXEL) * PIXEL;
                // 点滅
                const flicker = win.on && Math.random() > 0.995 ? !win.on : win.on;
                ctx.fillStyle = flicker ? win.color : COLORS.windowOff;
                ctx.fillRect(wx, wy, PIXEL, PIXEL);
            });
        });
    });
}

// =====================
// 描画：地面
// =====================
function drawGround() {
    const groundY = H - PIXEL * 3;
    ctx.fillStyle = COLORS.ground;
    ctx.fillRect(0, groundY, W, PIXEL * 3);
    // ネオンのグリッドライン
    ctx.fillStyle = COLORS.groundLine;
    ctx.globalAlpha = 0.15;
    ctx.fillRect(0, groundY, W, 1);
    ctx.globalAlpha = 1;
}

// =====================
// メインループ
// =====================
let lastTime = 0;
function loop(timestamp) {
    const dt = timestamp - lastTime;
    lastTime = timestamp;

    // スクロール
    scrollX = (scrollX + 0.3) % (W * 4);

    // 背景クリア
    ctx.fillStyle = COLORS.sky;
    ctx.fillRect(0, 0, W, H);

    drawStars(timestamp / 1000);
    drawMoon();
    drawBuildings(timestamp);
    drawGround();

    requestAnimationFrame(loop);
}

// =====================
// 起動
// =====================
window.addEventListener('resize', init);
init();
requestAnimationFrame(loop);
