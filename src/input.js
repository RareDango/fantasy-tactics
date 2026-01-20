import { TILE_SIZE } from './constants.js';
import { isTileMovable } from './grid.js';

export function setupInput(canvas, gameState) {
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const gridX = Math.floor(mouseX / TILE_SIZE);
    const gridY = Math.floor(mouseY / TILE_SIZE);

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
      isTileMovable(selectedUnit, gridX, gridY)
    ) {
      selectedUnit.x = gridX;
      selectedUnit.y = gridY;
      gameState.selectedUnitId = null;
      return;
    }

    // 3️⃣ Otherwise → deselect
    gameState.selectedUnitId = null;
  });
}
