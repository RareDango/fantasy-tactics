import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  GRID_WIDTH,
  GRID_HEIGHT,
  HEADER_HEIGHT,
  FOOTER_HEIGHT,
  GAME_VERSION,
  DATE_UPDATED,
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
  BUTTON_OGRES_UP,
  BUTTON_OGRES_DOWN,
  BUTTON_OGRES_ACCEPT,
  TILE_SIZE,
  DEFAULT_NUM_PLAYERS,
  DEFAULT_NUM_ENEMIES,
  TAB_UNITS,
  TAB_VISUALS,
  TAB_BARS,
  BUTTON_WHITE_GRID,
  BUTTON_SET_TO_DEFAULT,
  BUTTON_CLOSE_SETTINGS
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
  clearAttacks,
  clearFireworks,
  drawAttacks,
  drawFireworks,
  drawSettings,
  updateAnimations,
  renderHeaderTrue,
  tintImage,
  setupMap
} from "./render.js";
import { assets } from "./assets.js";
import { createPlayerUnit, createEnemyUnit } from "./units.js";
import { setupFooterInput, setupInput, setupHeaderInput } from "./input.js";
import { getPlayerMovableTiles, isTileOccupied, getAttackableTiles } from "./grid.js";
import { attack, inRange } from "./combat.js";
import { createButton } from "./buttons.js";
import { AnimationData } from "./AnimationData.js";

let interruptEnemyTurn = false;
let header, canvas, footer;

const headerButtons = [];
const canvasTabs = []
const canvasButtons = [];
const footerButtons = [];

export const gameState = {
  units: [],
  playerList: [],
  selectedUnitId: null,
  currentTurn: "player", // 'player' or 'enemy'

  settingsOpen: false,
  activeTab: TAB_UNITS,

  numPlayerUnits: DEFAULT_NUM_PLAYERS,
  numEnemyUnits: DEFAULT_NUM_ENEMIES,

  newPlayerUnits: DEFAULT_NUM_PLAYERS,
  newEnemyUnits: DEFAULT_NUM_ENEMIES,

  currentPlayers: DEFAULT_NUM_PLAYERS,
  currentEnemies: DEFAULT_NUM_ENEMIES,

  turnNumber: 1,

  whiteGrid: false,
  ogrePercent: 20,
  newOgrePercent: 20
};
let oldSelectedUnitId = null;

export function initGame() {
  setupMap();

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

  setupInput(canvas, gameState, canvasButtons, canvasTabs);
  setupHeaderInput(header, gameState, headerButtons);
  setupFooterInput(footer, gameState, footerButtons);
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

function update(dt) {
  processCurrentAction(dt);
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
  setupMap();
  renderHeaderTrue();
  renderCanvasTrue();
}

function createUnits(numPlayerUnits, numEnemyUnits) {
  gameState.units.length = 0;
  gameState.playerList.length = 0;

  const locations = [];
  for(let x = 0; x < GRID_WIDTH; x++) {
    for(let y = 0; y < GRID_HEIGHT; y++) {
      locations.push({x, y});
    }
  }

  const nameList = Array.from(NAMES);
  let id = 0;
  for (let i = 0; i < numPlayerUnits; i++) {
    const options = locations.filter((l) => !isTileOccupied(l.x, l.y));
    const pos = options[Math.floor(Math.random() * options.length)];
    const unit = createPlayerUnit(id, pos.x, pos.y);

    // Give random name to player units from list of names in constants.js

    const nameIndex = Math.floor(Math.random() * nameList.length);
    unit.name = nameList[nameIndex];
    nameList.splice(nameIndex, 1);

    // Give random quote to player units from list of quotes in constants.js
    let quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    unit.quote = quote;

    const hueDiff = 360 / numPlayerUnits;
    const hue = (hueDiff * i) + (Math.random() * hueDiff);
    unit.hue = hue;
    hues.push(hue);

    assets.portraitsImages[id] = tintImage(assets.portraitsImages[id], unit.hue);
    assets.unitsImages[id] = tintImage(assets.unitsImages[id], unit.hue);

    unit.animationData = new AnimationData(id, 64, 4);

    gameState.units.push(unit);
    gameState.playerList.push(unit.name);
    id++;
  }

  const ogreRate = gameState.ogrePercent / 100;
  const numOgres = Math.floor(numEnemyUnits * ogreRate);
  for (let i = 0; i < numEnemyUnits; i++) {
    const options = locations.filter((l) => !isTileOccupied(l.x, l.y));
    const pos = options[Math.floor(Math.random() * options.length)];
    const unit = createEnemyUnit(id, pos.x, pos.y)
    if(i < numOgres){
      unit.type = 1;
      unit.maxHp = 3;
      unit.hp = 3;
    }
    gameState.units.push(unit);
    id++;
  }
}
const hues = [];
export function resetHues() {
  for(let i = 0; i < gameState.numPlayerUnits; i++) {
    assets.portraitsImages[i] = tintImage(assets.portraitsImages[i], -hues[i]);
    assets.unitsImages[i] = tintImage(assets.unitsImages[i], -hues[i]);
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

  // TABS
  buttons = canvasTabs;
  buttons.length = 0;

  buttons.push(createButton(TAB_UNITS, null, assets.t_units, TILE_SIZE * 1.5, TILE_SIZE / 2 + 4, TILE_SIZE, TILE_SIZE));
  buttons.push(createButton(TAB_BARS, null, assets.t_bars, TILE_SIZE * 2.5, TILE_SIZE / 2 + 4, TILE_SIZE, TILE_SIZE));
  buttons.push(createButton(TAB_VISUALS, null, assets.t_visuals, TILE_SIZE * 3.5, TILE_SIZE / 2 + 4, TILE_SIZE, TILE_SIZE));

  // BUTTONS
  buttons = canvasButtons;
  buttons.length = 0;

  // Units Tab Buttons
  let alignX = TILE_SIZE * 1.5;
  buttons.push(createButton(BUTTON_PLAYERS_DOWN, null, assets.b_down, alignX, TILE_SIZE * 2.5, TILE_SIZE, TILE_SIZE));
  buttons.push(createButton(BUTTON_ENEMIES_DOWN, null, assets.b_down, alignX, TILE_SIZE * 4.25, TILE_SIZE, TILE_SIZE));

  alignX = TILE_SIZE * 5.5;
  buttons.push(createButton(BUTTON_PLAYERS_UP, null, assets.b_up, alignX, TILE_SIZE * 2.5, TILE_SIZE, TILE_SIZE));
  buttons.push(createButton(BUTTON_ENEMIES_UP, null, assets.b_up, alignX, TILE_SIZE * 4.25, TILE_SIZE, TILE_SIZE));

  buttons.push(createButton(BUTTON_ACCEPT, null, assets.b_accept, TILE_SIZE * 2,   TILE_SIZE * 5.5 + 28, TILE_SIZE, TILE_SIZE));
  buttons.push(createButton(BUTTON_SET_TO_DEFAULT,  null, assets.b_reset,  TILE_SIZE * 3.5, TILE_SIZE * 5.5 + 28, TILE_SIZE, TILE_SIZE));
  buttons.push(createButton(BUTTON_CANCEL, null, assets.b_cancel, TILE_SIZE * 5,   TILE_SIZE * 5.5 + 28, TILE_SIZE, TILE_SIZE));

  // Visuals Tab Buttons
  buttons.push(createButton(BUTTON_WHITE_GRID, "White Grid Lines", null, TILE_SIZE * 1.5, TILE_SIZE * 2 + 28, TILE_SIZE, TILE_SIZE, "#ddd", "#555"));

  // Bars Tab Buttons
  buttons.push(createButton(BUTTON_OGRES_UP, null, assets.b_up, TILE_SIZE * 1.5, TILE_SIZE * 2.5, TILE_SIZE, TILE_SIZE));
  buttons.push(createButton(BUTTON_OGRES_DOWN, null, assets.b_down, TILE_SIZE * 2.5, TILE_SIZE * 2.5, TILE_SIZE, TILE_SIZE));
  buttons.push(createButton(BUTTON_OGRES_ACCEPT, null, assets.b_accept, TILE_SIZE * 5.5, TILE_SIZE * 2.5, TILE_SIZE, TILE_SIZE));
  

  //
  buttons.push(createButton(BUTTON_CLOSE_SETTINGS, null, assets.b_cancel, TILE_SIZE * 6 + 22, TILE_SIZE + 40, 32, 32));

  // FOOTER
  buttons = footerButtons;
  buttons.length = 0;
  
  buttons.push(createButton(BUTTON_END_TURN, "END TURN", assets.b_footer, 64, 26, 160, 64, "#9c4242", "#adadad"));
  buttons.push(createButton(BUTTON_RESET, "RESET", assets.b_footer, 288, 26, 160, 64, "#9c4242", "#adadad"));
}

export async function endTurn() {
  
  if (gameState.currentTurn === "player") {
    gameState.currentTurn = "enemy";
    for(let i = 0; i < gameState.units.length; i++) {
      const u = gameState.units[i];
      if(u.team === "enemy") { continue; }
      u.actionsLeft = 0;
      u.attacksLeft = 0;
    }
    renderHeaderTrue();
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
    if(u.actionsLeft > 0) { end = false; }
  }
  if (end) { endTurn(); }
}

export function renderCanvasTrue() {
  renderCanvas = true;
}

let renderCanvas = true;
function render(delta) {
  if(renderCanvas) {
    clear(canvas);

    drawGrid();

    if (gameState.selectedUnitId != null) {
      const selectedUnit = gameState.units.find(
        (u) => u.id === gameState.selectedUnitId,
      );

      const moveTiles = getPlayerMovableTiles(selectedUnit);
      drawMoveTiles(moveTiles, selectedUnit);

      const attackTiles = getAttackableTiles(selectedUnit);
      drawAttackTiles(attackTiles, selectedUnit);
    }

    for (const unit of gameState.units) {
      const isSelected = unit.id === gameState.selectedUnitId;
      drawUnit(unit, isSelected);
    }
    
    drawAttacks(delta);

    // SETTINGS OPEN
    if(gameState.settingsOpen) {

      switch (gameState.activeTab) {
        case TAB_UNITS:
          canvasTabs[TAB_UNITS].image = assets.t_units;
          canvasTabs[TAB_BARS].image = assets.t_bars_dark;
          canvasTabs[TAB_VISUALS].image = assets.t_visuals_dark;
          break;

        case TAB_BARS:
          canvasTabs[TAB_UNITS].image = assets.t_units_dark;
          canvasTabs[TAB_BARS].image = assets.t_bars;
          canvasTabs[TAB_VISUALS].image = assets.t_visuals_dark;
          break;

        case TAB_VISUALS:
          canvasTabs[TAB_UNITS].image = assets.t_units_dark;
          canvasTabs[TAB_BARS].image = assets.t_bars_dark;
          canvasTabs[TAB_VISUALS].image = assets.t_visuals;
          break;

        default:
          break;
      }

      drawSettings(gameState, canvasButtons, canvasTabs, delta);
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

  drawFooter(GAME_VERSION, DATE_UPDATED, footerButtons);
}

export function canAct(unit) {
  return unit.actionsLeft > 0 && unit.team === gameState.currentTurn;
}

async function enemyTurn(delta) {
  gameState.selectedUnitId = null;
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
    enemy.actionsLeft = enemy.maxActions;
    enemy.attacksLeft = enemy.maxAttacks;
    while (enemy.actionsLeft && !interruptEnemyTurn) {
      enemy.current = true;
      renderCanvasTrue();
      // create a delay so we see the enemies moving around
      // instead of instantly teleporting and attacking all at once
      await new Promise((r) => setTimeout(r, DELAY));
      if(interruptEnemyTurn) { break; }
      enemy.actionsLeft--;

      if (gameState.currentPlayers === 0) {
        enemy.current = false;
        renderCanvasTrue();
        gameState.currentTurn = "player";
        renderHeaderTrue();
        return;
      }

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
          if (inRange(enemy, player) && enemy.attacksLeft) {

            attack(enemy, player);
            enemy.attacksLeft--;
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
  for(let i = 0; i < gameState.units.length; i++) {
    const u = gameState.units[i];
    if(u.team === "enemy") { continue; }
    u.actionsLeft = u.maxActions;
    u.attacksLeft = u.maxAttacks;
  }
}

export function interrupt() {
  interruptEnemyTurn = true;
}





/*

//// New enemy turn. not yet implemented. need much code refactoring.

function enemyTurn(enemy) {
  const path = findPath(enemy, target);

  commandQueue.push({
    type: "move",
    unit: enemy,
    path
  });

  commandQueue.push({
    type: "attack",
    attacker: enemy,
    target
  });
}
  */
