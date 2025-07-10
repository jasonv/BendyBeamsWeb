'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { levels } from './levels';  

const GRID_SIZE = 11;
const SQUARE_SIZE = 40; // px
const NEXT_LEVEL_DELAY = 1000; // ms

const imageIds = [
  'CER', 'CERO', 'CNR', 'CNRO', 'CSR', 'CSRO', 'CWR', 'CWRO',
  'MNE', 'MNEO', 'MNW', 'MNWO', 'MSE', 'MSEO', 'MSW', 'MSWO',
  'PPP', 'SSS', 'SSSC', 'SSSH', 'SSSV',
  'TER', 'TERO', 'TNR', 'TNRO', 'TSR', 'TSRO', 'TWR', 'TWRO',
  'ZZZ'
];

function getImageSrc(id: string) {
  return `/images/${id}.png`;
}

type GameState = {
  levelNum: number;
  curLevel: string[][];
  player: { x: number; y: number };
  win: boolean;
  statusMsg: string;
  curCannon: [number, number, number, number];
  curLaser: number[][];
};

function parseLevel(level: string[]): { grid: string[][]; player: { x: number; y: number } } {
  const grid: string[][] = [];
  let player = { x: 0, y: 0 };
  for (let y = 0; y < level.length; y++) {
    const row: string[] = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      const item = level[y].substring(x * 3, x * 3 + 3);
      row.push(item);
      if (item === '(P)') {
        player = { x, y };
      }
    }
    grid.push(row);
  }
  return { grid, player };
}

function getCannonInfo(level: string[][]): [number, number, number, number] {
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const piece = level[y][x];
      if (piece[0] === 'C') {
        let dx = 0, dy = 0;
        if (piece[1] === 'N') dy = -1;
        if (piece[1] === 'E') dx = 1;
        if (piece[1] === 'S') dy = 1;
        if (piece[1] === 'W') dx = -1;
        return [x, y, dx, dy];
      }
    }
  }
  return [0, 0, 0, 0];
}

function getLaser(level: string[][], levelNum: number, setWin: (v: boolean) => void, setStatusMsg: (msg: string) => void): number[][] {
  const result = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
  let [xx, yy, dx, dy] = getCannonInfo(level);
  result[yy][xx] = 1;
  let hit = false;
  let laserType = 0;
  while (!hit) {
    laserType = dy === 0 ? 2 : 1;
    xx += dx;
    yy += dy;
    let piece = '';
    if (xx >= 0 && xx < GRID_SIZE && yy >= 0 && yy < GRID_SIZE) {
      piece = level[yy][xx];
      if (result[yy][xx] >= 3) laserType = 3;
    }
    if (piece === '   ') {
      result[yy][xx] = laserType;
    } else if (piece === 'MNE') {
      result[yy][xx] = laserType;
      if (dx === 0 && dy === 1) { dx = 1; dy = 0; }
      else if (dx === -1 && dy === 0) { dx = 0; dy = -1; }
      else { result[yy][xx] = 0; hit = true; }
    } else if (piece === 'MSE') {
      result[yy][xx] = laserType;
      if (dx === -1 && dy === 0) { dx = 0; dy = 1; }
      else if (dx === 0 && dy === -1) { dx = 1; dy = 0; }
      else { result[yy][xx] = 0; hit = true; }
    } else if (piece === 'MSW') {
      result[yy][xx] = laserType;
      if (dx === 1 && dy === 0) { dx = 0; dy = 1; }
      else if (dx === 0 && dy === -1) { dx = -1; dy = 0; }
      else { result[yy][xx] = 0; hit = true; }
    } else if (piece === 'MNW') {
      result[yy][xx] = laserType;
      if (dx === 1 && dy === 0) { dx = 0; dy = -1; }
      else if (dx === 0 && dy === 1) { dx = -1; dy = 0; }
      else { result[yy][xx] = 0; hit = true; }
    } else if (piece[0] === 'T') {
      result[yy][xx] = laserType;
      hit = true;
      setWin(true);
      setStatusMsg(levels[levelNum]?.message ?? 'Win!');
    } else {
      hit = true;
    }
  }
  return result;
}

function getImageId(level: string[][], x: number, y: number) {
  let id = level[y][x];
  if (id === '   ') id = 'SSS';
  if (id === '###') id = 'ZZZ';
  if (id === '(P)') id = 'PPP';
  return id;
}

export default function Page() {
  const [state, setState] = useState<GameState>(() => {
    const { grid, player } = parseLevel(levels[0].level);
    return {
      levelNum: 0,
      curLevel: grid,
      player,
      win: false,
      statusMsg: `Level 1`,
      curCannon: getCannonInfo(grid),
      curLaser: Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0)),
    };
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<Record<string, HTMLImageElement>>({});

  // Load all images
  useEffect(() => {
    const imgMap: Record<string, HTMLImageElement> = {};
    let loadedCount = 0;
    imageIds.forEach((id) => {
      const img = new window.Image();
      img.src = getImageSrc(id);
      img.onload = () => {
        loadedCount++;
        if (loadedCount === imageIds.length) setImages({ ...imgMap });
      };
      imgMap[id] = img;
    });
  }, []);

  // Redraw whenever game state/images change
  useEffect(() => {
    drawLevel();
  }, [state.curLevel, state.curLaser, images]);

  // Draw the board
  function drawLevel() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw board
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const id = getImageId(state.curLevel, x, y);
        const img = images[id];
        if (img) ctx.drawImage(img, x * SQUARE_SIZE, y * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);
      }
    }
    // Draw laser overlays
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        let laser = state.curLaser[y][x];
        let id = getImageId(state.curLevel, x, y);
        if (laser === 1) id = id === 'SSS' ? id + 'V' : id + 'O';
        if (laser === 2) id = id === 'SSS' ? id + 'H' : id + 'O';
        if (laser === 3) id = id === 'SSS' ? id + 'C' : id + 'O';
        const img = images[id];
        if (img) ctx.drawImage(img, x * SQUARE_SIZE, y * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);
      }
    }
  }

  // Movement logic
  function spaceOpen(level: string[][], x: number, y: number, dx: number, dy: number) {
    const nx = x + dx, ny = y + dy;
    if (nx < 0 || nx >= GRID_SIZE || ny < 0 || ny >= GRID_SIZE) return false;
    const piece = level[ny][nx];
    return piece === '   ' || piece === '(P)';
  }
  function spacePushable(level: string[][], x: number, y: number, dx: number, dy: number) {
    const nx = x + dx, ny = y + dy;
    if (nx < 0 || nx >= GRID_SIZE || ny < 0 || ny >= GRID_SIZE) return false;
    const piece = level[ny][nx];
    return piece[0] === 'M';
  }
  function move(dx: number, dy: number) {
    if (state.win) return; // Prevent moves after win
    const { x, y } = state.player;
    const level = state.curLevel.map(row => [...row]); // Deep copy for immutability
    let moved = false;

    if (spaceOpen(level, x, y, dx, dy)) {
      level[y + dy][x + dx] = level[y][x];
      level[y][x] = '   ';
      setState((prev) => ({
        ...prev,
        curLevel: level,
        player: { x: x + dx, y: y + dy },
      }));
      moved = true;
    } else if (spacePushable(level, x, y, dx, dy)) {
      if (spaceOpen(level, x + dx, y + dy, dx, dy)) {
        level[y + dy + dy][x + dx + dx] = level[y + dy][x + dx];
        level[y + dy][x + dx] = level[y][x];
        level[y][x] = '   ';
        setState((prev) => ({
          ...prev,
          curLevel: level,
          player: { x: x + dx, y: y + dy },
        }));
        moved = true;
      }
    }
    if (moved) {
      // After move, update laser state
      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          curLaser: getLaser(level, prev.levelNum, (v) => setState(s => ({ ...s, win: v })), (msg) => setState(s => ({ ...s, statusMsg: msg }))),
        }));
      }, 0);
    }
  }

  // Handle keys
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') move(-1, 0);
      if (e.key === 'ArrowRight') move(1, 0);
      if (e.key === 'ArrowUp') move(0, -1);
      if (e.key === 'ArrowDown') move(0, 1);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line
  }, [state.player, state.curLevel, state.win]);

  // Next and Reset
  const nextLevel = useCallback(() => {
    const newLevelNum = (state.levelNum + 1) % levels.length;
    const { grid, player } = parseLevel(levels[newLevelNum].level);
    setState({
      levelNum: newLevelNum,
      curLevel: grid,
      player,
      win: false,
      statusMsg: `Level ${newLevelNum + 1}`,
      curCannon: getCannonInfo(grid),
      curLaser: getLaser(grid, newLevelNum, (v) => setState(s => ({ ...s, win: v })), (msg) => setState(s => ({ ...s, statusMsg: msg }))),
    });
  }, [state.levelNum]);

  const resetLevel = useCallback(() => {
    const { grid, player } = parseLevel(levels[state.levelNum].level);
    setState({
      ...state,
      curLevel: grid,
      player,
      win: false,
      statusMsg: `Level ${state.levelNum + 1}`,
      curCannon: getCannonInfo(grid),
      curLaser: getLaser(grid, state.levelNum, (v) => setState(s => ({ ...s, win: v })), (msg) => setState(s => ({ ...s, statusMsg: msg }))),
    });
  }, [state.levelNum]);

  // Draw first time
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      curLaser: getLaser(prev.curLevel, prev.levelNum, (v) => setState(s => ({ ...s, win: v })), (msg) => setState(s => ({ ...s, statusMsg: msg }))),
    }));
    // eslint-disable-next-line
  }, []);

  // --- 3 second wait before advancing after win ---
  useEffect(() => {
    if (state.win) {
      const timeout = setTimeout(() => {
        nextLevel();
      }, NEXT_LEVEL_DELAY);
      return () => clearTimeout(timeout);
    }
  }, [state.win, nextLevel]);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <h1>Bendy Beams</h1>
      <h2 id="status">
        {state.statusMsg}
      </h2>
      <canvas
        ref={canvasRef}
        width={GRID_SIZE * SQUARE_SIZE}
        height={GRID_SIZE * SQUARE_SIZE}
        style={{ height: '375px', backgroundColor: 'black' }}
        tabIndex={0}
      />
      <div>
        <a href="#" id="resetButton" onClick={resetLevel}>Reset</a> 
        &nbsp; &nbsp; &nbsp;
        <a href="#"id="soundButton">Sound</a>
      </div>
    </div>
  );
}
