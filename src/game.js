import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
} from './constants.js';
import { drawGrid, drawUnit } from './render.js';
import { createPlayerUnit } from './units.js';
import { setupInput } from './input.js';

let canvas;
let ctx;

const gameState = {
  units: [],
  selectedUnitId: null,
};

export function startGame() {
  canvas = document.getElementById('game');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  ctx = canvas.getContext('2d');

  gameState.units.push(createPlayerUnit());

  setupInput(canvas, gameState);

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

  for (const unit of gameState.units) {
    const isSelected = unit.id === gameState.selectedUnitId;
    drawUnit(ctx, unit, isSelected);
  }
}