import {
  BUTTON_END_TURN,
  BUTTON_RESET,
  BUTTON_SETTINGS,
  TILE_SIZE,
  MAX_UNITS,
  BUTTON_PLAYERS_UP,
  BUTTON_PLAYERS_DOWN,
  BUTTON_ENEMIES_UP,
  BUTTON_ENEMIES_DOWN,
  BUTTON_CANCEL,
  BUTTON_ACCEPT,
  DEFAULT_NUM_PLAYERS,
  DEFAULT_NUM_ENEMIES,
  TAB_UNITS,
  TAB_VISUALS,
  TAB_BARS,
  BUTTON_WHITE_GRID,
  BUTTON_SET_TO_DEFAULT,
  BUTTON_CLOSE_SETTINGS,
  BUTTON_OGRES_UP,
  BUTTON_OGRES_DOWN,
  BUTTON_OGRES_ACCEPT
} from "./constants.js";
import { isTileMovable, isTileOccupied } from "./grid.js";
import { canAct, restartGame, endTurn, checkEndTurn, renderCanvasTrue, resetHues } from "./game.js";
import { attack, inRange } from "./combat.js";
import { getRatio } from "./main.js";
import { renderHeaderTrue } from "./render.js";

export function setupInput(canvas, gameState, buttons, tabs) {
  canvas.addEventListener("pointerdown", (e) => {
    const rect = canvas.getBoundingClientRect();
    const ratio = getRatio();

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const gridX = Math.floor(mouseX / ratio / TILE_SIZE);
    const gridY = Math.floor(mouseY / ratio / TILE_SIZE);

    if(!gameState.settingsOpen) {
      const selectedUnit = gameState.units.find(
        (u) => u.id === gameState.selectedUnitId,
      );

      const clickedUnit = gameState.units.find(
        (u) => u.x === gridX && u.y === gridY,
      );

      // If clicking the selected unit -> unselect it
      if (clickedUnit === selectedUnit) {
        gameState.selectedUnitId = null;
        renderHeaderTrue();
        renderCanvasTrue();
        return;
      }

      // If clicking an empty tile -> unselect unit
      if (selectedUnit && !isTileMovable(selectedUnit, gridX, gridY) && !isTileOccupied(gridX, gridY)) {
        gameState.selectedUnitId = null;
        renderHeaderTrue();
        renderCanvasTrue();
        return;
      }

      // If clicking a player unit -> select it
      if (clickedUnit && clickedUnit.team === "player") {
        gameState.selectedUnitId = clickedUnit.id;
        renderHeaderTrue();
        renderCanvasTrue();
        return;
      }

      // If clicking on a tile (including movable) while
      // selectedUnit cannot act -> unselect it
      if (
        selectedUnit &&
        !canAct(selectedUnit)
      ) {
        gameState.selectedUnitId = null;
        renderHeaderTrue();
        renderCanvasTrue();
        return;
      }

      // If a unit is selected and tile is movable -> move
      if (selectedUnit && canAct(selectedUnit) && isTileMovable(selectedUnit, gridX, gridY)) {
        const distance = Math.abs(selectedUnit.x - gridX) + Math.abs(selectedUnit.y - gridY);
        selectedUnit.actionsLeft -= distance;
        selectedUnit.x = gridX;
        selectedUnit.y = gridY;
        if(selectedUnit.actionsLeft < 1) { gameState.selectedUnitId = null; }
        renderCanvasTrue();
        renderHeaderTrue();
        checkEndTurn();
        return;
      }
      // If a unit is selected and clicked tile has an enemy -> attack
      if (selectedUnit && canAct(selectedUnit) && clickedUnit && clickedUnit.team !== selectedUnit.team && selectedUnit.attacksLeft) {
        // check range
        if (inRange(selectedUnit, clickedUnit)) {
          attack(selectedUnit, clickedUnit);
          selectedUnit.attacksLeft--;
          selectedUnit.actionsLeft--;
          if(selectedUnit.actionsLeft < 1) { gameState.selectedUnitId = null; }
        } else {
          // Otherwise -> deselect
          gameState.selectedUnitId = null;
        }
        renderHeaderTrue();
        renderCanvasTrue();
        checkEndTurn();
        return;
      }
    } else {
      for(let i = 0; i < tabs.length; i++) {
        const t = tabs[i];
        if (inButton(canvas, e, t)) {
          switch (t.id) {
            case TAB_UNITS:
              gameState.activeTab = TAB_UNITS;
              break;
            
            case TAB_BARS:
              gameState.activeTab = TAB_BARS;
              break;

            case TAB_VISUALS:
              gameState.activeTab = TAB_VISUALS;
              break;
            
            default:
              break;
          }
          renderCanvasTrue();
        }
      }
      for(let i = 0; i < buttons.length; i++) {
        const b = buttons[i];
        if (inButton(canvas, e, b)) {
          switch (b.id) {
            case BUTTON_CLOSE_SETTINGS:
              gameState.settingsOpen = false;
              gameState.newPlayerUnits = gameState.numPlayerUnits;
              gameState.newEnemyUnits = gameState.numEnemyUnits;
              gameState.newOgrePercent = gameState.ogrePercent;
              break;
              
            case BUTTON_PLAYERS_UP:
              if(gameState.activeTab === TAB_UNITS) {
                gameState.newPlayerUnits++;
                if(gameState.newPlayerUnits >= MAX_UNITS) { gameState.newPlayerUnits--; }
                if(gameState.newPlayerUnits + gameState.newEnemyUnits > MAX_UNITS) { gameState.newPlayerUnits--; }
              }
              break;
            
            case BUTTON_PLAYERS_DOWN:
              if(gameState.activeTab === TAB_UNITS) {
                gameState.newPlayerUnits--;
                if(gameState.newPlayerUnits < 1) { gameState.newPlayerUnits = 1; }
              }
              break;
            
            case BUTTON_ENEMIES_UP:
              if(gameState.activeTab === TAB_UNITS) {
                gameState.newEnemyUnits++;
                if(gameState.newEnemyUnits >= MAX_UNITS) { gameState.newEnemyUnits--; }
                if(gameState.newEnemyUnits + gameState.newPlayerUnits > MAX_UNITS) { gameState.newEnemyUnits--; }
              }
              break;
            
            case BUTTON_ENEMIES_DOWN:
              if(gameState.activeTab === TAB_UNITS) {
                gameState.newEnemyUnits--;
                if(gameState.newEnemyUnits < 1) { gameState.newEnemyUnits = 1; }
              }
              break;
            
            case BUTTON_CANCEL:
              if(gameState.activeTab === TAB_UNITS) {
                gameState.settingsOpen = false;
                gameState.newPlayerUnits = gameState.numPlayerUnits;
                gameState.newEnemyUnits = gameState.numEnemyUnits;
                gameState.newOgrePercent = gameState.ogrePercent;
              }
              break;
            
            case BUTTON_ACCEPT:
              if(gameState.activeTab === TAB_UNITS) {
                gameState.numPlayerUnits = gameState.newPlayerUnits;
                gameState.numEnemyUnits = gameState.newEnemyUnits;
                gameState.newOgrePercent = gameState.ogrePercent;
                restartGame();
              }
              break;
            
            case BUTTON_SET_TO_DEFAULT:
              if(gameState.activeTab === TAB_UNITS) {
                gameState.newPlayerUnits = DEFAULT_NUM_PLAYERS;
                gameState.newEnemyUnits = DEFAULT_NUM_ENEMIES;
              }
              break;
            
            case BUTTON_WHITE_GRID:
              if(gameState.activeTab === TAB_VISUALS) {
                gameState.whiteGrid = !gameState.whiteGrid;
              }
              break;
            
            case BUTTON_OGRES_UP:
              if(gameState.activeTab === TAB_BARS) {
                gameState.newOgrePercent += 5;
                if(gameState.newOgrePercent > 100) {
                  gameState.newOgrePercent = 100;
                }
              }
              break;

            case BUTTON_OGRES_DOWN:
              if(gameState.activeTab === TAB_BARS) {
                gameState.newOgrePercent -= 5;
                if(gameState.newOgrePercent < 0) {
                  gameState.newOgrePercent = 0;
                }
              }
              break;
            
            case BUTTON_OGRES_ACCEPT:
              if(gameState.activeTab === TAB_BARS) {
                gameState.ogrePercent = gameState.newOgrePercent;
                restartGame();
              }
              break;

            default:
              break;
          }
          renderCanvasTrue();
        }
      }
    }
  });
}

export function setupHeaderInput(canvas, gameState, buttons) {
  canvas.addEventListener("click", (e) => {
    for(let i = 0; i < buttons.length; i++) {
      const b = buttons[i];
      if (inButton(canvas, e, b)) {
        switch (b.id) {

          case BUTTON_SETTINGS:
            gameState.selectedUnitId = null;
            gameState.settingsOpen = !gameState.settingsOpen;
            gameState.newPlayerUnits = gameState.numPlayerUnits;
            gameState.newEnemyUnits = gameState.numEnemyUnits;
            renderCanvasTrue();
            break;

          default:
            break;
        }
      }
    }
  });
}

export function setupFooterInput(canvas, gameState, buttons) {
  canvas.addEventListener("click", (e) => {
    buttons.forEach( (b) => {
      if (inButton(canvas, e, b)) {
        switch (b.id) {

          case BUTTON_END_TURN:
            if(!gameState.settingsOpen) { endTurn(); }
            break;

          case BUTTON_RESET:
            resetHues();
            restartGame();
            break;

          default:
            break;
        }
      }
    });
  });
}

function inButton(canvas, e, button) {
  const click = inRect(canvas, e, button.x, button.y, button.width, button.height);
  return click;
}

function inRect(canvas, e, x, y, width, height) {
  const rect = canvas.getBoundingClientRect();
  const ratio = getRatio();

  const mouseX = (e.clientX - rect.left) / ratio;
  const mouseY = (e.clientY - rect.top) / ratio;

  if(mouseX > x && mouseX < x + width && mouseY > y && mouseY < y + height) { return true; }
  return false;
}