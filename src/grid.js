import { GRID_WIDTH, GRID_HEIGHT } from './constants.js';

export function getMovableTiles(unit) {
  const tiles = [];

  for (let x = 0; x < GRID_WIDTH; x++) {
    for (let y = 0; y < GRID_HEIGHT; y++) {
      const distance =
        Math.abs(unit.x - x) + Math.abs(unit.y - y);

      if (distance > 0 && distance <= unit.moveRange) {
        tiles.push({ x, y });
      }
    }
  }

  return tiles;
}