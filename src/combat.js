import { gameState, renderCanvasTrue } from "./game.js";
import { newAttack, renderHeaderTrue } from "./render.js";
import { UP, RIGHT, DOWN, LEFT } from './constants.js';

/**
 * @param {Object} attacker - attacking unit
 * @param {Object} defender - defending unit
 */
export async function attack(attacker, defender) {
  const x = (attacker.x + defender.x) / 2;
  const y = (attacker.y + defender.y) / 2;

  let direction;
  if(attacker.y > defender.y) { direction = UP; }
  else if(attacker.x < defender.x) { direction = RIGHT; }
  else if(attacker.y < defender.y) { direction = DOWN; }
  else { direction = LEFT; }

  const delay = newAttack(x, y, direction);

  await new Promise((r) => setTimeout(r, delay));

  defender.hp--;

  if (defender.hp <= 0) {
    defender.hp = 0; // clamp to zero
    if(gameState.selectedUnitId === defender.id) { gameState.selectedUnitId = null; }
    gameState.units = gameState.units.filter( (u) => u.id !== defender.id );
  }
  renderHeaderTrue();
  renderCanvasTrue();
}

/**
 * Check if two units are in attack range
 */
export function inRange(attacker, defender) {
  const dx = Math.abs(attacker.x - defender.x);
  const dy = Math.abs(attacker.y - defender.y);
  return dx + dy <= attacker.attackRange;
}



// ENEMY AI STUFF --- not actually implemented yet. please do at some point VVV

function scoreTarget(enemy, player) {
  let score = 0;

  score -= manhattan(enemy, player); // closer = better
  score += (player.maxHp - player.hp) * 2; // wounded targets
  //score += player.attack * 1.5; // not currently using attack and defence calcs in game
  //score -= player.defense;
  return score;
}

function manhattan(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function chooseTarget(enemy, players) {
  let best = null;
  let bestScore = -Infinity;

  for (const p of players) {
    const score = scoreTarget(enemy, p);
    if (score > bestScore) {
      bestScore = score;
      best = p;
    }
  }

  return best;
}

export function findPath(start, goal) {
  const open = [];
  const closed = new Set();

  open.push({
    x: start.x,
    y: start.y,
    g: 0,
    h: heuristic(start, goal),
    f: heuristic(start, goal),
    parent: null
  });

  while (open.length > 0) {
    let best = 0;
    for (let i = 1; i < open.length; i++) {
      if (open[i].f < open[best].f) best = i;
    }

    const current = open.splice(best, 1)[0];

    if (current.x === goal.x && current.y === goal.y) {
      return reconstructPath(current);
    }

    closed.add(key(current.x, current.y));

    for (const d of directions) {
      const nx = current.x + d.x;
      const ny = current.y + d.y;

      if (isOutOfBounds(nx, ny)) continue;
      if (isBlocked(nx, ny)) continue;
      if (closed.has(key(nx, ny))) continue;

      const g = current.g + 1;
      const h = heuristic({x:nx,y:ny}, goal);
      const f = g + h;

      const node = open.find(n => n.x === nx && n.y === ny);

      if (!node || g < node.g) {
        if (node) {
          node.g = g;
          node.f = f;
          node.parent = current;
        } else {
          open.push({ x: nx, y: ny, g, h, f, parent: current });
        }
      }
    }
  }

  return null;
}

