import {
  TILE_SIZE,
  GRID_WIDTH,
  GRID_HEIGHT,
  FOOTER_HEIGHT,
  CANVAS_WIDTH,
  HEADER_HEIGHT,
  CANVAS_HEIGHT,
  MAX_UNITS,
  TAB_UNITS,
  TAB_VISUALS,
  BUTTON_ACCEPT,
  BUTTON_PLAYERS_DOWN,
  BUTTON_WHITE_GRID,
  BUTTON_CLOSE_SETTINGS
} from "./constants.js";
import { AnimationData } from "./AnimationData.js";
import { gameState, renderCanvasTrue, initGame, gameLoop } from "./game.js";
import { assets } from "./assets.js";


export async function start() {
  initGame();
  requestAnimationFrame(gameLoop);
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
//const fireworksImages = [];
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

  assets.fireworksImages[fireworkIndex] = tintImage(assets.fireworksImages[fireworkIndex], firework.hue);

  fireworkIndex++;
  if(fireworkIndex >= assets.fireworksImages.length) { fireworkIndex = 0; }
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

const map = [];
const tileData = new AnimationData(assets.tiles, 64, 16);
export function setupMap() {
  map.length = 0;
  for(let x = 0; x < GRID_WIDTH; x++) {
    for(let y = 0; y < GRID_HEIGHT; y++) {
      const randIndex = Math.floor(Math.random() * 16);
      map.push(randIndex);
    }
  }
}

export function drawGrid() {
  // Tile Images
  for(let x = 0; x < GRID_WIDTH; x++) {
    for(let y = 0; y < GRID_HEIGHT; y++) {
      const arrayIndex = x * GRID_WIDTH + y;
      tileData.index = map[arrayIndex];
      const px = x * TILE_SIZE;
      const py = y * TILE_SIZE;
      drawImage(ctx, assets.tiles, px, py, TILE_SIZE, TILE_SIZE, 0, tileData);
    }
  }
  // Grid Lines
  const color = gameState.whiteGrid ? "#eee" : "#111";
  for (let i = 0; i <= GRID_WIDTH; i++) {
    drawLine(ctx, i * TILE_SIZE, 0, i * TILE_SIZE, GRID_HEIGHT * TILE_SIZE, color, 1);
    drawLine(ctx, 0, i * TILE_SIZE, GRID_WIDTH * TILE_SIZE, i * TILE_SIZE, color, 1);
  }
}

export function drawUnit(unit, isSelected) {
  const x = unit.x * TILE_SIZE;
  const y = unit.y * TILE_SIZE;

  if (isSelected) {
    drawRect(ctx, x + 6, y + 6, TILE_SIZE - 12, TILE_SIZE - 12, unit.actionsLeft < 1 ? "rgba(250, 204, 21, 0.25)" : "rgba(250, 204, 21, 0.75)" );
    if(unit.actionsLeft && unit.attacksLeft) {
      drawRectStroke(ctx, x + 3, y + 3, TILE_SIZE - 6, TILE_SIZE - 6, "rgba(250, 21, 21, 0.3)");
    }
  } else if (unit.team == "player" && unit.actionsLeft > 0) {
    drawRectStroke(ctx, x + 6, y + 6, TILE_SIZE - 12, TILE_SIZE - 12, "rgba(250, 204, 21, 0.5)");
    if(unit.actionsLeft && unit.attacksLeft) {
      drawRectStroke(ctx, x + 3, y + 3, TILE_SIZE - 6, TILE_SIZE - 6, "rgba(250, 21, 21, 0.3)");
    }
  }

  if (unit.team === "enemy" && unit.current) {
    drawRect(ctx, x, y, TILE_SIZE, TILE_SIZE, "rgba(239, 68, 68, 0.25)");
  }

  drawImage(
    ctx,
    unit.team === "player" ? assets.unitsImages[unit.animationData.arrayIndex] : assets.goblin,
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

export function drawMoveTiles(tiles, unit) {
  for (const tile of tiles) {
    drawRect(ctx, tile.x * TILE_SIZE, tile.y * TILE_SIZE, TILE_SIZE, TILE_SIZE, unit.actionsLeft < 1 ? "rgba(59, 130, 246, 0.1)" : "rgba(59, 130, 246, 0.25)");
  }
}

export function drawAttackTiles(tiles, unit) {
  let canAttack = false;
  if(unit.actionsLeft && unit.attacksLeft) { canAttack = true; }
  for (const tile of tiles) {
    drawRect(ctx, tile.x * TILE_SIZE, tile.y * TILE_SIZE, TILE_SIZE, TILE_SIZE, !canAttack ? "rgba(246, 59, 59, 0.0)" : "rgba(246, 59, 59, 0.25)");
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
      drawImage(ctx, assets.fireworksImages[f.arrayIndex], f.x, f.y, f.drawSize, f.drawSize, 0, f);
      renderCanvasTrue();
      if(f.index === f.length - 1) {
        f.kill = true;
      }
    }
  }
}

export function drawSettings(gameState, buttons, tabs, delta) {
  // darken game
  drawRect(ctx, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, "rgba(0, 0, 0, 0.5)");
  
  // tabs
  for(let i = 0; i < tabs.length; i++) {
    const t = tabs[i];
    drawImage(ctx, t.image, t.x, t.y, t.width, t.height);
  }

  // settings background
  drawImage(ctx, assets.settingsBackground, TILE_SIZE, TILE_SIZE * 1 + 28, TILE_SIZE * 6, TILE_SIZE * 6);

  for(let i = 0; i < buttons.length; i++) {
      const b = buttons[i];
      if(b.id < BUTTON_CLOSE_SETTINGS || b.id > BUTTON_CLOSE_SETTINGS) { continue; }
      drawImage(ctx, b.image, b.x, b.y, b.width, b.height);
    }

  if(gameState.activeTab === TAB_UNITS) {
    drawRect(ctx, TILE_SIZE * 1.25, TILE_SIZE * 1.75 + 32, TILE_SIZE * 5.5 , TILE_SIZE * 1.5, "rgba(255, 255, 255, 0.5)");
    drawRect(ctx, TILE_SIZE * 1.25, TILE_SIZE * 3.5 + 32, TILE_SIZE * 5.5 , TILE_SIZE * 1.5, "rgba(255, 255, 255, 0.5)");

    // buttons
    for(let i = 0; i < buttons.length; i++) {
      const b = buttons[i];
      if(b.id < BUTTON_ACCEPT || b.id > BUTTON_PLAYERS_DOWN) { continue; }
      drawImage(ctx, b.image, b.x, b.y, b.width, b.height);
    }

    // unit numbers
    const center = CANVAS_WIDTH / 2;
    const playersY = TILE_SIZE * 2.5 + 28;
    const enemiesY = TILE_SIZE * 4.25 + 28;

    const col = (gameState.newEnemyUnits + gameState.newPlayerUnits) >= MAX_UNITS ? "red" : "black";
    textStyle(ctx, "24px Arial", col, "middle", "center");
    const pString = `PLAYERS: ${gameState.newPlayerUnits}`;
    drawText(ctx, pString, center, playersY);

    const eString = `ENEMIES: ${gameState.newEnemyUnits}`;
    drawText(ctx, eString, center, enemiesY);

    textStyle(ctx, "20px Arial", "#333", "middle", "center");
    drawText(ctx, `Max Units = ${MAX_UNITS}`, CANVAS_WIDTH / 2, 92 + 28);
  } else if (gameState.activeTab === TAB_VISUALS) {


    // TODO: put in visuals options

    // white gridlines
    for(let i = 0; i < buttons.length; i++) {
      const b = buttons[i];
      if(b.id < BUTTON_WHITE_GRID || b.id > BUTTON_WHITE_GRID) { continue; }
      //drawImage(ctx, b.image, b.x, b.y, b.width, b.height);
      drawRect(ctx, b.x, b.y, b.width, b.height, b.color);
      drawRectStroke(ctx, b.x, b.y, b.width, b.height, b.borderColor);
      if(gameState.whiteGrid) {
        const buffer = 8;
        drawLine(ctx, b.x + buffer, b.y + buffer, b.x + b.width - buffer, b.y + b.height - buffer, "black", 3);
        drawLine(ctx, b.x + b.width - buffer, b.y + buffer, b.x + buffer, b.y + b.height - buffer, "black", 3);
      }
      textStyle(ctx, "24px Arial", "black");
      drawText(ctx, b.text, b.x + TILE_SIZE * 1.5, b.y + TILE_SIZE / 2)
    }

    // fireworks?


  }

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
    clear(header);
    // TOP BAR
    const numLines = 2;
    const margin = 8;
    const textSize = (TILE_SIZE - (numLines + 1) * margin) / numLines;
    const portraitSize = TILE_SIZE * 2;

    let players = 0;
    let enemies = 0;

    const units = gameState.units;
    for(let i = 0; i < units.length; i++) {
      if(units[i].team === "player") { players++; }
      else { enemies++; }
    }

    textStyle(hctx, `${textSize}px Arial`, "white", "top");
    if (players === 0) { // Enemy wins
      drawText(hctx, `Turn: ${gameState.turnNumber}`, margin, margin);
      textStyle(hctx, `${textSize}px Arial`, "white", "top", "center");
      drawText(hctx, "You lose! Bad job, loser!", CANVAS_WIDTH / 2, margin);

    } else if (enemies === 0) { // Player wins
      drawText(hctx, `Turn: ${gameState.turnNumber}`, margin, margin);
      textStyle(hctx, `${textSize}px Arial`, "white", "top", "center");
      drawText(hctx, "You win! Good job, champ!", CANVAS_WIDTH / 2, margin);
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
      drawImage(hctx, assets.portraitsImages[selectedUnit.animationData.arrayIndex], 0, TILE_SIZE, pSize, pSize, null, selectedUnit.animationData)
      
      let color = "#3b82f6";
      if(gameState.currentTurn === "enemy") { color = "#ef4444"; }
      drawLine(hctx, portraitSize, TILE_SIZE, portraitSize, TILE_SIZE + portraitSize, color, 2);

      const numLines = 4;
      const margin = 8;
      const textSize = (portraitSize - (numLines + 1) * margin) / numLines;
      
      textStyle(hctx, `${textSize}px Arial`, "white", "top");
      drawText(hctx, `${selectedUnit.name}`, portraitSize + margin, TILE_SIZE + margin);
      drawText(hctx, `HP: ${selectedUnit.hp}/${selectedUnit.maxHp}`, portraitSize + margin, TILE_SIZE + textSize + margin * 2);
      drawText(hctx, `AP: ${selectedUnit.actionsLeft}/${selectedUnit.maxActions}`, portraitSize + margin + TILE_SIZE * 2, TILE_SIZE + textSize + margin * 2);
      drawText(hctx, `Attacks: ${selectedUnit.attacksLeft}/${selectedUnit.maxAttacks}`, portraitSize + margin, TILE_SIZE + textSize * 2 + margin * 3);
      drawText(hctx, `\"${selectedUnit.quote}\"`, portraitSize + margin, TILE_SIZE + textSize * 3 + margin * 4);
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

    drawImage(fctx, assets.fantasyTactics, 0, TILE_SIZE * 1.5, CANVAS_WIDTH, TILE_SIZE);

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
  if(!image) { return; }
  if(animationData) {
    context.save();

    const centerX = x + width / 2;
    const centerY = y + width / 2;
    context.translate(centerX, centerY);

    const radians = animationData.direction * (Math.PI / 2);
    context.rotate(radians);
    context.drawImage(image, animationData.index * animationData.size, 0, animationData.size, animationData.size, x - centerX, y - centerY, width, width);

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