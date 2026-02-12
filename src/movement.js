import { GRID_HEIGHT, GRID_WIDTH } from "./constants.js";
import { isTileOccupied } from "./grid.js";
import { getUnitAt } from "./game.js";
import { containsObstacle } from "./obstacles.js";

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

export function getTargets(startNode, maxDistance) {
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
        if (containsObstacle(x, y)) continue;
        if (isTileOccupied(x, y)) {
          const u = getUnitAt(x, y);
          if(u.x === startNode.x && u.y === startNode.y) { continue; }
          if(u.team === "enemy") { continue; }
          result.push({x, y, d, u})
          continue;
        }

        if (!visited.has(key)) {
          visited.set(key, d);
          //result.push({ x, y, d });
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




export function findPath(start, goal) {
  const open = [];
  const closed = new Set();

  open.push({
    x: start.x,
    y: start.y,
    g: 0,
    h: heuristic(start, goal),
    parent: null
  });

  while (open.length > 0) {
    // Pick lowest f-cost node
    open.sort((a, b) => (a.g + a.h) - (b.g + b.h));
    const current = open.shift();

    // Reached target → build path
    if (current.x === goal.x && current.y === goal.y) {
      return reconstructPath(current);
    }

    closed.add(`${current.x},${current.y}`);

    for (const dir of [
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 }
    ]) {
      const nx = current.x + dir.x;
      const ny = current.y + dir.y;
      const key = `${nx},${ny}`;

      if (isOutOfBounds({ x: nx, y: ny })) continue;
      if (isTileOccupied(nx, ny) && !(nx === goal.x && ny === goal.y)) { continue; }
      if (closed.has(key)) continue;

      const g = current.g + 1;
      let node = open.find(n => n.x === nx && n.y === ny);

      if (!node) {
        node = {
          x: nx,
          y: ny,
          g,
          h: heuristic({ x: nx, y: ny }, goal),
          parent: current
        };
        open.push(node);
      } else if (g < node.g) {
        node.g = g;
        node.parent = current;
      }
    }
  }

  return null; // no path
}

function heuristic(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}


function reconstructPath(node) {
  const path = [];
  while (node.parent) {
    path.push({ x: node.x, y: node.y });
    node = node.parent;
  }
  return path.reverse();
}

