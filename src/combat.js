/**
 * @param {Object} attacker - attacking unit
 * @param {Object} defender - defending unit
 */
export function attack(attacker, defender) {
  defender.hp -= attacker.attackPower;

  if (defender.hp <= 0) {
    defender.hp = 0; // clamp to zero
  }
}

/**
 * Check if two units are in attack range
 */
export function inRange(attacker, defender) {
  const dx = Math.abs(attacker.x - defender.x);
  const dy = Math.abs(attacker.y - defender.y);
  return dx + dy <= attacker.attackRange;
}
