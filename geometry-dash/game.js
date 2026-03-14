const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 定数
const GRAVITY = 0.8;
const JUMP_FORCE = -12;
const INITIAL_GAME_SPEED = 5;
const GROUND_Y_RATIO = 0.8;
const LEVEL_LENGTH = 30000000; // ステージの長さ（30万メートル相当）

// ゲーム状態
let score = 0;
let distance = 0;
let gameSpeed = INITIAL_GAME_SPEED;
let isGameRunning = false;
let obstacles = [];
let particles = [];
let trail = [];
let frameCount = 0;
let shakeAmount = 0;

// 色管理 (Stereo Madness風)
const COLORS = [
    { bg: '#0033cc', ground: '#0022aa' }, // 青
    { bg: '#8800cc', ground: '#6600aa' }  // 紫
];
let currentColorIndex = 0;
let bgLerp = 0;

// キャンバスサイズの設定 (16:9比率を維持)
function resizeCanvas() {
    const container = canvas.parentElement;
    const cw = container.clientWidth;
    const ch = container.clientHeight;
    canvas.width = cw;
    canvas.height = ch;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// プレイヤー画像
const playerImg = new Image();
playerImg.src = 'player.jpeg';
let isPlayerImgLoaded = false;
playerImg.onload = () => {
    isPlayerImgLoaded = true;
};

// プレイヤーオブジェクト
const player = {
    x: 120, // 少し右寄りに
    y: 0,
    width: 32,
    height: 32,
    vy: 0,
    rotation: 0,
    onGround: false,
    color: '#00d2ff',

    update() {
        const groundY = canvas.height * GROUND_Y_RATIO - this.height;

        this.vy += GRAVITY;
        this.y += this.vy;

        if (this.y >= groundY) {
            this.y = groundY;
            this.vy = 0;
            if (!this.onGround) {
                createExplosion(this.x + this.width / 2, groundY + this.height, this.color, 4);
            }
            this.onGround = true;
            this.rotation = Math.round(this.rotation / 90) * 90;
        } else {
            this.onGround = false;
            this.rotation += 6.5; // 回転を少し速く
        }

        trail.push({ x: this.x, y: this.y, rotation: this.rotation });
        if (trail.length > 8) trail.shift();

        distance += gameSpeed;
    },

    jump() {
        if (this.onGround) {
            this.vy = JUMP_FORCE;
            createExplosion(this.x + this.width / 2, this.y + this.height, this.color, 4);
        }
    },

    draw() {
        trail.forEach((t, i) => {
            ctx.save();
            ctx.globalAlpha = i / 30;
            ctx.translate(t.x + this.width / 2, t.y + this.height / 2);
            ctx.rotate((t.rotation * Math.PI) / 180);
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
            ctx.restore();
        });

        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate((this.rotation * Math.PI) / 180);

        if (isPlayerImgLoaded) {
            ctx.drawImage(playerImg, -this.width / 2, -this.height / 2, this.width, this.height);
        } else {
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        }
        ctx.restore();
    }
};

// 障害物クラス
class Obstacle {
    constructor(type, xOffset = 0) {
        this.width = 30;
        this.height = type === 'spike' ? 32 : 45;
        this.x = canvas.width + 50 + xOffset;
        this.y = canvas.height * GROUND_Y_RATIO - this.height;
        this.type = type;
        this.passed = false;
    }

    update() {
        this.x -= gameSpeed;
    }

    draw() {
        ctx.save();
        if (this.type === 'spike') {
            ctx.fillStyle = '#000';
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y + this.height);
            ctx.lineTo(this.x + this.width / 2, this.y);
            ctx.lineTo(this.x + this.width, this.y + this.height);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        } else {
            ctx.fillStyle = '#000';
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.strokeRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4);
        }
        ctx.restore();
    }
}

// パーティクルクラス
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 2 + 1;
        this.vx = (Math.random() - 0.5) * 6;
        this.vy = (Math.random() - 0.5) * 6;
        this.life = 1.0;
        this.color = color;
        this.decay = Math.random() * 0.03 + 0.02;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

function createExplosion(x, y, color, count) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, color));
    }
}

// 動的な背景の描画
function drawBackground() {
    const groundY = canvas.height * GROUND_Y_RATIO;

    // 背景色の変化
    bgLerp += 0.005;
    if (bgLerp > 1) {
        bgLerp = 0;
        currentColorIndex = (currentColorIndex + 1) % COLORS.length;
    }
    const nextColorIndex = (currentColorIndex + 1) % COLORS.length;

    // 現在の色と次の色を補間
    const currentBg = COLORS[currentColorIndex].bg;
    const nextBg = COLORS[nextColorIndex].bg;
    const currentGround = COLORS[currentColorIndex].ground;
    const nextGround = COLORS[nextColorIndex].ground;

    // 簡易的な色補間 (RGB成分を直接補間)
    function lerpColor(color1, color2, factor) {
        const r1 = parseInt(color1.substring(1, 3), 16);
        const g1 = parseInt(color1.substring(3, 5), 16);
        const b1 = parseInt(color1.substring(5, 7), 16);
        const r2 = parseInt(color2.substring(1, 3), 16);
        const g2 = parseInt(color2.substring(3, 5), 16);
        const b2 = parseInt(color2.substring(5, 7), 16);

        const r = Math.round(r1 + (r2 - r1) * factor);
        const g = Math.round(g1 + (g2 - g1) * factor);
        const b = Math.round(b1 + (b2 - b1) * factor);

        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    ctx.fillStyle = lerpColor(currentBg, nextBg, bgLerp);
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // グリッド背景
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;

    const gridSize = 80;
    const offset = (frameCount * gameSpeed * 0.4) % gridSize;
    for (let x = -offset; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, groundY);
        ctx.stroke();
    }
    for (let y = 0; y < groundY; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    // 地面
    ctx.fillStyle = lerpColor(currentGround, nextGround, bgLerp);
    ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);

    // 地面のチェッカー模様
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    const checkerSize = 40;
    const groundOffset = (distance * 1.5) % (checkerSize * 2);
    for (let x = -checkerSize * 2; x < canvas.width; x += checkerSize * 2) {
        ctx.fillRect(x - groundOffset + checkerSize, groundY, checkerSize, checkerSize);
    }

    // 地面の輝線
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(canvas.width, groundY);
    ctx.stroke();
}

// ゴールの旗を描画する関数
function drawFlag(x, y) {
    ctx.save();
    // ポール
    ctx.fillStyle = '#e0e0e0';
    ctx.fillRect(x, y - 100, 6, 100);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y - 100, 6, 100);

    // 旗（チェッカー模様）
    const flagW = 60;
    const flagH = 40;
    const rCount = 4;
    const cCount = 6;
    const cellW = flagW / cCount;
    const cellH = flagH / rCount;

    for (let r = 0; r < rCount; r++) {
        for (let c = 0; c < cCount; c++) {
            ctx.fillStyle = (r + c) % 2 === 0 ? '#111' : '#eee';
            ctx.fillRect(x + 6 + c * cellW, y - 100 + r * cellH, cellW, cellH);
        }
    }
    
    // 枠線
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 6, y - 100, flagW, flagH);
    
    // 頂点の丸
    ctx.fillStyle = '#ffcc00';
    ctx.beginPath();
    ctx.arc(x + 3, y - 100, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
}

// ゲームループ
function gameLoop() {
    if (!isGameRunning) return;

    ctx.save();
    if (shakeAmount > 0) {
        const sx = (Math.random() - 0.5) * shakeAmount;
        const sy = (Math.random() - 0.5) * shakeAmount;
        ctx.translate(sx, sy);
        shakeAmount *= 0.85;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();

    // ゴール地点の旗を描画
    const goalX = player.x + LEVEL_LENGTH - distance;
    if (goalX > -100 && goalX < canvas.width + 100) {
        drawFlag(goalX, canvas.height * GROUND_Y_RATIO);
    }

    player.update();
    player.draw();

    if (player.onGround && frameCount % 4 === 0) {
        particles.push(new Particle(player.x, canvas.height * GROUND_Y_RATIO, '#ffffff'));
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw();
        if (p.life <= 0) particles.splice(i, 1);
    }

    // 進行状況バーとスコアの更新
    // スコアの更新 (1m進むごとに1スコア)
    score = Math.floor(distance / 100);
    document.getElementById('score').innerText = score;
    
    // HUDの更新 (距離とスピード)
    // 距離: スコアと同じ値をmとして表示
    document.getElementById('distance-display').innerText = Math.floor(distance / 100);
    // スピード: gameSpeedを疑似的にkm/hで表現する (gameSpeed * 2 くらいをkm/hとする)
    document.getElementById('speed-display').innerText = Math.floor(gameSpeed * 2.5);
    
    // スコアが25万(目標)に達したらクリア
    if (score >= 250000) {
        gameVictory();
    }

    // --- 障害物の生成ロジック (距離ベースで難易度上昇) ---
    // score(進んだメートル)に応じて、1フレームあたりの生成確率とパターンの難易度を上げる
    // 基本的な生成間隔は広めにし、「最低7メートル(700px)」は確実に空ける
    
    // 難易度(0.0 〜 1.0) の計算: 25万m(最高速)に向けて徐々に1.0に近づく
    const difficultyScore = Math.min(score, 250000);
    const difficultyRatio = difficultyScore / 250000;
    
    // スピードが速くなると間隔をあける必要があるため、gameSpeedを考慮
    // 最低でも7m(700px)は空ける。スピードが速いほどさらに余裕を持たせる
    const minDistanceBetweenObstacles = 700 + (gameSpeed * 2); 

    // フレーム毎の生成判定 (難易度に応じて生成確率が上がる)
    // 確率は非常に低く設定し、基本は間隔(minDistanceBetweenObstacles)で制御されるようにする
    const spawnChance = 0.01 + (0.04 * difficultyRatio); 

    if (Math.random() < spawnChance) {
        let lastObsX = -1000;
        if (obstacles.length > 0) {
            lastObsX = obstacles[obstacles.length - 1].x;
        }

        // キャンバスの右端 (canvas.width) より右側に、前の障害物から十分離れた位置を計算
        let spawnX = canvas.width + 50;
        
        // もし一番最後の障害物がまだ画面内〜右側にあるなら、その後ろに配置する
        if (lastObsX > canvas.width - minDistanceBetweenObstacles) {
            spawnX = lastObsX + minDistanceBetweenObstacles;
        }

        const r = Math.random();
        
        // 距離(難易度)が進むにつれて難しいパターン(トリプルなど)が出やすくなる
        const tripleChance = 0.05 + (0.25 * difficultyRatio); // 5% 〜 30%
        const doubleChance = 0.20 + (0.30 * difficultyRatio); // 20% 〜 50%
        
        // スパイク同士の間隔は30pxで固定
        if (r < tripleChance) {
            // トリプルスパイク
            obstacles.push(new Obstacle('spike', spawnX - (canvas.width + 50)));
            obstacles.push(new Obstacle('spike', spawnX - (canvas.width + 50) + 30));
            obstacles.push(new Obstacle('spike', spawnX - (canvas.width + 50) + 60));
        } else if (r < doubleChance) {
            // ダブルスパイク
            obstacles.push(new Obstacle('spike', spawnX - (canvas.width + 50)));
            obstacles.push(new Obstacle('spike', spawnX - (canvas.width + 50) + 30));
        } else {
            // シングルのスパイクまたはブロック
            obstacles.push(new Obstacle(Math.random() > 0.4 ? 'spike' : 'block', spawnX - (canvas.width + 50)));
        }
    }

    if (score >= 250000) {
        gameSpeed = 100;
    } else if (score >= 125000) {
        gameSpeed = 50;
    } else if (score >= 50000) {
        gameSpeed = 25;
    } else if (score >= 25000) {
        gameSpeed = 10;
    } else {
        gameSpeed = INITIAL_GAME_SPEED;
    }

    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        obs.update();
        obs.draw();

        const hitPadding = 6;
        if (
            player.x + hitPadding < obs.x + obs.width - hitPadding &&
            player.x + player.width - hitPadding > obs.x + hitPadding &&
            player.y + hitPadding < obs.y + obs.height - hitPadding &&
            player.y + player.height - hitPadding > obs.y + hitPadding
        ) {
            triggerGameOver();
        }

        if (obs.x + obs.width < player.x && !obs.passed) {
            obs.passed = true;
        }

        if (obs.x + obs.width < -100) {
            obstacles.splice(i, 1);
        }
    }

    ctx.restore();
    requestAnimationFrame(gameLoop);
}

function triggerGameOver() {
    isGameRunning = false;
    shakeAmount = 10;
    createExplosion(player.x + player.width / 2, player.y + player.height / 2, '#ff0000', 25);
    document.getElementById('final-score').innerText = score;
    document.getElementById('game-over-screen').classList.remove('hidden');
}

function gameVictory() {
    isGameRunning = false;
    document.getElementById('final-score').innerText = `CLEAR! Score: ${score}`;
    document.getElementById('game-over-screen').querySelector('h2').innerText = 'LEVEL COMPLETE';
    document.getElementById('game-over-screen').classList.remove('hidden');
}

function startGame() {
    isGameRunning = true;
    score = 0;
    distance = 0;
    gameSpeed = INITIAL_GAME_SPEED;
    obstacles = [];
    particles = [];
    trail = [];
    frameCount = 0;
    shakeAmount = 0;
    player.y = canvas.height * GROUND_Y_RATIO - player.height;
    player.vy = 0;
    player.rotation = 0;

    document.getElementById('score').innerText = '0';
    document.getElementById('distance-display').innerText = '0';
    document.getElementById('speed-display').innerText = '0';
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-over-screen').classList.add('hidden');
    document.getElementById('game-over-screen').querySelector('h2').innerText = 'CRASHED';

    gameLoop();
}

// イベントリスナー
const handleInput = (e) => {
    if (e.type === 'keydown' && e.code !== 'Space') return;

    if (!isGameRunning) {
        const startVisible = !document.getElementById('start-screen').classList.contains('hidden');
        const overVisible = !document.getElementById('game-over-screen').classList.contains('hidden');
        if (startVisible || overVisible) {
            startGame();
        }
    } else {
        player.jump();
    }
    if (e.type === 'keydown') e.preventDefault();
};

window.addEventListener('keydown', handleInput);
canvas.addEventListener('mousedown', handleInput);
// タッチデバイス対応
canvas.addEventListener('touchstart', (e) => {
    handleInput(e);
    e.preventDefault();
}, { passive: false });

document.getElementById('start-button').addEventListener('click', (e) => {
    e.stopPropagation();
    startGame();
});

document.getElementById('restart-button').addEventListener('click', (e) => {
    e.stopPropagation();
    startGame();
});
