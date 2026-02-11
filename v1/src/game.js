import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  GRID_WIDTH,
  GRID_HEIGHT,
  HEADER_HEIGHT,
  FOOTER_HEIGHT,
  gameVersion,
  updatedDate,
  NAMES,
} from "./constants.js";
import {
  drawAttackTiles,
  drawGrid,
  drawUnit,
  drawHeader,
  drawFooter,
  setupRenderer,
  clear,
} from "./render.js";
import { createPlayerUnit, createEnemyUnit } from "./units.js";
import { setupFooterInput, setupInput, isInputActive } from "./input.js";
import { drawMoveTiles } from "./render.js";
import { getMovableTiles, isTileOccupied, getAttackableTiles } from "./grid.js";
import { attack, inRange } from "./combat.js";

let interruptEnemyTurn = false;
let header, canvas, footer;

export const gameState = {
  units: [],
  selectedUnitId: null,
  currentTurn: "player", // 'player' or 'enemy'
};

export function startGame() {
  gameState.units = [];
  gameState.selectedUnitId = null;
  gameState.currentTurn = "player";

  header = document.getElementById("header");
  canvas = document.getElementById("game");
  footer = document.getElementById("footer");

  header.width = CANVAS_WIDTH;
  header.height = HEADER_HEIGHT;
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  footer.width = CANVAS_WIDTH;
  footer.height = FOOTER_HEIGHT;

  setupRenderer(header, canvas, footer);

  gameState.units.length = 0;
  createUnits(5, 7);

  if (!isInputActive()) {
    setupInput(canvas, gameState);
    setupFooterInput(footer, gameState);
  }

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
    const unit = createPlayerUnit(id, x, y);

    // Give random name to player units from list of names in constants.js
    let name = NAMES[Math.floor(Math.random() * NAMES.length)];

    // If names are shared, get a new one until all names are unique
    while(gameState.units.find((u) => u.name === name)) {
      name = NAMES[Math.floor(Math.random() * NAMES.length)];
    }
    unit.name = name;
    gameState.units.push(unit);
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
  gameState.selectedUnitId = null;
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

let lastTime = 0;
function gameLoop(timestamp) {
  const delta = timestamp - lastTime;
  lastTime = timestamp;

  update(delta);
  render(delta);
  uiRender(delta);

  requestAnimationFrame(gameLoop);
}

function update(delta) {
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

function render(delta) {
  clear();

  drawGrid();

  if (gameState.selectedUnitId != null) {
    const selectedUnit = gameState.units.find(
      (u) => u.id === gameState.selectedUnitId,
    );

    //if (selectedUnit) {
    const moveTiles = getMovableTiles(selectedUnit);
    drawMoveTiles(moveTiles, selectedUnit.hasActed);

    const attackTiles = getAttackableTiles(selectedUnit);
    drawAttackTiles(attackTiles, selectedUnit.hasActed);
    //}
  }

  for (const unit of gameState.units) {
    const isSelected = unit.id === gameState.selectedUnitId;
    drawUnit(unit, isSelected);
  }
}

function uiRender(delta) {
  drawHeader(gameState);
  drawFooter(gameVersion, updatedDate);
}

export function canAct(unit) {
  return !unit.hasActed && unit.team === gameState.currentTurn;
}

async function enemyTurn() {
  interruptEnemyTurn = false;
  const enemies = gameState.units.filter((u) => u.team === "enemy");

  for (const enemy of enemies) {
    let actionsTaken = 0;
    while (enemy.actions > actionsTaken && !interruptEnemyTurn) {
      enemy.current = true;
      await new Promise((r) => setTimeout(r, 250)); //creates a delay so we see the enemies moving around instead of instantly teleporting and attacking all at once
      actionsTaken += 1;

      // find closest player
      const players = gameState.units.filter((u) => u.team === "player");
      if (players.length === 0) {
        enemy.current = false;
        gameState.currentTurn = "player";
        return; // no players left
      }

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

      if (adx + ady > 1) {
        let newX = enemy.x;
        let newY = enemy.y;
        if (adx >= ady) {
          newX += dx > 0 ? 1 : -1;
        } else {
          newY += dy > 0 ? 1 : -1;
        }

        if (!isTileOccupied(newX, newY)) {
          //console.log("unit:" + enemy.id + "   x:" + newX + "   y:" + newY);
          enemy.x = newX;
          enemy.y = newY;
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
      enemy.current = false;
    }
    enemy.current = true;
    await new Promise((r) => setTimeout(r, 400));
    enemy.current = false;
    enemy.hasActed = true;
  }

  // End enemy turn -> back to player
  gameState.currentTurn = "player";
  gameState.units
    .filter((u) => u.team === "player")
    .forEach((u) => (u.hasActed = false));
}

export function interrupt() {
  interruptEnemyTurn = true;
}
