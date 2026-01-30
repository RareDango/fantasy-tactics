/**
 * @typedef {Object} Button
 * @property {number} id
 * @property {string} text
 * @property {Image} image
 * @property {number} x
 * @property {number} y
 * @property {number} width
 * @property {number} height
 * @property {string} color
 * @property {string} borderColor
 */

/** @returns {Button} */
export function createButton(id, text, image, x, y, width, height, color, borderColor) {
  return {
    id,
    text,
    image,
    x,
    y,
    width,
    height,
    color,
    borderColor
  };
}