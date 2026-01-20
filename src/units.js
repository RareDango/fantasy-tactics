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
    hasActed: false,
  };
}
