import {
  TILE_SIZE,
  GRID_WIDTH,
  GRID_HEIGHT,
  FOOTER_HEIGHT,
  CANVAS_WIDTH,
} from "./constants.js";

const knightImage     = loadImage("knight_blue.png");
const knightFaceImage = loadImage("kight_blue_face.png");
const goblinImage     = loadImage("goblin.png");
const attackImage     = loadImage("attack.png");

function loadImage(file) {
  const img = new Image();
  img.src = `./assets/${file}`;
  return img;
}

let hctx, ctx, fctx, octx;

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

export function drawMoveTiles(tiles, acted) {
  for (const tile of tiles) {
    drawRect(ctx, tile.x * TILE_SIZE, tile.y * TILE_SIZE, TILE_SIZE, TILE_SIZE, acted ? "rgba(59, 130, 246, 0.1)" : "rgba(59, 130, 246, 0.25)");
  }
}

export function drawAttackTiles(tiles, acted) {
  for (const tile of tiles) {
    drawRect(ctx, tile.x * TILE_SIZE, tile.y * TILE_SIZE, TILE_SIZE, TILE_SIZE, acted ? "rgba(246, 59, 59, 0.1)" : "rgba(246, 59, 59, 0.25)");
  }
}

export function drawHeader(gameState) {
  // HEADER UI

  // DISPLAY SELECTED UNIT INFO
  if (gameState.selectedUnitId != null) {
    const size = TILE_SIZE * 2
    drawRect(hctx, 0, TILE_SIZE, size, size, "rgba(59, 130, 246, 0.15)");
    drawLine(hctx, size, TILE_SIZE, size, TILE_SIZE + size, "#a2cbff", 1);
    
    const selectedUnit = gameState.units.find(
      (u) => u.id === gameState.selectedUnitId,
    );

    // Unit portrait
    hctx.drawImage(knightFaceImage, 0, 64, size, size);

    const numLines = 4;
    const margin = 10;
    const textSize = (size - numLines * margin) / numLines;
    
    textStyle(hctx, `${textSize}px Arial`, "white", "top");
    drawText(hctx, `${selectedUnit.name}`, size + margin, TILE_SIZE + margin);
    drawText(hctx, `HP: ${selectedUnit.hp}/10`, size + margin, TILE_SIZE + textSize + margin * 2);
    drawText(hctx, `\"${selectedUnit.quote}\"`, size + margin, TILE_SIZE + textSize * 2 + margin * 3);
  }
  // Horizontal line always visible
  drawLine(hctx, 0, 64, 512, 64, "#a2cbff", 1);

  textStyle(hctx, "32px Arial");
  if (gameState.units.filter((u) => u.team === "player").length === 0) {
    // Enemy wins
    drawText(hctx, "You lose! Bad job, loser!", 10, 32);
  } else if (gameState.units.filter((u) => u.team === "enemy").length === 0) {
    // Player wins
    drawText(hctx, "You win! Good job, champ!", 10, 32);
  } else {
    // Display current turn
    drawText(hctx, `Turn: ${gameState.currentTurn}`, 10, 32);
  }

  if (gameState.currentTurn == "player") {
    drawRect(hctx, 0, 0, header.width, header.height, "rgba(59, 130, 246, 0.15)");
    drawRectStroke(hctx, 0, 0, header.width, header.height, "#3b82f6");
  } else {
    drawRect(hctx, 0, 0, header.width, header.height, "rgba(239, 68, 68, 0.15)");
    drawRectStroke(hctx, 0, 0, header.width, header.height, "#ef4444");
  }
}

export function drawFooter(gameVersion, updatedDate, buttons) {
  // FOOTER UI

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