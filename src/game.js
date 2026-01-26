import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  GRID_WIDTH,
  GRID_HEIGHT,
  HEADER_HEIGHT,
  FOOTER_HEIGHT,
} from "./constants.js";
import { drawGrid, drawUnit } from "./render.js";
import { createPlayerUnit, createEnemyUnit } from "./units.js";
import { setupFooterInput, setupInput } from "./input.js";
import { drawMoveTiles } from "./render.js";
import { getMovableTiles, isTileOccupied } from "./grid.js";
import { attack, inRange } from "./combat.js";

let header, canvas, footer;
let hctx, ctx, fctx;

export const gameState = {
  units: [],
  selectedUnitId: null,
  currentTurn: "player", // 'player' or 'enemy'
};

export function startGame() {
  header = document.getElementById("header");
  canvas = document.getElementById("game");
  footer = document.getElementById("footer");

  header.width = CANVAS_WIDTH;
  header.height = HEADER_HEIGHT;

  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  footer.width = CANVAS_WIDTH;
  footer.height = FOOTER_HEIGHT;

  hctx = header.getContext("2d");
  ctx = canvas.getContext("2d");
  fctx = footer.getContext("2d");

  createUnits(5, 7);

  setupInput(canvas, gameState);
  setupFooterInput(footer, gameState);

  // End Turn button
  //const endTurnBtn = document.getElementById("endTurnBtn");
  //endTurnBtn.addEventListener("click", endTurn);

  gameLoop();
}

function createUnits(numPlayerUnits, numEnemyUnits) {
  let id = 0;
  for (let i = 0; i < numPlayerUnits; i++) {
    let x = Math.floor(Math.random() * GRID_WIDTH);
    let y = Math.floor(Math.random() * GRID_HEIGHT);
    while (isTileOccupied(x, y)) {
      x = Math.floor(Math.random() * GRID_WIDTH);
      y = Math.floor(Math.random() * GRID_HEIGHT);
    }
    gameState.units.push(createPlayerUnit(id, x, y));
    id++;
  }
  for (let i = 0; i < numEnemyUnits; i++) {
    let x = Math.floor(Math.random() * GRID_WIDTH);
    let y = Math.floor(Math.random() * GRID_HEIGHT);
    while (isTileOccupied(x, y)) {
      x = Math.floor(Math.random() * GRID_WIDTH);
      y = Math.floor(Math.random() * GRID_HEIGHT);
    }
    gameState.units.push(createEnemyUnit(id, x, y));
    id++;
  }
}

export function endTurn() {
  if (gameState.currentTurn === "player") {
    gameState.currentTurn = "enemy";
    // reset enemy units for this turn
    gameState.units
      .filter((u) => u.team === "enemy")
      .forEach((u) => (u.hasActed = false));

    // Run enemy turn immediately
    enemyTurn();
  }
}

function gameLoop() {
  update();
  render();
  uiRender();

  requestAnimationFrame(gameLoop);
}

function update() {
  // game logic will go here later
  let end = true;
  for (const u of gameState.units.filter((u) => u.team === "player")) {
    if (!u.hasActed) {
      end = false;
    }
  }
  if (end) {
    endTurn();
  }
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawGrid(ctx);

  const selectedUnit = gameState.units.find(
    (u) => u.id === gameState.selectedUnitId,
  );

  if (selectedUnit) {
    const moveTiles = getMovableTiles(selectedUnit);
    drawMoveTiles(ctx, moveTiles);
  }

  for (const unit of gameState.units) {
    const isSelected = unit.id === gameState.selectedUnitId;
    drawUnit(ctx, unit, isSelected);
  }
}

function uiRender() {
  const selectedUnit = gameState.units.find(
    (u) => u.id === gameState.selectedUnitId,
  );

  // HEADER UI
  hctx.clearRect(0, 0, header.width, header.height);

  // Display current turn
  hctx.fillStyle = "white";
  hctx.font = "18px Arial";
  hctx.fillText(`Turn: ${gameState.currentTurn}     v:0.0.13`, 10, 20);

  if (gameState.currentTurn == "player") {
    hctx.strokeStyle = "#3b82f6";
    hctx.lineWidth = 3;
    hctx.strokeRect(0, 0, header.width, header.height);
  } else {
    hctx.strokeStyle = "#ef4444";
    hctx.lineWidth = 3;
    hctx.strokeRect(0, 0, header.width, header.height);
  }

  // FOOTER UI
  fctx.clearRect(0, 0, footer.width, footer.height);

  fctx.fillStyle = "white";
  fctx.font = "36px Arial";
  fctx.fillText(`END TURN`, 160, 72);
}

export function canAct(unit) {
  return !unit.hasActed && unit.team === gameState.currentTurn;
}

async function enemyTurn() {
  const enemies = gameState.units.filter((u) => u.team === "enemy");

  for (const enemy of enemies) {
    //if (enemy.hasActed) continue;
    let actionsTaken = 0;

    while (enemy.actions > actionsTaken) {
      await new Promise((r) => setTimeout(r, 200)); //creates a delay so we see the enemies moving around instead of instantly teleporting and attacking all at once
      actionsTaken += 1;

      // find closest player
      const players = gameState.units.filter((u) => u.team === "player");
      if (players.length === 0) return; // no players left

      let closestPlayer = players[0];
      let minDist =
        Math.abs(enemy.x - closestPlayer.x) +
        Math.abs(enemy.y - closestPlayer.y);

      for (const player of players) {
        const dist =
          Math.abs(enemy.x - player.x) + Math.abs(enemy.y - player.y);
        if (dist < minDist) {
          minDist = dist;
          closestPlayer = player;
        }
      }

      // move one step toward player
      const dx = closestPlayer.x - enemy.x;
      const dy = closestPlayer.y - enemy.y;

      const adx = Math.abs(dx);
      const ady = Math.abs(dy);

      //console.log(enemy.id+" adx:"+adx+" ady:"+ady)

      if (adx + ady > 1) {
        if (adx >= ady) {
          enemy.x += dx > 0 ? 1 : -1;
        } else {
          enemy.y += dy > 0 ? 1 : -1;
        }
      } else {
        // Attack if in range after moving
        for (const player of players) {
          if (inRange(enemy, player) && !enemy.hasActed) {
            attack(enemy, player);
            enemy.hasActed = true;

            if (player.hp <= 0) {
              gameState.units = gameState.units.filter(
                (u) => u.id !== player.id,
              );
            }
            break; // attack only one unit per turn
          }
        }
      }
    }
    enemy.hasActed = true;
  }

  // End enemy turn → back to player
  gameState.currentTurn = "player";
  gameState.units
    .filter((u) => u.team === "player")
    .forEach((u) => (u.hasActed = false));
}
