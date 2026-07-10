// blog_pages/site-is-back/ — сапёр и прочее

(function () {
  'use strict';

  const ROWS = 9;
  const COLS = 9;
  const MINES = 10;

  const boardEl = document.getElementById('ms-board');
  const minesLeftEl = document.getElementById('ms-mines-left');
  const timerEl = document.getElementById('ms-timer');
  const statusEl = document.getElementById('ms-status');
  const resetBtn = document.getElementById('ms-reset');

  if (!boardEl) return;

  let grid = [];
  let revealedCount = 0;
  let flaggedCount = 0;
  let gameOver = false;
  let gameWon = false;
  let firstClick = true;
  let timerId = null;
  let seconds = 0;

  function pad3(n) {
    return String(Math.max(0, n)).padStart(3, '0');
  }

  function idx(r, c) {
    return r * COLS + c;
  }

  function inBounds(r, c) {
    return r >= 0 && r < ROWS && c >= 0 && c < COLS;
  }

  function neighbors(r, c) {
    const list = [];
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr;
        const nc = c + dc;
        if (inBounds(nr, nc)) list.push([nr, nc]);
      }
    }
    return list;
  }

  function createEmptyGrid() {
    grid = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        grid.push({
          mine: false,
          adjacent: 0,
          revealed: false,
          flagged: false,
        });
      }
    }
  }

  function placeMines(safeR, safeC) {
    const safe = new Set([idx(safeR, safeC)]);
    neighbors(safeR, safeC).forEach(function (pair) {
      safe.add(idx(pair[0], pair[1]));
    });

    let placed = 0;
    while (placed < MINES) {
      const r = Math.floor(Math.random() * ROWS);
      const c = Math.floor(Math.random() * COLS);
      const i = idx(r, c);
      if (safe.has(i) || grid[i].mine) continue;
      grid[i].mine = true;
      placed++;
    }

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const i = idx(r, c);
        if (grid[i].mine) continue;
        grid[i].adjacent = neighbors(r, c).filter(function (pair) {
          return grid[idx(pair[0], pair[1])].mine;
        }).length;
      }
    }
  }

  function stopTimer() {
    if (timerId !== null) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  function startTimer() {
    stopTimer();
    seconds = 0;
    timerEl.textContent = pad3(seconds);
    timerId = setInterval(function () {
      seconds++;
      if (seconds > 999) seconds = 999;
      timerEl.textContent = pad3(seconds);
    }, 1000);
  }

  function updateMinesLeft() {
    minesLeftEl.textContent = pad3(MINES - flaggedCount);
  }

  function setStatus(text) {
    statusEl.textContent = text;
  }

  function setFace(emoji) {
    resetBtn.textContent = emoji;
  }

  function revealAllMines() {
    grid.forEach(function (cell, i) {
      if (!cell.mine) return;
      const el = boardEl.children[i];
      cell.revealed = true;
      el.classList.add('revealed', 'mine');
      el.classList.remove('flagged');
    });
  }

  function checkWin() {
    if (revealedCount === ROWS * COLS - MINES) {
      gameWon = true;
      gameOver = true;
      stopTimer();
      setFace('😎');
      setStatus('Победа! Ты настоящий сапёр! 🎉');
    }
  }

  function floodReveal(r, c) {
    const stack = [[r, c]];
    const seen = new Set();

    while (stack.length) {
      const pair = stack.pop();
      const cr = pair[0];
      const cc = pair[1];
      const key = cr + ',' + cc;
      if (seen.has(key)) continue;
      seen.add(key);

      const i = idx(cr, cc);
      const cell = grid[i];
      const el = boardEl.children[i];

      if (cell.flagged || cell.revealed) continue;

      cell.revealed = true;
      revealedCount++;
      el.classList.add('revealed');
      el.classList.remove('flagged');

      if (cell.adjacent > 0) {
        el.textContent = String(cell.adjacent);
        el.classList.add('n' + cell.adjacent);
      } else {
        el.textContent = '';
        neighbors(cr, cc).forEach(function (n) {
          const ni = idx(n[0], n[1]);
          if (!grid[ni].revealed && !grid[ni].flagged) {
            stack.push(n);
          }
        });
      }
    }
  }

  function revealCell(r, c) {
    const i = idx(r, c);
    const cell = grid[i];
    const el = boardEl.children[i];

    if (gameOver || cell.flagged || cell.revealed) return;

    if (firstClick) {
      firstClick = false;
      placeMines(r, c);
      startTimer();
    }

    if (cell.mine) {
      cell.revealed = true;
      el.classList.add('revealed', 'mine');
      gameOver = true;
      stopTimer();
      setFace('😵');
      setStatus('Бум! Попробуй ещё раз 💥');
      revealAllMines();
      return;
    }

    if (cell.adjacent === 0) {
      floodReveal(r, c);
    } else {
      cell.revealed = true;
      revealedCount++;
      el.classList.add('revealed');
      el.textContent = String(cell.adjacent);
      el.classList.add('n' + cell.adjacent);
    }

    checkWin();
  }

  function toggleFlag(r, c) {
    if (gameOver) return;

    const i = idx(r, c);
    const cell = grid[i];
    const el = boardEl.children[i];

    if (cell.revealed) return;

    if (cell.flagged) {
      cell.flagged = false;
      flaggedCount--;
      el.classList.remove('flagged');
    } else {
      cell.flagged = true;
      flaggedCount++;
      el.classList.add('flagged');
      el.textContent = '';
      el.className = 'ms-cell flagged';
    }

    updateMinesLeft();
  }

  function renderBoard() {
    boardEl.innerHTML = '';
    boardEl.style.gridTemplateColumns = 'repeat(' + COLS + ', 28px)';

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = document.createElement('button');
        cell.type = 'button';
        cell.className = 'ms-cell';
        cell.dataset.row = String(r);
        cell.dataset.col = String(c);
        cell.addEventListener('click', function (e) {
          e.preventDefault();
          revealCell(r, c);
        });
        cell.addEventListener('contextmenu', function (e) {
          e.preventDefault();
          toggleFlag(r, c);
        });
        boardEl.appendChild(cell);
      }
    }
  }

  function resetGame() {
    stopTimer();
    createEmptyGrid();
    revealedCount = 0;
    flaggedCount = 0;
    gameOver = false;
    gameWon = false;
    firstClick = true;
    seconds = 0;
    timerEl.textContent = pad3(0);
    updateMinesLeft();
    setFace('🙂');
    setStatus('');
    renderBoard();
  }

  resetBtn.addEventListener('click', resetGame);
  resetGame();

  const extra = document.getElementById('post-extra');
  if (extra) {
    extra.textContent = '';
  }
})();
