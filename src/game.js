import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
} from './constants.js';
import { drawGrid, drawUnit } from './render.js';
import { createPlayerUnit, createEnemyUnit } from './units.js';
import { setupInput } from './input.js';
import { drawMoveTiles } from './render.js';
import { getMovableTiles } from './grid.js';
import { attack, inRange } from './combat.js'

let canvas;
let ctx;

const gameState = {
  units: [],
  selectedUnitId: null,
  currentTurn: 'player', // 'player' or 'enemy'
};


export function startGame() {
  canvas = document.getElementById('game');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  ctx = canvas.getContext('2d');

  gameState.units.push(createPlayerUnit());

  // add 2 enemy units
  gameState.units.push(createEnemyUnit(2, 1, 1));
  gameState.units.push(createEnemyUnit(3, 6, 2));

  setupInput(canvas, gameState);

  // End Turn button
  const endTurnBtn = document.getElementById('endTurnBtn');
  endTurnBtn.addEventListener('click', endTurn);

  gameLoop();
}

function endTurn() {
  if (gameState.currentTurn === 'player') {
    gameState.currentTurn = 'enemy';
    // reset enemy units for this turn
    gameState.units
      .filter(u => u.team === 'enemy')
      .forEach(u => (u.hasActed = false));

    // Run enemy turn immediately
    enemyTurn();
  }
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

  const selectedUnit = gameState.units.find(
    (u) => u.id === gameState.selectedUnitId
  );

  if (selectedUnit) {
    const moveTiles = getMovableTiles(selectedUnit);
    drawMoveTiles(ctx, moveTiles);
  }

  for (const unit of gameState.units) {
    const isSelected = unit.id === gameState.selectedUnitId;
    drawUnit(ctx, unit, isSelected);
  }

  // Display current turn
  ctx.fillStyle = 'white';
  ctx.font = '18px Arial';
  ctx.fillText(`Turn: ${gameState.currentTurn}`, 10, 20);
}

export function canAct(unit) {
  return !unit.hasActed && unit.team === gameState.currentTurn;
}

function enemyTurn() {
  const enemies = gameState.units.filter(u => u.team === 'enemy');

  for (const enemy of enemies) {
    if (enemy.hasActed) continue;

    // find closest player
    const players = gameState.units.filter(u => u.team === 'player');
    if (players.length === 0) return; // no players left

    let closestPlayer = players[0];
    let minDist = Math.abs(enemy.x - closestPlayer.x) + Math.abs(enemy.y - closestPlayer.y);

    for (const player of players) {
      const dist = Math.abs(enemy.x - player.x) + Math.abs(enemy.y - player.y);
      if (dist < minDist) {
        minDist = dist;
        closestPlayer = player;
      }
    }

    // move one step toward player
    const dx = closestPlayer.x - enemy.x;
    const dy = closestPlayer.y - enemy.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      enemy.x += dx > 0 ? 1 : -1;
    } else if (dy !== 0) {
      enemy.y += dy > 0 ? 1 : -1;
    }

    // Attack if in range after moving
    for (const player of players) {
      if (inRange(enemy, player)) {
        attack(enemy, player);
        enemy.hasActed = true;

        if (player.hp <= 0) {
          gameState.units = gameState.units.filter(u => u.id !== player.id);
        }
        break; // attack only one unit per turn
      }
    }


    enemy.hasActed = true;
  }

  // End enemy turn → back to player
  gameState.currentTurn = 'player';
  gameState.units
    .filter(u => u.team === 'player')
    .forEach(u => (u.hasActed = false));
}
