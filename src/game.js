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
  QUOTES,
  RESET,
  END_TURN
} from "./constants.js";
import {
  drawAttackTiles,
  drawMoveTiles,
  drawGrid,
  drawUnit,
  drawHeader,
  drawFooter,
  setupRenderer,
  clear,
  resetPortraits,
  drawAttacks,
  drawFireworks
} from "./render.js";
import { createPlayerUnit, createEnemyUnit } from "./units.js";
import { setupFooterInput, setupInput, isInputActive } from "./input.js";
import { getMovableTiles, isTileOccupied, getAttackableTiles } from "./grid.js";
import { attack, inRange } from "./combat.js";
import { createButton } from "./buttons.js";

let interruptEnemyTurn = false;
let header, canvas, footer;

const headerButtons = [];
const canvasButtons = [];
const footerButtons = [];

export const gameState = {
  units: [],
  playerList: [],
  selectedUnitId: null,
  currentTurn: "player", // 'player' or 'enemy'

  numPlayerUnits: 5,
  numEnemyUnits: 7
};
let oldSelectedUnitId = null;

export function startGame() {
  gameState.selectedUnitId = null;
  gameState.currentTurn = "player";

  header  = document.getElementById("header");
  canvas  = document.getElementById("game");
  footer  = document.getElementById("footer");

  setSize(header, CANVAS_WIDTH, HEADER_HEIGHT);
  setSize(canvas, CANVAS_WIDTH, CANVAS_HEIGHT);
  setSize(footer, CANVAS_WIDTH, FOOTER_HEIGHT);
  function setSize(canvas, width, height) { canvas.width  = width; canvas.height = height; }

  setupRenderer(header, canvas, footer);
  setupButtons()

  createUnits(gameState.numPlayerUnits, gameState.numEnemyUnits);

  setupInput(canvas, gameState);
  setupFooterInput(footer, gameState, footerButtons);

  gameLoop();
}

export function restartGame() {
  createUnits(gameState.numPlayerUnits, gameState.numEnemyUnits);
}

function createUnits(numPlayerUnits, numEnemyUnits) {
  gameState.units.length = 0;
  gameState.playerList.length = 0;

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

    // Give random quote to player units from list of quotes in constants.js
    let quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    // If quotes are shared, get a new one until all quotes are unique
    while(gameState.units.find((u) => u.quote === quote)) {
      quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    }
    unit.quote = quote;

    gameState.units.push(unit);
    gameState.playerList.push(unit.name);
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

function setupButtons() {
  let buttons;
  // HEADER
  buttons = headerButtons;
  buttons.length = 0;
  
  // CANVAS
  buttons = canvasButtons;
  buttons.length = 0;

  // FOOTER
  buttons = footerButtons;
  buttons.length = 0;
  
  buttons.push(createButton(END_TURN, "END TURN", null, 64, 32, 160, 64, "#9c4242", "#adadad"));
  buttons.push(createButton(RESET, "RESET", null, 288, 32, 160, 64, "#9c4242", "#adadad"));
}

export function endTurn() {
  if (gameState.currentTurn === "player") {
    gameState.currentTurn = "enemy";
    gameState.units.forEach(u => (
      u.team === "player" ? u.hasActed = true : u.hasActed = false
    ));
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
  for (const u of gameState.units.filter(u => u.team === "player")) { if (!u.hasActed) { end = false; } }
  if (end) { endTurn(); }
}

function render(delta) {
  clear(canvas);

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
  
  drawAttacks(delta);

  if (gameState.units.filter((u) => u.team === "enemy").length < 1) {
    // Player wins
    drawFireworks(delta);
  }
}

function uiRender(delta) {
  if(gameState.selectedUnitId != oldSelectedUnitId) {
    resetPortraits();
    oldSelectedUnitId = gameState.selectedUnitId;
  }

  clear(header);
  drawHeader(gameState, delta);

  clear(footer);
  drawFooter(gameVersion, updatedDate, footerButtons);
}

export function canAct(unit) {
  return !unit.hasActed && unit.team === gameState.currentTurn;
}

async function enemyTurn(delta) {
  const delay = 250;
  await new Promise((r) => setTimeout(r, delay * 2));

  interruptEnemyTurn = false;
  const enemies = gameState.units.filter((u) => u.team === "enemy");
  
  for (const enemy of enemies) {
    let actionsTaken = 0;
    while (enemy.actions > actionsTaken && !interruptEnemyTurn) {
      enemy.current = true;
      // create a delay so we see the enemies moving around
      // instead of instantly teleporting and attacking all at once
      await new Promise((r) => setTimeout(r, delay));

      if(interruptEnemyTurn) { break; }
      actionsTaken += 1;

      // find closest player
      const players = gameState.units.filter((u) => u.team === "player");
      if (players.length === 0) {
        enemy.current = false;
        gameState.currentTurn = "player";
        return; // no players left
      }

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
          enemy.x = newX;
          enemy.y = newY;
        }
      } else {
        // Attack if in range after moving
        for (const player of players) {
          if (inRange(enemy, player) && !enemy.hasActed) {

            attack(enemy, player);
            enemy.hasActed = true;
            break; // attack only one unit per turn
          }
        }
      }
      enemy.current = false;
    }
    enemy.current = true;
    await new Promise((r) => setTimeout(r, delay));
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