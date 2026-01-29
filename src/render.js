import { TILE_SIZE, GRID_WIDTH, GRID_HEIGHT } from "./constants.js";

const knightImage = new Image();
knightImage.src = "./assets/knight_blue.png";
const knightFaceImage = new Image();
knightFaceImage.src = "./assets/kight_blue_face.png";
const goblinImage = new Image();
goblinImage.src = "./assets/goblin.png";
const attackImage = new Image();
attackImage.src = "./assets/attack.png";

let header, canvas, footer;
export function getCanvas() {
  return canvas;
}
let hctx, ctx, fctx;

export function clear() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

export function setupRenderer(h, c, f) {
  header = h;
  canvas = c;
  footer = f;

  hctx = header.getContext("2d");
  ctx = canvas.getContext("2d");
  fctx = footer.getContext("2d");
}

export function drawGrid() {
  ctx.strokeStyle = "#555";

  for (let x = 0; x <= GRID_WIDTH; x++) {
    ctx.beginPath();
    ctx.moveTo(x * TILE_SIZE, 0);
    ctx.lineTo(x * TILE_SIZE, GRID_HEIGHT * TILE_SIZE);
    ctx.stroke();
  }

  for (let y = 0; y <= GRID_HEIGHT; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * TILE_SIZE);
    ctx.lineTo(GRID_WIDTH * TILE_SIZE, y * TILE_SIZE);
    ctx.stroke();
  }
}

export function drawUnit(unit, isSelected) {
  const x = unit.x * TILE_SIZE;
  const y = unit.y * TILE_SIZE;

  if (isSelected) {
    if (!unit.hasActed) {
      ctx.fillStyle = "rgba(250, 204, 21, 0.75)"; // #facc15
    } else {
      ctx.fillStyle = "rgba(250, 204, 21, 0.25)";
    }
    ctx.fillRect(x + 6, y + 6, TILE_SIZE - 12, TILE_SIZE - 12);
  } else if (unit.team == "player" && !unit.hasActed) {
    ctx.strokeStyle = "rgba(250, 204, 21, 0.5)"; // colour to mark player units who have not moved yet
    ctx.strokeRect(x + 6, y + 6, TILE_SIZE - 12, TILE_SIZE - 12);
  }

  // Can we draw images?
  if (unit.team === "player") {
    ctx.drawImage(
      knightImage,
      x + 4, // small inset
      y + 4,
      TILE_SIZE - 8,
      TILE_SIZE - 8,
    );
  } else {
    if (unit.current) {
      ctx.fillStyle = "rgba(239, 68, 68, 0.25)";
      ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    }
    ctx.drawImage(
      goblinImage,
      x + 4, // small inset
      y + 4,
      TILE_SIZE - 8,
      TILE_SIZE - 8,
    );
  }

  // Draw HP bar
  ctx.fillStyle = "red";
  ctx.fillRect(x + 8, y + TILE_SIZE - 12, TILE_SIZE - 16, 4);

  ctx.fillStyle = "green";
  const hpWidth =
    (unit.hp / (unit.team === "player" ? 10 : 8)) * (TILE_SIZE - 16);
  ctx.fillRect(x + 8, y + TILE_SIZE - 12, hpWidth, 4);
}

export function drawMoveTiles(tiles, acted) {
  if (!acted) {
    ctx.fillStyle = "rgba(59, 130, 246, 0.25)";
  } else {
    ctx.fillStyle = "rgba(59, 130, 246, 0.1)";
  }
  for (const tile of tiles) {
    ctx.fillRect(tile.x * TILE_SIZE, tile.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
}

export function drawAttackTiles(tiles, acted) {
  if (!acted) {
    ctx.fillStyle = "rgba(246, 59, 59, 0.25)";
  } else {
    ctx.fillStyle = "rgba(246, 59, 59, 0.1)";
  }
  for (const tile of tiles) {
    ctx.fillRect(tile.x * TILE_SIZE, tile.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
}

export function drawHeader(gameState) {
  // HEADER UI
  hctx.clearRect(0, 0, header.width, header.height);

  // DISPLAY SELECTED UNIT INFO
  //let selectedUnit = null;
  if (gameState.selectedUnitId != null) {
    hctx.fillStyle = "rgba(59, 130, 246, 0.15)";
    hctx.fillRect(0, 64, 64, 64);
    
    const selectedUnit = gameState.units.find(
      (u) => u.id === gameState.selectedUnitId,
    );

    hctx.drawImage(
      knightFaceImage,
      0,
      64,
      TILE_SIZE,
      TILE_SIZE,
    );

    // Bounding box lines
    hctx.strokeStyle = "#a2cbff";
    hctx.lineWidth = 1;
    
    // Vertical line
    hctx.beginPath(); hctx.moveTo(64, 64); hctx.lineTo(64, 128); hctx.stroke();

    hctx.fillStyle = "white";
    hctx.font = "24px Arial";
    hctx.textBaseline = "middle";
    hctx.fillText(`${selectedUnit.name}`, 69, 64+16);
    hctx.fillText(`HP: ${selectedUnit.hp}/10`, 69, 64+32+16);
  }
  // Horizontal line always visible
  hctx.strokeStyle = "#a2cbff";
  hctx.lineWidth = 1;
  hctx.beginPath(); hctx.moveTo(0, 64); hctx.lineTo(512, 64); hctx.stroke();

  // Display current turn
  hctx.fillStyle = "white";
  hctx.font = "32px Arial";
  hctx.textBaseline = "middle";
  hctx.fillText(`Turn: ${gameState.currentTurn}`, 10, 32);

  if (gameState.currentTurn == "player") {
    hctx.fillStyle = "rgba(59, 130, 246, 0.15)";
    hctx.fillRect(0, 0, header.width, header.height);
    hctx.strokeStyle = "#3b82f6";
    hctx.lineWidth = 3;
    hctx.strokeRect(0, 0, header.width, header.height);
  } else {
    hctx.fillStyle = "rgba(239, 68, 68, 0.15)";
    hctx.fillRect(0, 0, header.width, header.height);
    hctx.strokeStyle = "#ef4444";
    hctx.lineWidth = 3;
    hctx.strokeRect(0, 0, header.width, header.height);
  }
}

export function drawFooter(gameVersion, updatedDate) {
  // FOOTER UI
  fctx.clearRect(0, 0, footer.width, footer.height);

  // END TURN button
  // 64, 32, 160, 64
  fctx.fillStyle = "#9c4242";
  fctx.fillRect(64, 32, 160, 64);
  fctx.strokeStyle = "#adadad";
  fctx.lineWidth = 3;
  fctx.strokeRect(64, 32, 160, 64);

  fctx.fillStyle = "white";
  fctx.font = "28px Arial";
  fctx.textBaseline = "middle";
  fctx.textAlign = "center"
  fctx.fillText(`END TURN`, 64+80, 64);


  // RESET button
  // 288, 32, 160, 64
  fctx.fillStyle = "#9c4242";
  fctx.fillRect(288, 32, 160, 64);
  fctx.strokeStyle = "#adadad";
  fctx.lineWidth = 3;
  fctx.strokeRect(288, 32, 160, 64);

  fctx.fillStyle = "white";
  fctx.font = "28px Arial";
  fctx.textBaseline = "middle";
  fctx.textAlign = "center";
  fctx.fillText(`RESET`, 288+80, 64);

  fctx.font = "16px Arial";
  fctx.textBaseline = "alphabetic";
  fctx.textAlign = "right";
  fctx.fillStyle = "#bbbbbb";
  fctx.fillText(`Version: ${gameVersion} - Updated: ${updatedDate}`, 502, 118);
  fctx.textAlign = "start";
}
