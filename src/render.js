import {
  TILE_SIZE,
  GRID_WIDTH,
  GRID_HEIGHT,
  FOOTER_HEIGHT,
  CANVAS_WIDTH,
  HEADER_HEIGHT,
  CANVAS_HEIGHT,
  UP
} from "./constants.js";
import { AnimationData } from "./AnimationData.js";
import { gameState, renderCanvasTrue, initGame, gameLoop } from "./game.js";

export let assets;

export async function start() {
  assets = await loadAssets();

  assignImageArrays();
  
  initGame();
  requestAnimationFrame(gameLoop);
}

function assignImageArrays() {
  fireworksImages.push(assets.firework0);
  fireworksImages.push(assets.firework1);
  fireworksImages.push(assets.firework2);
  fireworksImages.push(assets.firework3);
  fireworksImages.push(assets.firework4);
  fireworksImages.push(assets.firework5);
  fireworksImages.push(assets.firework6);
  fireworksImages.push(assets.firework7);

  portraitsImages.push(assets.portrait0);
  portraitsImages.push(assets.portrait1);
  portraitsImages.push(assets.portrait2);
  portraitsImages.push(assets.portrait3);
  portraitsImages.push(assets.portrait4);
  portraitsImages.push(assets.portrait5);
  portraitsImages.push(assets.portrait6);
  portraitsImages.push(assets.portrait7);
  portraitsImages.push(assets.portrait8);
  portraitsImages.push(assets.portrait9);
  portraitsImages.push(assets.portrait10);
  portraitsImages.push(assets.portrait11);

  unitsImages.push(assets.knight0);
  unitsImages.push(assets.knight1);
  unitsImages.push(assets.knight2);
  unitsImages.push(assets.knight3);
  unitsImages.push(assets.knight4);
  unitsImages.push(assets.knight5);
  unitsImages.push(assets.knight6);
  unitsImages.push(assets.knight7);
  unitsImages.push(assets.knight8);
  unitsImages.push(assets.knight9);
  unitsImages.push(assets.knight10);
  unitsImages.push(assets.knight11);
}

async function loadAssets() {
  const assets = {};

  assets.knight = await loadImage("knight_blue.png");
  assets.goblin = await loadImage("goblin.png");

  assets.settingsBackground = await loadImage("settings_bg.png");

  assets.b_settings = await loadImage("button_gear.png");
  assets.b_cancel = await loadImage("button_x.png");
  assets.b_accept = await loadImage("button_check.png");
  assets.b_up = await loadImage("button_up.png");
  assets.b_down = await loadImage("./button_down.png");

  assets.b_footer = await loadImage("./button_160x64.png");

  assets.portrait = await loadImage("spritesheets/knight_animated.png");
  assets.attack = await loadImage("spritesheets/attack_animated.png");

  assets.firework0 = await loadImage("spritesheets/fireworks_animated.png");
  assets.firework1 = await loadImage("spritesheets/fireworks_animated.png");
  assets.firework2 = await loadImage("spritesheets/fireworks_animated.png");
  assets.firework3 = await loadImage("spritesheets/fireworks_animated.png");
  assets.firework4 = await loadImage("spritesheets/fireworks_animated.png");
  assets.firework5 = await loadImage("spritesheets/fireworks_animated.png");
  assets.firework6 = await loadImage("spritesheets/fireworks_animated.png");
  assets.firework7 = await loadImage("spritesheets/fireworks_animated.png");

  assets.portrait0  = await loadImage("spritesheets/knight_animated.png");
  assets.portrait1  = await loadImage("spritesheets/knight_animated.png");
  assets.portrait2  = await loadImage("spritesheets/knight_animated.png");
  assets.portrait3  = await loadImage("spritesheets/knight_animated.png");
  assets.portrait4  = await loadImage("spritesheets/knight_animated.png");
  assets.portrait5  = await loadImage("spritesheets/knight_animated.png");
  assets.portrait6  = await loadImage("spritesheets/knight_animated.png");
  assets.portrait7  = await loadImage("spritesheets/knight_animated.png");
  assets.portrait8  = await loadImage("spritesheets/knight_animated.png");
  assets.portrait9  = await loadImage("spritesheets/knight_animated.png");
  assets.portrait10 = await loadImage("spritesheets/knight_animated.png");
  assets.portrait11 = await loadImage("spritesheets/knight_animated.png");

  assets.knight0  = await loadImage("knight_blue.png");
  assets.knight1  = await loadImage("knight_blue.png");
  assets.knight2  = await loadImage("knight_blue.png");
  assets.knight3  = await loadImage("knight_blue.png");
  assets.knight4  = await loadImage("knight_blue.png");
  assets.knight5  = await loadImage("knight_blue.png");
  assets.knight6  = await loadImage("knight_blue.png");
  assets.knight7  = await loadImage("knight_blue.png");
  assets.knight8  = await loadImage("knight_blue.png");
  assets.knight9  = await loadImage("knight_blue.png");
  assets.knight10 = await loadImage("knight_blue.png");
  assets.knight11 = await loadImage("knight_blue.png");

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

let renderHeader = true;

// Attacks
const attacks = []
export function newAttack(x, y, direction) {
  const attack = new AnimationData(null, 64, 11, false);
  attack.direction = direction;
  attack.setXY(x * TILE_SIZE, y * TILE_SIZE);
  attack.frameTime = 50;
  attack.hitFrame = 7;
  attacks.push(attack);

  return attack.hitFrame * attack.frameTime;
}




export function clearAttacks() {
  attacks.length = 0;
}

// Fireworks
const fireworks = [];
const fireworksImages = [];
let fireworkIndex = 0;
function newFirework() {
  const firework = new AnimationData(fireworkIndex, 64, 11, false);

  firework.drawSize = TILE_SIZE + ((Math.random() + Math.random()) * TILE_SIZE * 2);
  firework.hue = Math.random() * 360;
  const range = (TILE_SIZE * GRID_WIDTH) - firework.drawSize;
  const centerpoint = firework.drawSize / 2;
  const x = (Math.random() * range);
  const y = (Math.random() * range);
  firework.setXY(x, y);
  firework.frameTime = 100;
  firework.direction = Math.random();
  firework.kill = false;
  fireworks.push(firework);

  fireworksImages[fireworkIndex] = tintImage(fireworksImages[fireworkIndex], firework.hue);

  fireworkIndex++;
  if(fireworkIndex >= fireworksImages.length) { fireworkIndex = 0; }
}

export function clearFireworks() {
  fireworks.length = 0;
}

let hctx, ctx, fctx;

export function clear(canvas) {
  canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
}

export function setupRenderer(h, c, f) {
  hctx = h.getContext("2d");
  ctx = c.getContext("2d");
  fctx = f.getContext("2d");
}

export function drawGrid() {
  for (let i = 0; i <= GRID_WIDTH; i++) {
    drawLine(ctx, i * TILE_SIZE, 0, i * TILE_SIZE, GRID_HEIGHT * TILE_SIZE, "#555", 1);
    drawLine(ctx, 0, i * TILE_SIZE, GRID_WIDTH * TILE_SIZE, i * TILE_SIZE, "#555", 1);
  }
}

export const unitsImages = [];
export const portraitsImages = [];
export function drawUnit(unit, isSelected) {
  const x = unit.x * TILE_SIZE;
  const y = unit.y * TILE_SIZE;

  if (isSelected) {
    drawRect(ctx, x + 6, y + 6, TILE_SIZE - 12, TILE_SIZE - 12, unit.hasActed ? "rgba(250, 204, 21, 0.25)" : "rgba(250, 204, 21, 0.75)" );
  } else if (unit.team == "player" && !unit.hasActed) {
    drawRectStroke(ctx, x + 6, y + 6, TILE_SIZE - 12, TILE_SIZE - 12, "rgba(250, 204, 21, 0.5)");
  }

  if (unit.team === "enemy" && unit.current) {
    drawRect(ctx, x, y, TILE_SIZE, TILE_SIZE, "rgba(239, 68, 68, 0.25)");
  }

  drawImage(
    ctx,
    unit.team === "player" ? unitsImages[unit.animationData.arrayIndex] : assets.goblin,
    x + 4,
    y + 4,
    TILE_SIZE - 8,
    TILE_SIZE - 8
  )

  // Draw HP bar
  const hpX = x + 7;
  const hpY = y + TILE_SIZE - 13;
  const maxWidth = (TILE_SIZE - 14);
  const hpWidth = (unit.hp / unit.maxHp) * (TILE_SIZE - 14);
  const hpHeight = 6;

  drawRect(ctx, hpX, hpY, maxWidth, hpHeight, "#aa0000");
  drawRect(ctx, hpX, hpY, hpWidth, hpHeight, "green");

  const outlineColor = "black";

  drawRectStroke(ctx, hpX, hpY, maxWidth, hpHeight, outlineColor, 1);

  const offset = maxWidth / unit.maxHp;
  for(let i = 1; i < unit.maxHp; i++) {
    const offX = hpX + (offset * i);
    drawLine(ctx, offX, hpY, offX, hpY + hpHeight, outlineColor, 1);
  }

}

export function drawMoveTiles(tiles, unitHasActed) {
  for (const tile of tiles) {
    drawRect(ctx, tile.x * TILE_SIZE, tile.y * TILE_SIZE, TILE_SIZE, TILE_SIZE, unitHasActed ? "rgba(59, 130, 246, 0.1)" : "rgba(59, 130, 246, 0.25)");
  }
}

export function drawAttackTiles(tiles, acted) {
  for (const tile of tiles) {
    drawRect(ctx, tile.x * TILE_SIZE, tile.y * TILE_SIZE, TILE_SIZE, TILE_SIZE, acted ? "rgba(246, 59, 59, 0.1)" : "rgba(246, 59, 59, 0.25)");
  }
}

export function drawAttacks(delta) {
  // If all attacks are finished, clear out the attacks array
  let clearArray = true;
  for(let i = 0; i < attacks.length; i++) {
    if(!attacks[i].kill) {
      clearArray = false;
    }
  }
  if(clearArray) {
    attacks.length = 0;
  }
  
  for(let i = 0; i < attacks.length; i++) {
    const a = attacks[i];
    if(a.kill) { continue; }
    drawImage(ctx, assets.attack, a.x, a.y, a.size, a.size, 0, a);
    if(a.index === a.length - 1) { a.kill = true; }
  }
}

let countdown = 0;
export function drawFireworks(delta) {
  countdown -= delta;
  if(countdown < 0) {
    newFirework();
    countdown = (Math.random() * 1000) + 200;
  }
  if(fireworks.length > 0) {
    let clearArray = true;
    for(let i = 0; i < fireworks.length; i++) {
      if(!fireworks[i].kill) {
        clearArray = false;
      }
    }
    if(clearArray) {
      clearFireworks();
    }

    for(let i = 0; i < fireworks.length; i++) {
      const f = fireworks[i];
      if(f.kill) { continue; }
      drawImage(ctx, fireworksImages[f.arrayIndex], f.x, f.y, f.drawSize, f.drawSize, 0, f);
      renderCanvasTrue();
      if(f.index === f.length - 1) {
        f.kill = true;
      }
    }
  }
}

export function drawSettings(gameState, buttons, delta) {
  // darken game
  drawRect(ctx, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, "rgba(0, 0, 0, 0.5)");
  
  // settings background
  drawImage(ctx, assets.settingsBackground, TILE_SIZE, TILE_SIZE, TILE_SIZE * 6, TILE_SIZE * 6);

  drawRect(ctx, TILE_SIZE * 1.25, TILE_SIZE * 1.75, TILE_SIZE * 5.5 , TILE_SIZE * 1.5, "rgba(255, 255, 255, 0.5)");
  drawRect(ctx, TILE_SIZE * 1.25, TILE_SIZE * 3.5, TILE_SIZE * 5.5 , TILE_SIZE * 1.5, "rgba(255, 255, 255, 0.5)");

  // buttons
  for(let i = 0; i < buttons.length; i++) {
    const b = buttons[i];
    drawImage(ctx, b.image, b.x, b.y, b.width, b.height);
  }

  // unit numbers
  const center = CANVAS_WIDTH / 2;
  const playersY = TILE_SIZE * 2.5;
  const enemiesY = TILE_SIZE * 4.25;

  textStyle(ctx, "24px Arial", "black", "middle", "center")
  const pString = `PLAYERS: ${gameState.newPlayerUnits}`;
  drawText(ctx, pString, center, playersY);

  const eString = `ENEMIES: ${gameState.newEnemyUnits}`;
  drawText(ctx, eString, center, enemiesY);
}

export function updateAnimations(delta) {
  // HEADER
  let updated = false;
  if(gameState.selectedUnitId != null) {
    const selectedUnit = gameState.units.find(
        (u) => u.id === gameState.selectedUnitId,
    );
    if(selectedUnit.animationData.updateAnimation(delta)) { updated = true; }
  }
  if(updated) { renderHeaderTrue(); }

  // CANVAS

  updated = false;
  for(let i = 0; i < attacks.length; i++) {
    const a = attacks[i];
    if(a.updateAnimation(delta)) {
      updated = true;
    }
  }
  for(let i = 0; i < fireworks.length; i++) {
    const f = fireworks[i];
    if(f.updateAnimation(delta)) {
      updated = true;
    }
  }
  if(updated) { renderCanvasTrue(); }

  // FOOTER

  // ?
}

export function renderHeaderTrue() { renderHeader = true; }

export function drawHeader(gameState, buttons, delta) {
  // HEADER UI
  if(renderHeader) {
    //console.log("Header rendered.");
    clear(header);
    // TOP BAR
    const numLines = 2;
    const margin = 8;
    const textSize = (TILE_SIZE - (numLines + 1) * margin) / numLines;
    const portraitSize = TILE_SIZE * 2;

    textStyle(hctx, `${textSize}px Arial`, "white", "top");

    let players = 0;
    let enemies = 0;

    const units = gameState.units;
    for(let i = 0; i < units.length; i++) {
      if(units[i].team === "player") { players++; }
      else { enemies++; }
    }

    if (players === 0) { // Enemy wins
      drawText(hctx, `Turn: ${gameState.turnNumber}            You lose! Bad job, loser!`, margin, margin);
    } else if (enemies === 0) { // Player wins
      drawText(hctx, `Turn: ${gameState.turnNumber}          You win! Good job, champ!`, margin, margin);
    } else { // Display current turn
      drawText(hctx, `Turn: ${gameState.turnNumber}`, margin, margin);
    }

    let offset = 0;
    for(let i = 0; i < gameState.playerList.length; i++) {
      const player = gameState.playerList[i];
      //const alive = gameState.units.find( (u) => u.name === player);
      let alive = false;
      for(let j = 0; j < gameState.units.length; j++) {
        if(gameState.units[j].name === player) {
          alive = true;
        }
      }

      if (alive) {
        textStyle(hctx, `${textSize}px Arial`, "white", "top");
      } else {
        textStyle(hctx, `${textSize}px Arial`, "#ff6666", "top");
      }

      drawText(hctx, player, margin + offset, textSize + margin * 2);
      offset += hctx.measureText(player).width;

      // Add commas between names
      if(i != gameState.playerList.length - 1) {
        textStyle(hctx, `${textSize}px Arial`, "white", "top");
        drawText(hctx, ", ", margin + offset, textSize + margin * 2);
        offset += hctx.measureText(", ").width;
      }

      for(let i = 0; i < buttons.length; i++) {
        const b = buttons[i];
        drawImage(hctx, b.image, b.x, b.y, b.width, b.height);
      }
    }

    if (gameState.currentTurn == "player") {
      drawRect(hctx, 0, TILE_SIZE, header.width, portraitSize, "rgba(59, 130, 246, 0.15)");
    } else {
      drawRect(hctx, 0, TILE_SIZE, header.width, portraitSize, "rgba(239, 68, 68, 0.15)");
    }

    // DISPLAY SELECTED UNIT INFO
    if (gameState.selectedUnitId != null) {
      drawRect(hctx, 0, TILE_SIZE, portraitSize, portraitSize, "rgba(59, 130, 246, 0.15)");

      const selectedUnit = gameState.units.find(
        (u) => u.id === gameState.selectedUnitId
      );
      // Unit portrait
      const pSize = TILE_SIZE * 2;
      drawImage(hctx, portraitsImages[selectedUnit.animationData.arrayIndex], 0, TILE_SIZE, pSize, pSize, null, selectedUnit.animationData)
      
      let color = "#3b82f6";
      if(gameState.currentTurn === "enemy") { color = "#ef4444"; }
      drawLine(hctx, portraitSize, TILE_SIZE, portraitSize, TILE_SIZE + portraitSize, color, 2);

      const numLines = 4;
      const margin = 8;
      const textSize = (portraitSize - (numLines + 1) * margin) / numLines;
      
      textStyle(hctx, `${textSize}px Arial`, "white", "top");
      drawText(hctx, `${selectedUnit.name}`, portraitSize + margin, TILE_SIZE + margin);
      drawText(hctx, `HP: ${selectedUnit.hp}/${selectedUnit.maxHp}`, portraitSize + margin, TILE_SIZE + textSize + margin * 2);
      drawText(hctx, `\"${selectedUnit.quote}\"`, portraitSize + margin, TILE_SIZE + textSize * 2 + margin * 3);
    }

    let color = "#3b82f6";
    if(gameState.currentTurn === "enemy") { color = "#ef4444"; }
    drawLine(hctx, 0, 64, CANVAS_WIDTH, 64, color, 2);
    drawRectStroke(hctx, 0, 0, CANVAS_WIDTH, HEADER_HEIGHT, color, 4);

    renderHeader = false;
  }
}

let renderFooter = true;
export function drawFooter(gameVersion, updatedDate, buttons) {
  // FOOTER UI

  if(renderFooter) {
    //console.log("Footer rendered.");
    clear(footer);
    drawLine(fctx, 0, 0, CANVAS_WIDTH, 0, "#555", 1);

    // BUTTONS
    for(let i = 0; i < buttons.length; i++) {
      const b = buttons[i];
      //drawRect(fctx, b.x, b.y, b.width, b.height, b.color);
      //drawRectStroke(fctx, b.x, b.y, b.width, b.height, b.borderColor);

      drawImage(fctx, b.image, b.x, b.y, b.width, b.height)

      if(b.text) {
        textStyle(fctx, "bold 26px Arial", "#ddd", "middle", "center");
        fctx.strokeStyle = "#622";
        fctx.lineWidth = 6;
        drawTextStroke(fctx, b.text, b.x + b.width / 2, b.y + b.height / 2);
        drawText(fctx, b.text, b.x + b.width / 2, b.y + b.height / 2);
      }
    }

    const versionText = `Version: ${gameVersion} - Updated: ${updatedDate}`;
    textStyle(fctx, "16px Arial", "#bbb", "alphabetic", "right");
    drawText(fctx, versionText, CANVAS_WIDTH - 10, FOOTER_HEIGHT - 10);

    renderFooter = false;
  }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function textStyle(context, font = "16px Arial", color = "white", baseline = "middle", align = "left") {
  context.fillStyle = color;
  context.font = font;
  context.textBaseline = baseline;
  context.textAlign = align;
}

function drawText(context, text, x, y, maxWidth) {
  context.fillText(text, x, y, maxWidth);
}

function drawTextStroke(context, text, x, y, maxWidth) {
  context.strokeText(text, x, y, maxWidth);
}

function drawLine(context, startX, startY, endX, endY, color = "white", width = 3) {
  context.strokeStyle = color;
  context.lineWidth = width;
  context.beginPath();
  context.moveTo(startX, startY);
  context.lineTo(endX, endY);
  context.stroke();
}

function drawRect(context, x, y, width, height, color = "white") {
  context.fillStyle = color;
  context.fillRect(x, y, width, height);
}

function drawRectStroke(context, x, y, width, height, color = "white", lineWidth = 3) {
  context.strokeStyle = color;
  context.lineWidth = lineWidth;
  context.strokeRect(x, y, width, height);
}

function drawImage(context, image, x, y, width, height, hue = 0, animationData = null) {
  if(animationData) {
    context.save();

    const centerX = x + width / 2;
    const centerY = y + width / 2;
    context.translate(centerX, centerY);

    const radians = animationData.direction * (Math.PI / 2);
    context.rotate(radians);
    context.drawImage(image, animationData.offset, 0, animationData.size, animationData.size, x - centerX, y - centerY, width, width);

    context.restore();
  } else {
    context.drawImage(image, x, y, width, height);
  }
}

export function tintImage(img, hueDegrees) {
  const c = document.createElement("canvas");
  c.width = img.width;
  c.height = img.height;
  const ctx = c.getContext("2d");

  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, c.width, c.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const [nr, ng, nb] = hueRotatePixel(r, g, b, hueDegrees);

    data[i] = nr;
    data[i + 1] = ng;
    data[i + 2] = nb;
  }

  ctx.putImageData(imageData, 0, 0);
  return c;
}

function hueRotatePixel(r, g, b, degrees) {
  // Convert RGB [0,255] → [0,1]
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // grayscale
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    h /= 6;
  }

  // Rotate hue
  h = (h + degrees / 360) % 1;
  if (h < 0) h += 1;

  // Convert HSL → RGB
  let r2, g2, b2;

  if (s === 0) {
    r2 = g2 = b2 = l; // grayscale
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r2 = hue2rgb(p, q, h + 1 / 3);
    g2 = hue2rgb(p, q, h);
    b2 = hue2rgb(p, q, h - 1 / 3);
  }

  return [
    Math.round(r2 * 255),
    Math.round(g2 * 255),
    Math.round(b2 * 255)
  ];
}