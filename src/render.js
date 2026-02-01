import {
  TILE_SIZE,
  GRID_WIDTH,
  GRID_HEIGHT,
  FOOTER_HEIGHT,
  CANVAS_WIDTH,
  HEADER_HEIGHT,
} from "./constants.js";
import { AnimatedImage } from "./AnimatedImage.js";

const knightImage     = loadImage("knight_blue.png");
const goblinImage     = loadImage("goblin.png");
const portraits = [];

// Portraits
const aniKnight = new AnimatedImage("knight_animated.png", 64, 4);
portraits.push(aniKnight)
export function resetPortraits() {
  portraits.forEach( (p) => ( p.resetAnimation() ));
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
  const x = (Math.random() * TILE_SIZE * (GRID_WIDTH - 2));
  const y = (Math.random() * TILE_SIZE * (GRID_HEIGHT - 2));
  firework.setXY(x, y);
  firework.frameTime = 100;
  firework.direction = Math.random();
  firework.index = 0;
  firework.kill = false;
  fireworks.push(firework)
}
export function clearFireworks() {
  fireworks.length = 0;
}

function loadImage(file) {
  const img = new Image();
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
  ctx.drawImage(unit.team === "player" ? knightImage : goblinImage, x + 4, y + 4, TILE_SIZE - 8, TILE_SIZE - 8);

  // Draw HP bar
  drawRect(ctx, x + 8, y + TILE_SIZE - 12, TILE_SIZE - 16, 4, "red");

  const hpWidth = (unit.hp / (unit.team === "player" ? 10 : 8)) * (TILE_SIZE - 16);
  drawRect(ctx, x + 8, y + TILE_SIZE - 12, hpWidth, 4, "green");
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
  attacks.forEach( (a) => {
    if(!a.kill) { clearArray = false; }
  })
  if(clearArray) { attacks.length = 0; }

  attacks.forEach( (a) => {
    if(a.kill) { return; }
    drawAnimation(ctx, a, a.x, a.y, a.size, delta);
    if(a.index === a.length - 1) { a.kill = true; }
  })
}

let countdown = 0;
export function drawFireworks(delta) {
  if(!delta) { return; }
  countdown -= delta;
  if(countdown < 0) {
    newFirework();
    countdown = (Math.random() * 1000) + 200;
  }
  if(fireworks.length > 0) {
    let clearArray = true;
    fireworks.forEach( (f) => {
      if(!f.kill) { clearArray = false; }
    })
    if(clearArray) { fireworks.length = 0; }

    fireworks.forEach( (f) => {
      if(f.kill) { return; }
      const fSize = TILE_SIZE * 2;
      drawAnimation(ctx, f, f.x, f.y, fSize, delta);
      if(f.index === f.length - 1) { f.kill = true; }
    })
  }
}

export function drawHeader(gameState, delta) {
  // HEADER UI

  // TOP BAR
  const numLines = 2;
  const margin = 8;
  const textSize = (TILE_SIZE - (numLines + 1) * margin) / numLines;
  const portraitSize = TILE_SIZE * 2;

  textStyle(hctx, `${textSize}px Arial`, "white", "top");
  if (gameState.units.filter((u) => u.team === "player").length === 0) {
    // Enemy wins
    drawText(hctx, "You lose! Bad job, loser!", margin, margin);
  } else if (gameState.units.filter((u) => u.team === "enemy").length === 0) {
    // Player wins
    drawText(hctx, "You win! Good job, champ!", margin, margin);
  } else {
    // Display current turn
    drawText(hctx, `Turn: ${gameState.currentTurn}`, margin, margin);
  }

  let offset = 0;
  for(let i = 0; i < gameState.playerList.length; i++) {
    const player = gameState.playerList[i];
    const alive = gameState.units.find( (u) => u.name === player);

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
  }

  if (gameState.currentTurn == "player") {
    drawRect(hctx, 0, TILE_SIZE, header.width, portraitSize, "rgba(59, 130, 246, 0.15)");
  } else {
    drawRect(hctx, 0, TILE_SIZE, header.width, portraitSize, "rgba(239, 68, 68, 0.15)");
  }

  // DISPLAY SELECTED UNIT INFO
  if (gameState.selectedUnitId != null) {
    drawRect(hctx, 0, TILE_SIZE, portraitSize, portraitSize, "rgba(59, 130, 246, 0.15)");

    // Unit portrait
    const pSize = TILE_SIZE * 2;
    drawAnimation(hctx, aniKnight, 0, TILE_SIZE, pSize, delta);
    
    let color = "#3b82f6";
    if(gameState.currentTurn === "enemy") { color = "#ef4444"; }
    drawLine(hctx, portraitSize, TILE_SIZE, portraitSize, TILE_SIZE + portraitSize, color, 2);
    
    const selectedUnit = gameState.units.find(
      (u) => u.id === gameState.selectedUnitId,
    );

    const numLines = 4;
    const margin = 8;
    const textSize = (portraitSize - (numLines + 1) * margin) / numLines;
    
    textStyle(hctx, `${textSize}px Arial`, "white", "top");
    drawText(hctx, `${selectedUnit.name}`, portraitSize + margin, TILE_SIZE + margin);
    drawText(hctx, `HP: ${selectedUnit.hp}/10`, portraitSize + margin, TILE_SIZE + textSize + margin * 2);
    drawText(hctx, `\"${selectedUnit.quote}\"`, portraitSize + margin, TILE_SIZE + textSize * 2 + margin * 3);
  }

  let color = "#3b82f6";
  if(gameState.currentTurn === "enemy") { color = "#ef4444"; }
  drawLine(hctx, 0, 64, CANVAS_WIDTH, 64, color, 2);
  drawRectStroke(hctx, 0, 0, CANVAS_WIDTH, HEADER_HEIGHT, color, 4);
}

export function drawFooter(gameVersion, updatedDate, buttons) {
  // FOOTER UI

  drawLine(fctx, 0, 0, CANVAS_WIDTH, 0, "#555", 1);

  // BUTTONS
  buttons.forEach( b => {
    drawRect(fctx, b.x, b.y, b.width, b.height, b.color);
    drawRectStroke(fctx, b.x, b.y, b.width, b.height, b.borderColor);
    if(b.text) {
      textStyle(fctx, "28px Arial", "white", "middle", "center");
      drawText(fctx, b.text, b.x + b.width / 2, b.y + b.height / 2);
    }
  })

  const versionText = `Version: ${gameVersion} - Updated: ${updatedDate}`;
  textStyle(fctx, "16px Arial", "#bbb", "alphabetic", "right");
  drawText(fctx, versionText, CANVAS_WIDTH - 10, FOOTER_HEIGHT - 10);
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

/* Original working function!
function drawAnimation(context, image, x, y, size, delta) {
  image.updateAnimation(delta);
  context.drawImage(image.image, image.offset, 0, image.size, image.size, x, y, size, size);
}
*/

function drawAnimation(context, image, x, y, size, delta) {
  context.save();

  const centerX = x + size / 2;
  const centerY = y + size / 2;
  context.translate(centerX, centerY);

  const radians = image.direction * (Math.PI / 2);
  context.rotate(radians);

  image.updateAnimation(delta);
  context.drawImage(image.image, image.offset, 0, image.size, image.size, x - centerX, y - centerY, size, size);
  context.restore();
}