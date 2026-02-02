/**
 * @typedef {'player' | 'enemy'} Team
 */

/**
 * @typedef {Object} Unit
 * @property {number} id
 * @property {Team} team
 * @property {number} x
 * @property {number} y
 * @property {number} maxHp
 * @property {number} hp
 * @property {number} moveRange
 * @property {number} attackRange
 * @property {number} attackPower
 * @property {boolean} hasActed
 * @property {boolean} current
 */

/** @returns {Unit} */
export function createPlayerUnit(id, x, y) {
  return {
    id,
    team: 'player',
    name: 'Jimmy',
    x,
    y,
    maxHp: 4,
    hp: 4,
    moveRange: 3,
    attackRange: 1, // melee only for now
    attackPower: 1,
    hasActed: false,
    current: false,
    quote: "Hi!",
    hue: 0
  };
}

export function createEnemyUnit(id, x, y) {
  return {
    id,
    team: 'enemy',
    x,
    y,
    maxHp: 2,
    hp: 2,
    moveRange: 2,
    attackRange: 1,
    attackPower: 1,
    hasActed: false,
    actions: 3,
    current: false
  };
}