import { TILE_SIZE } from './constants.js';

export function setupInput(canvas, gameState) {
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const gridX = Math.floor(mouseX / TILE_SIZE);
    const gridY = Math.floor(mouseY / TILE_SIZE);

    const clickedUnit = gameState.units.find(
      (unit) => unit.x === gridX && unit.y === gridY
    );

    if (clickedUnit && clickedUnit.team === 'player') {
      gameState.selectedUnitId = clickedUnit.id;
    } else {
      gameState.selectedUnitId = null;
    }
  });
}