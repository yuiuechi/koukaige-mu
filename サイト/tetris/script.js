const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const nextCanvas = document.getElementById('next-piece');
const nextContext = nextCanvas.getContext('2d');

context.scale(15, 15);
nextContext.scale(15, 15);

const Y_OFFSET = 4; // 上部の余白（落下開始地点を高くするため）

// 画像の読み込み（事前読み込み）
const targetImage = new Image();
targetImage.src = 'pinocchio.avif'; // コピーしたファイル名
targetImage.onload = () => {
    // 画像ロード完了後にゲームを開始可能にする
    document.getElementById('start-btn').disabled = false;
    document.getElementById('start-btn').innerText = 'START';
};

// 正解の100個のピース配置データ (20x20のグリッドの絶対座標)
// Y値が大きい（下段）ものから順に落ちてくるようにソートしてキューに入れる
const puzzleSolution = [{ "name": "I", "cells": [[19, 16], [19, 17], [19, 18], [19, 19]] }, { "name": "I", "cells": [[15, 19], [16, 19], [17, 19], [18, 19]] }, { "name": "Z", "cells": [[15, 17], [14, 18], [15, 18], [14, 19]] }, { "name": "J", "cells": [[10, 18], [10, 19], [11, 19], [12, 19]] }, { "name": "J", "cells": [[9, 17], [9, 18], [8, 19], [9, 19]] }, { "name": "S", "cells": [[7, 18], [8, 18], [6, 19], [7, 19]] }, { "name": "S", "cells": [[5, 18], [6, 18], [4, 19], [5, 19]] }, { "name": "S", "cells": [[3, 18], [4, 18], [2, 19], [3, 19]] }, { "name": "Z", "cells": [[2, 17], [1, 18], [2, 18], [1, 19]] }, { "name": "I", "cells": [[0, 16], [0, 17], [0, 18], [0, 19]] }, { "name": "T", "cells": [[17, 17], [16, 18], [17, 18], [18, 18]] }, { "name": "L", "cells": [[11, 16], [11, 17], [11, 18], [12, 18]] }, { "name": "L", "cells": [[12, 17], [13, 17], [13, 18], [13, 19]] }, { "name": "T", "cells": [[18, 15], [17, 16], [18, 16], [18, 17]] }, { "name": "I", "cells": [[16, 14], [16, 15], [16, 16], [16, 17]] }, { "name": "Z", "cells": [[15, 15], [14, 16], [15, 16], [14, 17]] }, { "name": "I", "cells": [[10, 14], [10, 15], [10, 16], [10, 17]] }, { "name": "T", "cells": [[7, 16], [6, 17], [7, 17], [8, 17]] }, { "name": "T", "cells": [[5, 15], [5, 16], [6, 16], [5, 17]] }, { "name": "O", "cells": [[3, 16], [4, 16], [3, 17], [4, 17]] }, { "name": "I", "cells": [[1, 14], [1, 15], [1, 16], [1, 17]] }, { "name": "J", "cells": [[13, 14], [13, 15], [12, 16], [13, 16]] }, { "name": "I", "cells": [[9, 13], [9, 14], [9, 15], [9, 16]] }, { "name": "I", "cells": [[8, 13], [8, 14], [8, 15], [8, 16]] }, { "name": "L", "cells": [[2, 15], [3, 15], [4, 15], [2, 16]] }, { "name": "T", "cells": [[19, 13], [18, 14], [19, 14], [19, 15]] }, { "name": "J", "cells": [[17, 13], [18, 13], [17, 14], [17, 15]] }, { "name": "I", "cells": [[14, 12], [14, 13], [14, 14], [14, 15]] }, { "name": "J", "cells": [[12, 13], [13, 13], [12, 14], [12, 15]] }, { "name": "L", "cells": [[10, 13], [11, 13], [11, 14], [11, 15]] }, { "name": "I", "cells": [[7, 12], [7, 13], [7, 14], [7, 15]] }, { "name": "T", "cells": [[6, 13], [5, 14], [6, 14], [6, 15]] }, { "name": "J", "cells": [[0, 13], [1, 13], [0, 14], [0, 15]] }, { "name": "I", "cells": [[15, 11], [15, 12], [15, 13], [15, 14]] }, { "name": "T", "cells": [[4, 12], [4, 13], [5, 13], [4, 14]] }, { "name": "O", "cells": [[2, 13], [3, 13], [2, 14], [3, 14]] }, { "name": "T", "cells": [[16, 11], [16, 12], [17, 12], [16, 13]] }, { "name": "O", "cells": [[18, 11], [19, 11], [18, 12], [19, 12]] }, { "name": "J", "cells": [[13, 10], [13, 11], [12, 12], [13, 12]] }, { "name": "O", "cells": [[10, 11], [11, 11], [10, 12], [11, 12]] }, { "name": "J", "cells": [[9, 10], [9, 11], [8, 12], [9, 12]] }, { "name": "S", "cells": [[6, 11], [7, 11], [5, 12], [6, 12]] }, { "name": "T", "cells": [[1, 11], [0, 12], [1, 12], [2, 12]] }, { "name": "T", "cells": [[2, 11], [3, 11], [4, 11], [3, 12]] }, { "name": "L", "cells": [[17, 10], [18, 10], [19, 10], [17, 11]] }, { "name": "L", "cells": [[14, 10], [15, 10], [16, 10], [14, 11]] }, { "name": "J", "cells": [[10, 10], [11, 10], [12, 10], [12, 11]] }, { "name": "J", "cells": [[6, 10], [7, 10], [8, 10], [8, 11]] }, { "name": "J", "cells": [[3, 10], [4, 10], [5, 10], [5, 11]] }, { "name": "L", "cells": [[0, 10], [1, 10], [2, 10], [0, 11]] }, { "name": "O", "cells": [[18, 8], [19, 8], [18, 9], [19, 9]] }, { "name": "I", "cells": [[14, 9], [15, 9], [16, 9], [17, 9]] }, { "name": "Z", "cells": [[14, 7], [13, 8], [14, 8], [13, 9]] }, { "name": "J", "cells": [[10, 8], [10, 9], [11, 9], [12, 9]] }, { "name": "I", "cells": [[6, 9], [7, 9], [8, 9], [9, 9]] }, { "name": "T", "cells": [[4, 8], [3, 9], [4, 9], [5, 9]] }, { "name": "S", "cells": [[2, 8], [3, 8], [1, 9], [2, 9]] }, { "name": "T", "cells": [[0, 7], [0, 8], [1, 8], [0, 9]] }, { "name": "S", "cells": [[17, 7], [18, 7], [16, 8], [17, 8]] }, { "name": "I", "cells": [[15, 5], [15, 6], [15, 7], [15, 8]] }, { "name": "I", "cells": [[12, 5], [12, 6], [12, 7], [12, 8]] }, { "name": "T", "cells": [[11, 6], [10, 7], [11, 7], [11, 8]] }, { "name": "J", "cells": [[6, 7], [6, 8], [7, 8], [8, 8]] }, { "name": "J", "cells": [[7, 7], [8, 7], [9, 7], [9, 8]] }, { "name": "T", "cells": [[5, 6], [4, 7], [5, 7], [5, 8]] }, { "name": "T", "cells": [[19, 5], [18, 6], [19, 6], [19, 7]] }, { "name": "I", "cells": [[16, 4], [16, 5], [16, 6], [16, 7]] }, { "name": "T", "cells": [[13, 5], [13, 6], [14, 6], [13, 7]] }, { "name": "J", "cells": [[3, 5], [3, 6], [2, 7], [3, 7]] }, { "name": "T", "cells": [[1, 5], [0, 6], [1, 6], [1, 7]] }, { "name": "Z", "cells": [[18, 4], [17, 5], [18, 5], [17, 6]] }, { "name": "T", "cells": [[10, 4], [10, 5], [11, 5], [10, 6]] }, { "name": "T", "cells": [[7, 5], [6, 6], [7, 6], [8, 6]] }, { "name": "T", "cells": [[9, 4], [8, 5], [9, 5], [9, 6]] }, { "name": "T", "cells": [[4, 4], [4, 5], [5, 5], [4, 6]] }, { "name": "L", "cells": [[1, 4], [2, 4], [2, 5], [2, 6]] }, { "name": "Z", "cells": [[15, 3], [14, 4], [15, 4], [14, 5]] }, { "name": "I", "cells": [[0, 2], [0, 3], [0, 4], [0, 5]] }, { "name": "I", "cells": [[19, 1], [19, 2], [19, 3], [19, 4]] }, { "name": "T", "cells": [[16, 3], [17, 3], [18, 3], [17, 4]] }, { "name": "T", "cells": [[13, 2], [13, 3], [14, 3], [13, 4]] }, { "name": "O", "cells": [[11, 3], [12, 3], [11, 4], [12, 4]] }, { "name": "S", "cells": [[8, 3], [9, 3], [7, 4], [8, 4]] }, { "name": "J", "cells": [[6, 3], [7, 3], [6, 4], [6, 5]] }, { "name": "J", "cells": [[5, 2], [6, 2], [5, 3], [5, 4]] }, { "name": "J", "cells": [[1, 3], [2, 3], [3, 3], [3, 4]] }, { "name": "L", "cells": [[10, 2], [11, 2], [12, 2], [10, 3]] }, { "name": "J", "cells": [[2, 2], [3, 2], [4, 2], [4, 3]] }, { "name": "L", "cells": [[18, 1], [16, 2], [17, 2], [18, 2]] }, { "name": "O", "cells": [[14, 1], [15, 1], [14, 2], [15, 2]] }, { "name": "L", "cells": [[9, 1], [7, 2], [8, 2], [9, 2]] }, { "name": "L", "cells": [[1, 1], [2, 1], [3, 1], [1, 2]] }, { "name": "L", "cells": [[17, 0], [18, 0], [19, 0], [17, 1]] }, { "name": "J", "cells": [[14, 0], [15, 0], [16, 0], [16, 1]] }, { "name": "I", "cells": [[10, 1], [11, 1], [12, 1], [13, 1]] }, { "name": "S", "cells": [[8, 0], [9, 0], [7, 1], [8, 1]] }, { "name": "Z", "cells": [[3, 0], [4, 0], [4, 1], [5, 1]] }, { "name": "T", "cells": [[5, 0], [6, 0], [7, 0], [6, 1]] }, { "name": "L", "cells": [[0, 0], [1, 0], [2, 0], [0, 1]] }, { "name": "I", "cells": [[10, 0], [11, 0], [12, 0], [13, 0]] }];

function initPuzzleQueue() {
    pieceQueue = puzzleSolution.map((p, idx) => ({ ...p, targetIdx: idx + 1 }));
}

// ピースの絶対座標リストからローカル配置(matrix)を作成するユーティリティ
function createMatrixFromCells(cells, targetIdx) {
    let minX = 20, minY = 20;
    cells.forEach(([x, y]) => {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
    });

    let maxX = 0, maxY = 0;
    cells.forEach(([x, y]) => {
        if (x - minX > maxX) maxX = x - minX;
        if (y - minY > maxY) maxY = y - minY;
    });

    const size = Math.max(maxX, maxY) + 1;
    // 回転しやすいように中心を合わせるにはサイズを調整する必要があるが、
    // 画像パズルなので、切り出された正解画像の状態で提供し、回転させない仕様にするか、
    // 正方形マトリクスに配置する形をとる。
    const matSize = size <= 2 ? 2 : (size <= 3 ? 3 : 4);

    const matrix = Array.from({ length: matSize }, () => Array(matSize).fill(0));
    cells.forEach(([x, y]) => {
        // 画像上の絶対X座標を含めておく(描画のため)
        matrix[y - minY][x - minX] = {
            id: targetIdx,
            imgX: x,
            imgY: y,
            solved: false
        };
    });
    return matrix;
}

let arena = createMatrix(20, 20 + Y_OFFSET); // 20列 x 24行

const player = {
    pos: { x: 0, y: 0 },
    matrix: null,
    score: 0,
    lines: 0, // 今回は使用しないが残す
    level: 1,
    nextMatrix: null,
    piecesPlaced: 0 // 全25ピース中いくつ置いたか
};

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
let isGameOver = false;
let isPlaying = false;
let animationId = null;

function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0)); // 0: clear
    }
    return matrix;
}

function collide(arena, player) {
    const m = player.matrix;
    const o = player.pos;
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
                (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                // 配置されたかどうかの判定（座標が合っているか）
                // プレイヤの現在の絶対座標 (x + player.pos.x, y + player.pos.y) が
                // ピースが元々あった画像上の座標 (value.imgX, value.imgY) とオフセットを加味して一致するかチェック
                const isCorrect = (x + player.pos.x === value.imgX) && (y + player.pos.y === value.imgY + Y_OFFSET);
                arena[y + player.pos.y][x + player.pos.x] = {
                    id: value.id,
                    imgX: value.imgX,
                    imgY: value.imgY,
                    isCorrect: isCorrect
                };
            }
        });
    });
}

function getNextPiece() {
    if (pieceQueue.length === 0) return null;
    const nextItem = pieceQueue.shift();
    return createMatrixFromCells(nextItem.cells, nextItem.targetIdx);
}

function drawMatrix(matrix, offset, ctx) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                const drawX = x + offset.x; // Canvas上のGrid X座標 (0~9)
                const drawY = y + offset.y; // Canvas上のGrid Y座標 (0~9)

                // 画像がロードされている場合
                if (targetImage.complete && targetImage.naturalHeight !== 0) {
                    // ここが重要：
                    // 元の画像から切り出す位置は、このブロック自体が本来「完成図のどこに居るべきか」である
                    // value.imgX, value.imgY を使用する。
                    // 1マスのサイズは、画像全体の幅(targetImage.width)を10分割したもの。
                    const srcW = targetImage.width / 20;
                    const srcH = targetImage.height / 20;
                    const srcX = value.imgX * srcW;
                    const srcY = value.imgY * srcH;

                    // 背景が透けないように、まず黒色（または背景色）で塗りつぶす（完全不透明を保証）
                    ctx.fillStyle = '#050510';
                    ctx.fillRect(drawX, drawY, 1, 1);

                    ctx.drawImage(
                        targetImage,
                        srcX, srcY, srcW, srcH, // 元画像からの切り出し元
                        drawX, drawY, 1, 1      // Canvasへの描画先（1x1のスケール）
                    );

                    // ピースの境界線を不透明にする（見やすくするため）
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
                    ctx.lineWidth = 0.05;
                    ctx.strokeRect(drawX, drawY, 1, 1);

                    // もし配置済みで不正解なら赤っぽくする
                    if (value.isCorrect === false) {
                        ctx.fillStyle = 'rgba(255, 0, 0, 0.4)';
                        ctx.fillRect(drawX, drawY, 1, 1);
                    }
                } else {
                    // フォールバック
                    ctx.fillStyle = '#FFFDD0';
                    ctx.fillRect(drawX, drawY, 1, 1);
                }
            }
        });
    });
}

function drawBackground() {
    if (targetImage.complete && targetImage.naturalHeight !== 0) {
        // 背景全体を薄く表示する
        context.globalAlpha = 0.8; // ガイドとして適切な明るさに調整
        context.drawImage(targetImage, 0, Y_OFFSET, 20, 20); // Y_OFFSET分下にずらして描画
        context.globalAlpha = 1.0;

        // グリッド線を描く
        context.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        context.lineWidth = 0.02;
        for (let i = 0; i <= 20; i++) {
            context.beginPath(); context.moveTo(i, 0); context.lineTo(i, 20); context.stroke();
            context.beginPath(); context.moveTo(0, i); context.lineTo(20, i); context.stroke();
        }
    }
}

function draw() {
    // 画面をクリア（20x24の全範囲）
    context.clearRect(0, 0, 20, 20 + Y_OFFSET);

    // 下地の色を塗る（背景画像が見やすい程度の暗さ）
    context.fillStyle = '#050510';
    context.fillRect(0, 0, 20, 20 + Y_OFFSET);

    drawBackground();

    // 既に置かれたブロックを描画（これらは不透明で固定）
    context.globalAlpha = 1.0;
    drawMatrix(arena, { x: 0, y: 0 }, context);

    // 操作中のブロックを描画（不透明で鮮明に表示）
    if (player.matrix) {
        context.globalAlpha = 1.0;
        drawMatrix(player.matrix, player.pos, context);
    }
}

function drawNext() {
    // 完全にクリア
    nextContext.clearRect(0, 0, nextCanvas.width, nextCanvas.height);

    if (player.nextMatrix) {
        // 配置を中央にするためのオフセット計算
        const offset = {
            x: 2 - player.nextMatrix[0].length / 2,
            y: 2 - player.nextMatrix.length / 2
        };
        drawMatrix(player.nextMatrix, offset, nextContext);
    }
}

function arenaSweep() {
    // 行消去ロジックを削除
    // この関数は、ブロックが着地した際に呼び出されるが、
    // 今回のゲームでは行を消去しないため、何もしない。
    // ただし、将来的にスコア計算などが必要になる場合はここにロジックを追加する。
}

function checkClear() {
    let isClear = true;
    for (let y = 0; y < arena.length; ++y) {
        for (let x = 0; x < arena[y].length; ++x) {
            // パズルに必要な総ブロック数（今回は25ピース×4マス＝100マス）が
            // 全て正しい位置（isCorrect）に置かれているかを判定
            // 簡易的に全マス（10x10）を走査して、arena[y][x]が0でなく、かつisCorrectがfalseなら未完成
            if (arena[y][x] !== 0 && arena[y][x].isCorrect === false) {
                isClear = false;
                break;
            }
        }
        if (!isClear) break;
    }

    // 全25ピース配置完了し、かつ全てCorrectならクリア
    if (player.piecesPlaced >= 100 && isClear) {
        gameClear();
    } else if (player.piecesPlaced >= 100 && !isClear) {
        // 置き切ったけど間違っている場合はゲームオーバー（またはリトライさせる）
        gameOver();
    }
}

function gameClear() {
    isPlaying = false;
    isGameOver = true;
    cancelAnimationFrame(animationId);
    const gameOverEl = document.getElementById('game-over');
    gameOverEl.classList.remove('hidden');
    gameOverEl.innerHTML = '<h2 class="glow-text" style="color:var(--neon-green); text-shadow:0 0 20px var(--neon-green);">PUZZLE CLEARED!</h2>';
    document.getElementById('start-btn').innerText = 'PLAY AGAIN';
}

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        player.piecesPlaced++;
        playerReset();
        arenaSweep();
        updateScore();
        checkClear();
    }
    dropCounter = 0;
}

function playerHardDrop() {
    let dropDistance = 0;
    while (!collide(arena, player) && dropDistance < (20 + Y_OFFSET)) {
        player.pos.y++;
        dropDistance++;
    }
    player.pos.y--;
    merge(arena, player);
    player.piecesPlaced++;
    playerReset();
    arenaSweep();
    updateScore();
    checkClear();
    dropCounter = 0;
}

function playerMove(offset) {
    player.pos.x += offset;
    if (collide(arena, player)) {
        player.pos.x -= offset;
    }
}

function playerReset() {
    if (pieceQueue.length === 0 && !player.nextMatrix) {
        // ピースがもう無い場合は何もしない（checkClearで判定される）
        player.matrix = null;
        return;
    }

    if (!player.nextMatrix) {
        player.nextMatrix = getNextPiece();
    }

    player.matrix = player.nextMatrix;
    player.nextMatrix = getNextPiece();

    if (player.matrix) {
        player.pos.y = 0;
        player.pos.x = Math.floor(arena[0].length / 2) - Math.floor(player.matrix[0].length / 2);

        if (collide(arena, player)) {
            gameOver();
        }
    }
    drawNext();
}

function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);

    let loopCount = 0;
    const maxLoops = player.matrix[0].length * 2;

    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        loopCount++;

        if (offset > player.matrix[0].length || loopCount > maxLoops) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                    matrix[y][x],
                    matrix[x][y],
                ];
        }
    }

    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

function update(time = 0) {
    if (!isPlaying) return;

    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    draw();
    animationId = requestAnimationFrame(update);
}

function updateScore() {
    // スコアの代わりに残りピース数などを表示しても良い
    const scoreVal = player.score;
    const levelVal = player.level;
    const linesVal = 100 - player.piecesPlaced;

    // スマホ/共有表示
    document.getElementById('score').innerText = scoreVal;
    document.getElementById('level').innerText = levelVal;
    document.getElementById('lines').innerText = linesVal;

    // デスクトップ用表示の同期
    const scoreD = document.getElementById('score-d');
    const levelD = document.getElementById('level-d');
    const linesD = document.getElementById('lines-d');
    if (scoreD) scoreD.innerText = scoreVal;
    if (levelD) levelD.innerText = levelVal;
    if (linesD) linesD.innerText = linesVal;

    // 画面内HUD: レベル表示の更新
    const canvasLevel = document.getElementById('canvas-level-display');
    if (canvasLevel) {
        canvasLevel.innerText = `Level ${levelVal}`;
    }
}

function gameOver() {
    isPlaying = false;
    isGameOver = true;
    cancelAnimationFrame(animationId);
    const gameOverEl = document.getElementById('game-over');
    gameOverEl.classList.remove('hidden');
    gameOverEl.innerHTML = '<h2 class="glow-text">GAME OVER</h2>';
    document.getElementById('start-btn').innerText = 'RETRY';
}

function init() {
    arena = createMatrix(20, 20 + Y_OFFSET);
    player.score = 0;
    player.lines = 0;
    player.piecesPlaced = 0;
    player.level = 1;
    player.nextMatrix = null;
    dropInterval = 1000;
    isGameOver = false;

    initPuzzleQueue();

    document.getElementById('game-over').classList.add('hidden');
    updateScore();
    playerReset();
}

document.addEventListener('keydown', event => {
    if (!isPlaying) return;

    switch (event.keyCode) {
        case 37: // Left
            playerMove(-1);
            break;
        case 39: // Right
            playerMove(1);
            break;
        case 40: // Down
            playerDrop();
            break;
        case 38: // Up
            // 画像パズルなので回転させずそのまま落とさせるため無効化
            // playerRotate(1);
            event.preventDefault(); // スクロール防止
            break;
        case 32: // Space
            playerHardDrop();
            event.preventDefault(); // スクロール防止
            break;
    }
});

document.getElementById('start-btn').addEventListener('click', () => {
    if (isGameOver || !isPlaying) {
        // スタートまたはリトライ
        if (isGameOver) {
            init();
        } else if (arena[9].every(val => val === 0)) {
            // 初回起動時の初期化
            init();
        }
        isPlaying = true;
        document.getElementById('start-btn').innerText = 'PAUSE';
        lastTime = performance.now();
        update();
    } else {
        // ポーズ
        isPlaying = false;
        document.getElementById('start-btn').innerText = 'RESUME';
        cancelAnimationFrame(animationId);
    }
});

// 初期描画
draw();

// =============================================
// スマホ用タッチ操作のサポート
// =============================================

// ---- スマホ用スタートボタン ----
function doStartOrPause(btn) {
    // 全ボタンのテキストを同期する内部ヘルパー
    function syncBtnText(text) {
        const d = document.getElementById('start-btn');
        const m = document.getElementById('start-btn-mobile');
        if (d) d.innerText = text;
        if (m) m.innerText = text;
    }

    if (isGameOver || !isPlaying) {
        if (isGameOver) {
            init();
        } else if (arena[9].every(val => val === 0)) {
            init();
        }
        isPlaying = true;
        syncBtnText('PAUSE');
        lastTime = performance.now();
        update();
    } else {
        isPlaying = false;
        syncBtnText('RESUME');
        cancelAnimationFrame(animationId);
    }
}

// デスクトップ用スタートボタンをdoStartOrPauseで上書き
const desktopStartBtn = document.getElementById('start-btn');
if (desktopStartBtn) {
    const oldListeners = desktopStartBtn.cloneNode(false);
    desktopStartBtn.parentNode.replaceChild(oldListeners, desktopStartBtn);
    // replaceChildでリスナー削除後に再取得して再設定
    document.getElementById('start-btn').addEventListener('click', () => {
        doStartOrPause(document.getElementById('start-btn'));
    });
}

// スマホ用スタートボタン
const mobileStartBtn = document.getElementById('start-btn-mobile');
if (mobileStartBtn) {
    mobileStartBtn.addEventListener('click', () => doStartOrPause(mobileStartBtn));
    // 画像ロード後に有効化
    if (targetImage.complete && targetImage.naturalHeight !== 0) {
        mobileStartBtn.disabled = false;
        mobileStartBtn.innerText = 'START';
    } else {
        targetImage.addEventListener('load', () => {
            mobileStartBtn.disabled = false;
            mobileStartBtn.innerText = 'START';
        });
    }
}

// ---- 方向パッドボタン ----
function addDpadBtn(id, action) {
    const btn = document.getElementById(id);
    if (!btn) return;
    const fire = (e) => { e.preventDefault(); if (isPlaying) action(); };
    btn.addEventListener('touchstart', fire, { passive: false });
    btn.addEventListener('click', fire);
}

addDpadBtn('btn-left', () => playerMove(-1));
addDpadBtn('btn-right', () => playerMove(1));
addDpadBtn('btn-down', () => playerDrop());
addDpadBtn('btn-drop', () => playerHardDrop());

// ---- スワイプ操作（キャンバス上） ----
let touchStartX = 0, touchStartY = 0, touchStartTime = 0;

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchStartTime = Date.now();
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (!isPlaying) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    const dt = Date.now() - touchStartTime;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (absDx < 10 && absDy < 10 && dt < 300) {
        // タップ → ハードドロップ
        playerHardDrop();
    } else if (absDx > absDy) {
        // 左右スワイプ → 移動
        const cells = Math.max(1, Math.round(absDx / 15));
        for (let i = 0; i < cells; i++) playerMove(dx > 0 ? 1 : -1);
    } else if (dy > 20) {
        // 下スワイプ → ハードドロップ
        playerHardDrop();
    }
}, { passive: false });
