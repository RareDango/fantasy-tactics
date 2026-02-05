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
  BUTTON_RESET,
  BUTTON_END_TURN,
  BUTTON_SETTINGS,
  BUTTON_PLAYERS_UP,
  BUTTON_PLAYERS_DOWN,
  BUTTON_ENEMIES_UP,
  BUTTON_ENEMIES_DOWN,
  BUTTON_ACCEPT,
  BUTTON_CANCEL,
  TILE_SIZE
} from "./constants.js";
import {
  assets,
  drawAttackTiles,
  drawMoveTiles,
  drawGrid,
  drawUnit,
  drawHeader,
  drawFooter,
  setupRenderer,
  clear,
  clearAttacks,
  clearFireworks,
  drawAttacks,
  drawFireworks,
  drawSettings,
  updateAnimations,
  renderHeaderTrue,
  tintImage,
  portraitsImages,
  unitsImages
} from "./render.js";
import { createPlayerUnit, createEnemyUnit } from "./units.js";
import { setupFooterInput, setupInput, setupHeaderInput } from "./input.js";
import { getMovableTiles, isTileOccupied, getAttackableTiles } from "./grid.js";
import { attack, inRange } from "./combat.js";
import { createButton } from "./buttons.js";
import { AnimationData } from "./AnimationData.js";

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

  settingsOpen: false,

  numPlayerUnits: 5,
  numEnemyUnits: 7,

  newPlayerUnits: 5,
  newEnemyUnits: 7,

  currentPlayers: 5,
  currentEnemies: 7,

  turnNumber: 1
};
let oldSelectedUnitId = null;

export function initGame() {
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

  setupInput(canvas, gameState, canvasButtons);
  setupHeaderInput(header, gameState, headerButtons);
  setupFooterInput(footer, gameState, footerButtons);

  //gameLoop();
}


const FRAME_TIME = 1000 / 30; // 30fps
let lastTime = 0;
export function gameLoop(timestamp) {
  if (timestamp - lastTime < FRAME_TIME) {
    requestAnimationFrame(gameLoop);
    return;
  }
  const delta = timestamp - lastTime;
  lastTime = timestamp;
  if(delta) {
    updateAnimations(delta);
    render(delta);
    uiRender(delta);

    updateUnitCount();
    if (gameState.currentEnemies < 1) { drawFireworks(delta); }
  }
  requestAnimationFrame(gameLoop);
}

export function restartGame() {
  gameState.settingsOpen = false;
  gameState.currentTurn = 'player';
  gameState.turnNumber = 1;
  clearAttacks();
  clearFireworks();
  interrupt();
  createUnits(gameState.numPlayerUnits, gameState.numEnemyUnits);
  gameState.selectedUnitId = null;
  renderHeaderTrue();
  renderCanvasTrue();
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

    const hueDiff = 360 / numPlayerUnits;
    const hue = (hueDiff * i) + (Math.random() * hueDiff);
    unit.hue = hue;
    hues.push(hue);

    portraitsImages[id] = tintImage(portraitsImages[id], unit.hue);
    unitsImages[id] = tintImage(unitsImages[id], unit.hue);

    unit.animationData = new AnimationData(id, 64, 4);

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
const hues = [];
export function resetHues() {
  for(let i = 0; i < gameState.numPlayerUnits; i++) {
    portraitsImages[i] = tintImage(portraitsImages[i], -hues[i]);
    unitsImages[i] = tintImage(unitsImages[i], -hues[i]);
  }
  hues.length = 0;
}

function setupButtons() {
  let buttons;
  // HEADER
  buttons = headerButtons;
  buttons.length = 0;

  const buff = 4;
  const b1 = createButton(BUTTON_SETTINGS, null, assets.b_settings, CANVAS_WIDTH - 64 + buff, buff, 64 - (buff * 2), 64 - (buff * 2));
  buttons.push(b1);

  
  // CANVAS
  buttons = canvasButtons;
  buttons.length = 0;

  let alignX = TILE_SIZE * 1.5;
  buttons.push(createButton(BUTTON_PLAYERS_DOWN, null, assets.b_down, alignX, TILE_SIZE * 2, TILE_SIZE, TILE_SIZE));
  buttons.push(createButton(BUTTON_ENEMIES_DOWN, null, assets.b_down, alignX, TILE_SIZE * 3.75, TILE_SIZE, TILE_SIZE));

  alignX = TILE_SIZE * 5.5;
  buttons.push(createButton(BUTTON_PLAYERS_UP, null, assets.b_up, alignX, TILE_SIZE * 2, TILE_SIZE, TILE_SIZE));
  buttons.push(createButton(BUTTON_ENEMIES_UP, null, assets.b_up, alignX, TILE_SIZE * 3.75, TILE_SIZE, TILE_SIZE));

  buttons.push(createButton(BUTTON_ACCEPT, null, assets.b_accept, TILE_SIZE * 2.5, TILE_SIZE * 5.5, TILE_SIZE, TILE_SIZE));
  buttons.push(createButton(BUTTON_CANCEL, null, assets.b_cancel, TILE_SIZE * 4.5, TILE_SIZE * 5.5, TILE_SIZE, TILE_SIZE));


  // FOOTER
  buttons = footerButtons;
  buttons.length = 0;
  
  buttons.push(createButton(BUTTON_END_TURN, "END TURN", assets.b_footer, 64, 32, 160, 64, "#9c4242", "#adadad"));
  buttons.push(createButton(BUTTON_RESET, "RESET", assets.b_footer, 288, 32, 160, 64, "#9c4242", "#adadad"));
}

export async function endTurn() {
  
  if (gameState.currentTurn === "player") {
    gameState.currentTurn = "enemy";
    renderHeaderTrue();
    gameState.units.forEach(u => (
      u.team === "player" ? u.hasActed = true : u.hasActed = false
    ));
    await new Promise((r) => setTimeout(r, 500));
    enemyTurn();
  }
}

function updateUnitCount() {
  let players = 0;
  let enemies = 0;
  for(let i = 0; i < gameState.units.length; i++) {
    if(gameState.units[i].team === "player") { players++; }
    else { enemies++; }
  }
  gameState.currentPlayers = players;
  gameState.currentEnemies = enemies;
}

export function checkEndTurn() {
  let end = true;
  const units = gameState.units;
  for(let i = 0; i < units.length; i++) {
    const u = units[i];
    if(u.team === "enemy") { continue; }
    if(!u.hasActed) { end = false; }
  }
  if (end) { endTurn(); }
}

export function renderCanvasTrue() {
  renderCanvas = true;
}

let renderCanvas = true;
function render(delta) {
  if(renderCanvas) {
    //console.log("Canvas rendered.");
    clear(canvas);

    drawGrid();

    if (gameState.selectedUnitId != null) {
      const selectedUnit = gameState.units.find(
        (u) => u.id === gameState.selectedUnitId,
      );

      const moveTiles = getMovableTiles(selectedUnit);
      drawMoveTiles(moveTiles, selectedUnit.hasActed);

      const attackTiles = getAttackableTiles(selectedUnit);
      drawAttackTiles(attackTiles, selectedUnit.hasActed);
    }

    for (const unit of gameState.units) {
      const isSelected = unit.id === gameState.selectedUnitId;
      drawUnit(unit, isSelected);
    }
    
    drawAttacks(delta);

    // SETTINGS OPEN
    if(gameState.settingsOpen) {
      drawSettings(gameState, canvasButtons, delta);
    }

    renderCanvas = false;
  }
}

function uiRender(delta) {
  if(gameState.selectedUnitId != oldSelectedUnitId) {
    //resetPortraits();
    oldSelectedUnitId = gameState.selectedUnitId;
  }

  drawHeader(gameState, headerButtons, delta);

  drawFooter(gameVersion, updatedDate, footerButtons);
}

export function canAct(unit) {
  return !unit.hasActed && unit.team === gameState.currentTurn;
}

async function enemyTurn(delta) {
  const enemies = gameState.units.filter((u) => u.team === "enemy");
  if(gameState.units.filter( (u) => u.team === 'player').length < 1) {
    for (const enemy of enemies) { enemy.current = false; }
    return;
  }

  interruptEnemyTurn = false;
  const DELAY = 250;

  for(let i = 0; i < gameState.units.length; i++) {
    const enemy = gameState.units[i];
    if(enemy.team === "player") { continue; }

    if(interruptEnemyTurn) { break; }
    let actionsTaken = 0;
    while (enemy.actions > actionsTaken && !interruptEnemyTurn) {
      enemy.current = true;
      renderCanvasTrue();
      // create a delay so we see the enemies moving around
      // instead of instantly teleporting and attacking all at once
      await new Promise((r) => setTimeout(r, DELAY));
      if(interruptEnemyTurn) { break; }
      actionsTaken += 1;

      if (gameState.currentPlayers === 0) {
        enemy.current = false;
        renderCanvasTrue();
        gameState.currentTurn = "player";
        renderHeaderTrue();
        return;
      }

      // find closest player
      const players = gameState.units.filter((u) => u.team === "player");
      let closestPlayer;
      let minDist = GRID_HEIGHT * GRID_WIDTH;

      for(let j = 0; j < gameState.units.length; j++) {
        const player = gameState.units[j];
        if(player.team === "enemy") { continue; }

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
          renderCanvasTrue();
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
      renderCanvasTrue();
    }
    if(interruptEnemyTurn) { break; }
    enemy.current = true;
    renderCanvasTrue();
    await new Promise((r) => setTimeout(r, DELAY));
    enemy.current = false;
    renderCanvasTrue();
  }

  // End enemy turn -> back to player
  gameState.currentTurn = "player";
  gameState.turnNumber++;
  renderHeaderTrue();
  gameState.units.filter((u) => u.team === "player").forEach((u) => (u.hasActed = false));
}

export function interrupt() {
  interruptEnemyTurn = true;
}