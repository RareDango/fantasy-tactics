import { startGame } from "./game.js";

let ratio = 1;
export function getRatio() {
    return ratio;
}

resize();
window.addEventListener("resize", () => {
  resize();
});

function resize() {
  let aspect = 8/12;
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

  ratio = w / 512; // gives us the ratio between the hard coded pixels and whats actually displayed
  //console.log(width + "," + height);
}

startGame();