/**
 * @typedef {'player' | 'enemy'} Team
 */

import { AnimationData } from "./AnimationData.js";

/**
 * @typedef {Object} Unit
 * @property {number} id
 * @property {Team} team
 * @property {number} x
 * @property {number} y
 * @property {number} maxHp
 * @property {number} hp
 * @property {number} maxActions
 * @property {number} actionsLeft
 * @property {number} attackRange
 * @property {number} maxAttacks
 * @property {number} attacksLeft
 * @property {boolean} current
 * @property {number} portraitId;
 * @property {AnimationData} animationData
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
    maxActions: 3,
    actionsLeft: 3,
    attackRange: 1,
    maxAttacks: 1,
    attacksLeft: 1,
    current: false,
    quote: "Hi!",
    hue: 0,

    dmgDealt: 0,
    dmgTaken: 0,
    kills: 0,
    moved: 0
  };
}

export function createEnemyUnit(id, x, y) {
  return {
    id,
    team: 'enemy',
    type: 0,
    x,
    y,
    maxHp: 2,
    hp: 2,
    maxActions: 3,
    actionsLeft: 3,
    attackRange: 1,
    maxAttacks: 1,
    attacksLeft: 1,
    current: false
  };
}