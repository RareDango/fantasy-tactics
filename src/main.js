import { CONTAINER_WIDTH, CONTAINER_HEIGHT, gameVersion } from "./constants.js";
import { start } from "./render.js";

console.log("Fantasy Tactics v" + gameVersion);

let ratio = 1;
export function getRatio() { return ratio; }

resize();
window.addEventListener("resize", () => { resize(); });

function resize() {
  let aspect = CONTAINER_WIDTH / CONTAINER_HEIGHT;
  let width = window.innerWidth;
  let height = window.innerHeight;
  let container = document.getElementById("game-container");

  let w = width;
  let h = width / aspect;

  if (h > height) {
    h = height;
    w = height * aspect;
  }

  container.style.width = `${w}px`;
  container.style.height = `${h}px`;

  ratio = w / CONTAINER_WIDTH; // gives us the ratio between the hard coded pixels and whats actually displayed
}

start();