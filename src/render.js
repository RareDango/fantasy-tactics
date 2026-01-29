import { TILE_SIZE, GRID_WIDTH, GRID_HEIGHT } from "./constants.js";

const knightImage = new Image();
knightImage.src = './assets/knight_blue.png';

const goblinImage = new Image();
goblinImage.src = './assets/goblin.png';

export function drawGrid(ctx) {
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

export function drawUnit(ctx, unit, isSelected) {
  const x = unit.x * TILE_SIZE;
  const y = unit.y * TILE_SIZE;

  // Draw colored rectangle... replace this.

  //ctx.fillStyle = unit.team === "player" ? "#3b82f6" : "#ef4444";
  //ctx.fillRect(x + 8, y + 8, TILE_SIZE - 16, TILE_SIZE - 16);

  // Can we draw images?
  if( unit.team === "player") {
    ctx.drawImage(
      knightImage,
      x + 4,            // small inset
      y + 4,
      TILE_SIZE - 8,
      TILE_SIZE - 8
    );
  } else {
    ctx.drawImage(
      goblinImage,
      x + 4,            // small inset
      y + 4,
      TILE_SIZE - 8,
      TILE_SIZE - 8
    );
  }

  if (isSelected) {
    ctx.strokeStyle = "#facc15";
    ctx.lineWidth = 3;
    ctx.strokeRect(x + 6, y + 6, TILE_SIZE - 12, TILE_SIZE - 12);
  } else if (unit.team == "player" && !unit.hasActed) {
    ctx.strokeStyle = "#a08312ff"; // colour to mark player units who have not moved yet
    ctx.lineWidth = 3;
    ctx.strokeRect(x + 6, y + 6, TILE_SIZE - 12, TILE_SIZE - 12);
  }

  // Draw HP bar
  ctx.fillStyle = "red";
  ctx.fillRect(x + 8, y + TILE_SIZE - 12, TILE_SIZE - 16, 4);

  ctx.fillStyle = "green";
  const hpWidth =
    (unit.hp / (unit.team === "player" ? 10 : 8)) * (TILE_SIZE - 16);
  ctx.fillRect(x + 8, y + TILE_SIZE - 12, hpWidth, 4);
}

export function drawMoveTiles(ctx, tiles) {
  ctx.fillStyle = "rgba(59, 130, 246, 0.25)";

  for (const tile of tiles) {
    ctx.fillRect(tile.x * TILE_SIZE, tile.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
}

export function drawHeader() {
  return;
}

export function drawFooter() {
  return;
}

