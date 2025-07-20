const boardSize = 4;
let board = [];
let score = 0;

const boardEl = document.getElementById('game-board');
const scoreEl = document.getElementById('score');
const restartBtn = document.getElementById('restart-btn');

function initBoard() {
  board = Array.from({ length: boardSize }, () => Array(boardSize).fill(0));
  score = 0;
  updateScore();
  addRandomTile();
  addRandomTile();
  renderBoard();
}

function addRandomTile() {
  const empty = [];
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      if (board[r][c] === 0) empty.push([r, c]);
    }
  }
  if (empty.length === 0) return;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  board[r][c] = Math.random() < 0.9 ? 2 : 4;
}

function renderBoard() {
  boardEl.innerHTML = '';
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      const value = board[r][c];
      const tile = document.createElement('div');
      tile.className = 'tile';
      if (value) {
        tile.textContent = value;
        tile.setAttribute('data-value', value);
      } else {
        tile.innerHTML = '&nbsp;';
      }
      boardEl.appendChild(tile);
    }
  }
}

function updateScore() {
  scoreEl.textContent = score;
}

function move(dir) {
  let moved = false;
  let merged = Array.from({ length: boardSize }, () => Array(boardSize).fill(false));
  let addScore = 0;

  function traverse(callback) {
    for (let i = 0; i < boardSize; i++) {
      for (let j = 0; j < boardSize; j++) {
        let r = i, c = j;
        if (dir === 'right') c = boardSize - 1 - j;
        if (dir === 'down') r = boardSize - 1 - i;
        callback(r, c);
      }
    }
  }

  traverse((r, c) => {
    if (board[r][c] === 0) return;
    let nr = r, nc = c;
    while (true) {
      let tr = nr, tc = nc;
      if (dir === 'left') tc--;
      if (dir === 'right') tc++;
      if (dir === 'up') tr--;
      if (dir === 'down') tr++;
      if (tr < 0 || tr >= boardSize || tc < 0 || tc >= boardSize) break;
      if (board[tr][tc] === 0) {
        board[tr][tc] = board[nr][nc];
        board[nr][nc] = 0;
        nr = tr; nc = tc;
        moved = true;
      } else if (board[tr][tc] === board[nr][nc] && !merged[tr][tc]) {
        board[tr][tc] *= 2;
        board[nr][nc] = 0;
        merged[tr][tc] = true;
        addScore += board[tr][tc];
        moved = true;
        break;
      } else {
        break;
      }
    }
  });

  if (moved) {
    score += addScore;
    updateScore();
    addRandomTile();
    renderBoard();
    if (isGameOver()) {
      setTimeout(() => alert('游戏结束！'), 100);
    }
  }
}

function isGameOver() {
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      if (board[r][c] === 0) return false;
      for (const [dr, dc] of [[0,1],[1,0],[-1,0],[0,-1]]) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < boardSize && nc >= 0 && nc < boardSize) {
          if (board[nr][nc] === board[r][c]) return false;
        }
      }
    }
  }
  return true;
}

// 键盘操作
window.addEventListener('keydown', e => {
  switch (e.key) {
    case 'ArrowLeft': move('left'); break;
    case 'ArrowRight': move('right'); break;
    case 'ArrowUp': move('up'); break;
    case 'ArrowDown': move('down'); break;
  }
});

// 触摸操作
let touchStartX, touchStartY;
boardEl.addEventListener('touchstart', e => {
  if (e.touches.length !== 1) return;
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
});
boardEl.addEventListener('touchend', e => {
  if (e.changedTouches.length !== 1) return;
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 30) move('right');
    else if (dx < -30) move('left');
  } else {
    if (dy > 30) move('down');
    else if (dy < -30) move('up');
  }
});

restartBtn.addEventListener('click', initBoard);

// 初始化
initBoard(); 