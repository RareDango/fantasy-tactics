import { END_TURN, RESET, TILE_SIZE } from "./constants.js";
import { isTileMovable, isTileOccupied } from "./grid.js";
import { canAct, interrupt, restartGame, endTurn } from "./game.js";
import { attack, inRange } from "./combat.js";
import { getRatio } from "./main.js";
import { clearAttacks, clearFireworks } from "./render.js";

let active = false;
export function isInputActive() {
  return active;
}

export function setupInput(canvas, gameState) {
  active = true;
  canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const ratio = getRatio();

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const gridX = Math.floor(mouseX / ratio / TILE_SIZE);
    const gridY = Math.floor(mouseY / ratio / TILE_SIZE);

    const selectedUnit = gameState.units.find(
      (u) => u.id === gameState.selectedUnitId,
    );

    const clickedUnit = gameState.units.find(
      (u) => u.x === gridX && u.y === gridY,
    );

    // If clicking the selected unit -> unselect it
    if (clickedUnit === selectedUnit) {
      gameState.selectedUnitId = null;
      return;
    }

    // If clicking an empty tile -> unselect unit
    if (selectedUnit && !isTileMovable(selectedUnit, gridX, gridY) && !isTileOccupied(gridX, gridY)) {
      gameState.selectedUnitId = null;
      return;
    }

    // If clicking a player unit -> select it
    if (clickedUnit && clickedUnit.team === "player") {
      gameState.selectedUnitId = clickedUnit.id;
      return;
    }

    // If clicking on a tile (including movable) while
    // selectedUnit cannot act -> unselect it
    if (
      selectedUnit &&
      !canAct(selectedUnit)
    ) {
      gameState.selectedUnitId = null;
      return;
    }

    // If a unit is selected and tile is movable -> move
    if (selectedUnit && canAct(selectedUnit) && isTileMovable(selectedUnit, gridX, gridY)) {
      selectedUnit.x = gridX;
      selectedUnit.y = gridY;
      selectedUnit.hasActed = true; // mark as acted
      gameState.selectedUnitId = null;
      return;
    }
    // If a unit is selected and clicked tile has an enemy -> attack
    if (selectedUnit && canAct(selectedUnit) && clickedUnit && clickedUnit.team !== selectedUnit.team) {
      // check range
      if (inRange(selectedUnit, clickedUnit)) {
        attack(selectedUnit, clickedUnit);
        selectedUnit.hasActed = true;
      }

      // Otherwise -> deselect
      gameState.selectedUnitId = null;
    }
  });
}

export function setupFooterInput(canvas, gameState, buttons) {
  canvas.addEventListener("click", (e) => {
    buttons.forEach( (b) => {
      switch (b.id) {

        case END_TURN:
          if (inButton(canvas, e, b)) {
            endTurn();
          }
          break;

        case RESET:
          if (inButton(canvas, e, b)) {
            clearAttacks();
            clearFireworks();
            interrupt();
            restartGame();
          }
          break;

        default:
          break;
      }
    });
  });
}

function inButton(canvas, e, button) {
  return inRect(canvas, e, button.x, button.y, button.width, button.height);
}

function inRect(canvas, e, x, y, width, height) {
  const rect = canvas.getBoundingClientRect();
  const ratio = getRatio();

  const mouseX = (e.clientX - rect.left) / ratio;
  const mouseY = (e.clientY - rect.top) / ratio;

  if(mouseX > x && mouseX < x + width && mouseY > y && mouseY < y + height) { return true; }
  return false;
}