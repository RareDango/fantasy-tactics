import { TILE_SIZE } from './constants.js';
import { isTileMovable } from './grid.js';
import { canAct, endTurn, startGame } from './game.js'
import { attack, inRange } from './combat.js';
import { getRatio } from './main.js';

export function setupInput(canvas, gameState) {
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const ratio = getRatio();

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const gridX = Math.floor(mouseX / ratio / TILE_SIZE);
    const gridY = Math.floor(mouseY / ratio / TILE_SIZE);

    const selectedUnit = gameState.units.find(
      (u) => u.id === gameState.selectedUnitId
    );

    const clickedUnit = gameState.units.find(
      (u) => u.x === gridX && u.y === gridY
    );

    // 1️⃣ If clicking a player unit → select it
    if (clickedUnit && clickedUnit.team === 'player') {
      gameState.selectedUnitId = clickedUnit.id;
      return;
    }

    // 2️⃣ If a unit is selected and tile is movable → move
    if (
        selectedUnit &&
        canAct(selectedUnit) &&
        isTileMovable(selectedUnit, gridX, gridY)
    ) {
        selectedUnit.x = gridX;
        selectedUnit.y = gridY;
        selectedUnit.hasActed = true; // mark as acted
        gameState.selectedUnitId = null;
        return;
    }
    // If a unit is selected and clicked tile has an enemy → attack
    if (selectedUnit && canAct(selectedUnit) && clickedUnit && clickedUnit.team !== selectedUnit.team) {
      // check range
      if (inRange(selectedUnit, clickedUnit)) {
        attack(selectedUnit, clickedUnit);
        selectedUnit.hasActed = true;
        gameState.selectedUnitId = null;
  
        // Remove dead unit
        if (clickedUnit.hp <= 0) {
          gameState.units = gameState.units.filter(u => u.id !== clickedUnit.id);
        }
      }

    // 3️⃣ Otherwise → deselect
    gameState.selectedUnitId = null;
    }
  });
  return;
}

export function setupFooterInput(canvas, gameState) {
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    startGame();
    //endTurn();
  });
  return;
}
