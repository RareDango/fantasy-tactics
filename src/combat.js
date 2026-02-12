import { gameState, renderCanvasTrue, updateMVP } from "./game.js";
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

  if(attacker.team === "player") { attacker.dmgDealt++; }
  if(defender.team === "player") { defender.dmgTaken++; }

  if (defender.hp <= 0) {
    if(attacker.team === "player") {
      attacker.kills++;
      updateMVP();
    }
    defender.hp = 0; // clamp to zero
    if(gameState.selectedUnitId === defender.id) { gameState.selectedUnitId = null; }
    gameState.units = gameState.units.filter( (u) => u.id !== defender.id );
  }
  updateMVP();
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

function manhattan(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}