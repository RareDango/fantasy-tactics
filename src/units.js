/**
 * @typedef {'player' | 'enemy'} Team
 */

/**
 * @typedef {Object} Unit
 * @property {number} id
 * @property {Team} team
 * @property {number} x
 * @property {number} y
 * @property {number} hp
 * @property {number} moveRange
 * @property {number} attackRange
 * @property {number} attackPower
 * @property {boolean} hasActed
 */

/** @returns {Unit} */
export function createPlayerUnit() {
  return {
    id: 1,
    team: 'player',
    x: 3,
    y: 4,
    hp: 10,
    moveRange: 3,
    attackRange: 1, // melee only for now
    attackPower: 4,
    hasActed: false,
  };
}

export function createEnemyUnit(id, x, y) {
  return {
    id,
    team: 'enemy',
    x,
    y,
    hp: 8,
    moveRange: 2,
    attackRange: 1,
    attackPower: 3,
    hasActed: false,
  };
}

