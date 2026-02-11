import { inRange } from "./combat.js";
import { GRID_WIDTH, GRID_HEIGHT } from "./constants.js";
import { gameState } from "./game.js";

export function getMovableTiles(unit) {
  const tiles = [];

  for (let x = 0; x < GRID_WIDTH; x++) {
    for (let y = 0; y < GRID_HEIGHT; y++) {
      const distance = Math.abs(unit.x - x) + Math.abs(unit.y - y);
      if (distance > 0 && distance <= unit.moveRange && !isTileOccupied(x, y)) {
        tiles.push({ x, y });
      }
    }
  }

  return tiles;
}

export function getAttackableTiles(unit) {
  const tiles = [];

  for (let x = 0; x < GRID_WIDTH; x++) {
    for (let y = 0; y < GRID_HEIGHT; y++) {
      const distance = Math.abs(unit.x - x) + Math.abs(unit.y - y);
      if (distance > 0 && distance <= unit.moveRange && isTileOccupied(x, y)) {
        for (const u of gameState.units.filter((u) => u.team === "enemy")) {
          if (u.x === x && u.y === y && inRange(unit, u)) {
            tiles.push({ x, y });
          }
        }
      }
    }
  }

  return tiles;
}

export function isTileMovable(unit, x, y) {
  if (isTileOccupied(x, y)) {
    return false;
  }
  const distance = Math.abs(unit.x - x) + Math.abs(unit.y - y);
  return distance > 0 && distance <= unit.moveRange && !isTileOccupied(x, y);
}

export function isTileOccupied(x, y) {
  for (const u of gameState.units) {
    if (u.x == x && u.y == y) return true;
  }
  return false;
}
