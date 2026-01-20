import {
  TILE_SIZE,
  GRID_WIDTH,
  GRID_HEIGHT,
} from './constants.js';

export function drawGrid(ctx) {
  ctx.strokeStyle = '#555';

  for (let x = 0; x <= GRID_WIDTH; x++) {
    ctx.beginPath();
    ctx.moveTo(x * TILE_SIZE, 0);
    ctx.lineTo(x * TILE_SIZE, GRID_HEIGHT * TILE_SIZE);
    ctx.stroke();
  }

  for (let y = 0; y <= GRID_HEIGHT; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * TILE_SIZE);
    ctx.lineTo(GRID_WIDTH * TILE_SIZE, y * TILE_SIZE);
    ctx.stroke();
  }
}

export function drawUnit(ctx, unit, isSelected) {
  const x = unit.x * TILE_SIZE;
  const y = unit.y * TILE_SIZE;

  ctx.fillStyle = unit.team === 'player' ? '#3b82f6' : '#ef4444';
  ctx.fillRect(x + 8, y + 8, TILE_SIZE - 16, TILE_SIZE - 16);

  if (isSelected) {
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 3;
    ctx.strokeRect(x + 6, y + 6, TILE_SIZE - 12, TILE_SIZE - 12);
  }
}

export function drawMoveTiles(ctx, tiles) {
  ctx.fillStyle = 'rgba(59, 130, 246, 0.25)';

  for (const tile of tiles) {
    ctx.fillRect(
      tile.x * TILE_SIZE,
      tile.y * TILE_SIZE,
      TILE_SIZE,
      TILE_SIZE
    );
  }
}
