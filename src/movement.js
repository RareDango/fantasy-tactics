import { GRID_HEIGHT, GRID_WIDTH } from "./constants.js";
import { isTileOccupied } from "./grid.js";

export function getMovableTiles(startNode, maxDistance) {
  const result = [];
  const visited = new Map(); // key: "x,y" → distance
  const queue = [];

  queue.push({ x: startNode.x, y: startNode.y, d: 0 });
  visited.set(`${startNode.x},${startNode.y}`, 0);

  while (queue.length > 0) {
    const node = queue.shift();

    if (node.d >= maxDistance) continue;

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (Math.abs(dx) + Math.abs(dy) !== 1) continue;

        const x = node.x + dx;
        const y = node.y + dy;
        const d = node.d + 1;
        const key = `${x},${y}`;

        if (isOutOfBounds({ x, y })) continue;
        if (isTileOccupied(x, y)) continue;

        if (!visited.has(key)) {
          visited.set(key, d);
          result.push({ x, y, d });
          queue.push({ x, y, d });
        }
      }
    }
  }

  return result;
}


export function listArrayObjects(array) {
  for(let i = 0; i < array.length; i++) {
    console.log("Index: "+i);
    console.log("  X: "+array[i].x);
    console.log("  Y: "+array[i].y);
    console.log("  D: "+array[i].d);
  }
}

export function containsTile(node, nodeArray) {
  for(let i = 0; i < nodeArray.length; i++) {
    if(node.x === nodeArray[i].x && node.y === nodeArray[i].y) {
      return true;
    }
  }
  return false;
}

function isOutOfBounds(node) {
  if (node.x < 0 || node.x >= GRID_WIDTH) return true;
  if (node.y < 0 || node.y >= GRID_HEIGHT) return true;
  return false;
}
