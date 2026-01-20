import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
} from './constants.js';
import { drawGrid } from './render.js';

let canvas;
let ctx;

export function startGame() {
  canvas = document.getElementById('game');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  ctx = canvas.getContext('2d');

  gameLoop();
}

function gameLoop() {
  update();
  render();

  requestAnimationFrame(gameLoop);
}

function update() {
  // game logic will go here later
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid(ctx);
}