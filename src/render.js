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
import { AnimatedImage } from "./AnimatedImage.js";
import { gameState, renderCanvasTrue } from "./game.js";

export const b_settings   = loadImage("button_gear.png");
export const b_cancel = loadImage("button_x.png");
export const b_accept = loadImage("button_check.png");
export const b_up     = loadImage("button_up.png");
export const b_down   = loadImage("button_down.png");

const settings_bg = loadImage("settings_bg.png");

const knightImage     = loadImage("knight_blue.png");
const goblinImage     = loadImage("goblin.png");
const portraits = [];

let renderHeader = true;

// Portraits
const aniKnight = new AnimatedImage("knight_animated.png", 64, 4);
portraits.push(aniKnight)
export function resetPortraits() {
  for(let i = 0; i < portraits.length; i++) {
    const p = portraits[i];
    p.resetAnimation();
  }
}

// Attacks
const attacks = []
export function newAttack(x, y, direction) {
  const attack = new AnimatedImage("attack_animated.png", 64, 11, false);
  attack.direction = direction;
  attack.setXY(x * TILE_SIZE, y * TILE_SIZE);
  attack.frameTime = 50;
  attack.hitFrame = 7;
  attacks.push(attack)

  return attack.hitFrame * attack.frameTime;
}


export function clearAttacks() {
  attacks.length = 0;
}

// Fireworks
const fireworks = []
function newFirework() {
  const firework = new AnimatedImage("fireworks_animated.png", 64, 11, false);
  firework.drawSize = TILE_SIZE * 1.5 + (Math.random() * TILE_SIZE * 2.5);
  firework.hue = Math.random() * 360;
  const x = (Math.random() * TILE_SIZE * (GRID_WIDTH - 2));
  const y = (Math.random() * TILE_SIZE * (GRID_HEIGHT - 2));
  firework.setXY(x, y);
  firework.frameTime = 100;
  firework.direction = Math.random();
  firework.kill = false;
  fireworks.push(firework)
}

export function clearFireworks() {
  fireworks.length = 0;
}

function loadImage(file) {
  const img = new Image();
  img.addEventListener('load', function() { renderCanvasTrue(); });
  img.src = `./assets/${file}`;
  return img;
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
  //ctx.drawImage(unit.team === "player" ? knightImage : goblinImage, x + 4, y + 4, TILE_SIZE - 8, TILE_SIZE - 8);
  drawImage(
    ctx,
    unit.team === "player" ? knightImage : goblinImage,
    x + 4,
    y + 4,
    TILE_SIZE - 8,
    TILE_SIZE - 8,
    unit.team === "player" ? unit.hue : 0
  )

  // Draw HP bar
  const hpX = x + 7;
  const hpY = y + TILE_SIZE - 13;
  const maxWidth = (TILE_SIZE - 14);
  const hpWidth = (unit.hp / unit.maxHp) * (TILE_SIZE - 14);
  const hpHeight = 6;

  drawRect(ctx, hpX, hpY, maxWidth, hpHeight, "red");
  drawRect(ctx, hpX, hpY, hpWidth, hpHeight, "green");

  drawRectStroke(ctx, hpX, hpY, maxWidth, hpHeight, "white", 1);

  const offset = maxWidth / unit.maxHp;
  for(let i = 1; i < unit.maxHp; i++) {
    const offX = hpX + (offset * i);
    drawLine(ctx, offX, hpY, offX, hpY + hpHeight, "white", 1);
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
    drawImage(ctx, a, a.x, a.y, a.size, delta);
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
      //const fSize = TILE_SIZE * 2;
      const fSize = f.drawSize;
      drawImage(ctx, f, f.x, f.y, f.drawSize, delta, f.hue);
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
  drawImage(ctx, settings_bg, TILE_SIZE, TILE_SIZE, TILE_SIZE * 6, TILE_SIZE * 6);

  drawRect(ctx, TILE_SIZE * 1.25, TILE_SIZE * 1.75, TILE_SIZE * 5.5 , TILE_SIZE * 1.5, "rgba(255, 255, 255, 0.5)");
  drawRect(ctx, TILE_SIZE * 1.25, TILE_SIZE * 3.5, TILE_SIZE * 5.5 , TILE_SIZE * 1.5, "rgba(255, 255, 255, 0.5)");

  // buttons
  for(let i = 0; i < buttons.length; i++) {
    const b = buttons[i];
    drawImage(ctx, b.image, b.x, b.y, b.width);
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
  for(let i = 0; i < portraits.length; i++) {
    const p = portraits[i];
    if(gameState.selectedUnitId) {
      if(p.updateAnimation(delta)) { updated = true; }
    }
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
    console.log("Header rendered.");
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
      drawText(hctx, "You lose! Bad job, loser!", margin, margin);
    } else if (enemies === 0) { // Player wins
      drawText(hctx, "You win! Good job, champ!", margin, margin);
    } else { // Display current turn
      drawText(hctx, `Turn: ${gameState.currentTurn}`, margin, margin);
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
        drawImage(hctx, b.image, b.x, b.y, b.width);
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
      drawImage(hctx, aniKnight, 0, TILE_SIZE, pSize, delta, selectedUnit.hue);
      
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
    console.log("Footer rendered.");
    clear(footer);
    drawLine(fctx, 0, 0, CANVAS_WIDTH, 0, "#555", 1);

    // BUTTONS
    for(let i = 0; i < buttons.length; i++) {
      const b = buttons[i];
      drawRect(fctx, b.x, b.y, b.width, b.height, b.color);
      drawRectStroke(fctx, b.x, b.y, b.width, b.height, b.borderColor);
      if(b.text) {
        textStyle(fctx, "28px Arial", "white", "middle", "center");
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

function drawImage(context, image, x, y, size, delta = 0, hue = 0, update = true) {
  context.filter = `hue-rotate(${hue}deg)`;
  if(image instanceof AnimatedImage) {
    if(image.direction != UP) {
      context.save();

      const centerX = x + size / 2;
      const centerY = y + size / 2;
      context.translate(centerX, centerY);

      const radians = image.direction * (Math.PI / 2);
      context.rotate(radians);
      if(update) { image.updateAnimation(delta); }
      context.drawImage(image.image, image.offset, 0, image.size, image.size, x - centerX, y - centerY, size, size);

      context.restore();
    } else {
      image.updateAnimation(delta);
      context.drawImage(image.image, image.offset, 0, image.size, image.size, x, y, size, size);
    }
  } else {
    context.drawImage(image, x, y, size, size);
  }
  context.filter = "hue-rotate(0deg)";
}