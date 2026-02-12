import { inRange } from "./combat.js";
import { GRID_WIDTH, GRID_HEIGHT } from "./constants.js";
import { gameState } from "./game.js";
import { containsTile, getMovableTiles, listArrayObjects } from "./movement.js";

export function getPlayerMovableTiles(unit) {
  const tiles = getMovableTiles(unit, unit.actionsLeft);
  const length = tiles.length;
  for(let i = 0; i < length; i++) {
    if(tiles[i].d === unit.actionsLeft) {
      tiles.push(tiles[i]);
    }
  }
  return tiles;
}

function getDistance(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function getAttackableTiles(unit) {
  const tiles = [];

  for(let x = 0; x < GRID_WIDTH; x++) {
    for(let y = 0; y < GRID_HEIGHT; y++) {
      if(isTileOccupied(x, y)) {
        for(let i = 0; i < gameState.units.length; i++) {
          const u = gameState.units[i];
          if(u.team === unit.team) { continue; }
          if(u.x === x && u.y === y && inRange(unit, u)) {
            tiles.push({x, y});
          }
        }
      }
    }
  }

  return tiles;
}

export function isTileMovable(unit, x, y) {
  const tiles = getMovableTiles(unit, unit.actionsLeft);
  if(containsTile({x:x, y:y}, tiles)) { return true; }
  return false;
}

export function isTileOccupied(x, y) {
  for (const u of gameState.units) {
    if (u.x == x && u.y == y) return true;
  }
  for (const o of gameState.obstacles) {
    if (o.x == x && o.y == y) return true;
  }
  return false;
}