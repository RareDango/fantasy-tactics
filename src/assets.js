import { MAX_FIREWORKS, MAX_UNITS } from "./constants.js";

export let assets = {};

export async function loadAssets() {
  assets.fantasyTactics = await loadImage("fantasy_tactics.png");

  assets.goblin = await loadImage("goblin.png");

  assets.settingsBackground = await loadImage("settings_bg.png");
  assets.b_settings = await loadImage("button_gear.png");
  assets.b_cancel = await loadImage("button_x.png");
  assets.b_accept = await loadImage("button_check.png");
  assets.b_reset = await loadImage("button_reset.png");
  assets.b_up = await loadImage("button_up.png");
  assets.b_down = await loadImage("./button_down.png");
  assets.b_footer = await loadImage("./button_160x64.png");

  assets.attack = await loadImage("spritesheets/attack_animated.png");

  assets.fireworksImages = [];
  for(let i = 0; i < MAX_FIREWORKS; i++) { assets.fireworksImages.push(await loadImage("spritesheets/fireworks_animated.png")); }

  assets.portraitsImages = [];
  for(let i = 0; i < MAX_UNITS; i++) { assets.portraitsImages.push(await loadImage("spritesheets/knight_animated.png")); }

  assets.unitsImages = [];
  for(let i = 0; i < MAX_UNITS; i++) { assets.unitsImages.push(await loadImage("knight_blue.png")); }

  assets.tiles = await loadImage("./stone_tiles.png");

  return assets;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = `./assets/${src}`;
  });
}