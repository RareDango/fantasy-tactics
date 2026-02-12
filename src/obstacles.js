import { GRID_HEIGHT, GRID_WIDTH } from "./constants.js";
import { gameState } from "./game.js";
import { AnimationData } from "./AnimationData.js";

/**
 * @typedef {Object} Obstacle
 * @property {number} id
 * @property {number} x
 * @property {number} y
 * @property {AnimationData} animationData
 */

/** @returns {Obstacle} */
export function createObstacle(id, x, y, animationData) {
  return {
    id,
    x,
    y,
    animationData
  };
}

export function containsObstacle(x, y) {
  for(let i = 0; i < gameState.obstacles.length; i++) {
    const o = gameState.obstacles[i];
    if(o.x === x && o.y === y) { return true; }
  }
  return false;
}



export function isMapFullyConnected() {
  const visited = new Set();
  const queue = [];

  // Find first walkable tile
  let start = null;
  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      if (!containsObstacle(x, y)) {
        start = { x, y };
        break;
      }
    }
    if (start) break;
  }

  if (!start) return true; // no walkable tiles

  queue.push(start);
  visited.add(`${start.x},${start.y}`);

  const directions = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 }
  ];

  while (queue.length > 0) {
    const current = queue.shift();

    for (const dir of directions) {
      const nx = current.x + dir.x;
      const ny = current.y + dir.y;
      const key = `${nx},${ny}`;

      if (
        nx >= 0 &&
        ny >= 0 &&
        nx < GRID_WIDTH &&
        ny < GRID_HEIGHT &&
        !containsObstacle(nx, ny) &&
        !visited.has(key)
      ) {
        visited.add(key);
        queue.push({ x: nx, y: ny });
      }
    }
  }

  // Count total walkable tiles
  let walkableCount = 0;
  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      if (!containsObstacle(x, y)) {
        walkableCount++;
      }
    }
  }

  return visited.size === walkableCount;
}

export function getWallImageIndex(x, y) {
  let u = false;
  let r = false;
  let d = false;
  let l = false;

  if(containsObstacle(x, y-1)) { u = true; }
  if(containsObstacle(x+1, y)) { r = true; }
  if(containsObstacle(x, y+1)) { d = true; }
  if(containsObstacle(x-1, y)) { l = true; }

  if(!u && !r && !d && !l) { return 0; }

  if(u && !r && !d && !l) { return 1; }
  if(!u && r && !d && !l) { return 2; }
  if(!u && !r && d && !l) { return 3; }
  if(!u && !r && !d && l) { return 4; }

  if(u && r && !d && !l) { return 5; }
  if(u && !r && d && !l) { return 6; }
  if(u && !r && !d && l) { return 7; }
  if(!u && r && d && !l) { return 8; }
  if(!u && r && !d && l) { return 9; }
  if(!u && !r && d && l) { return 10; }

  if(u && r && d && !l) { return 11; }
  if(u && r && !d && l) { return 12; }
  if(u && !r && d && l) { return 13; }
  if(!u && r && d && l) { return 14; }

  if(u && r && d && l) { return 15; }
  return undefined;
}