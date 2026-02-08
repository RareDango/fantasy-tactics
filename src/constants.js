export const GAME_VERSION = "0.4.7";
export const DATE_UPDATED = "Sun, Feb 8, 2026";

export const MAX_UNITS = 64; // hangs if players set above 21. no idea why -> It was because that's how many quotes there were to pick from
export const DEFAULT_NUM_PLAYERS = 5;
export const DEFAULT_NUM_ENEMIES = 10;
export const MAX_FIREWORKS = 8;

export const TILE_SIZE   = 64;
export const GRID_WIDTH  = 8;
export const GRID_HEIGHT = 8;

export const HEADER_HEIGHT = TILE_SIZE * 3;
export const CANVAS_WIDTH = TILE_SIZE * GRID_WIDTH;
export const CANVAS_HEIGHT = TILE_SIZE * GRID_HEIGHT;
export const FOOTER_HEIGHT = TILE_SIZE * 3;

export const CONTAINER_WIDTH = CANVAS_WIDTH;
export const CONTAINER_HEIGHT = HEADER_HEIGHT + CANVAS_HEIGHT + FOOTER_HEIGHT;

export const UP    = 0;
export const RIGHT = 1;
export const DOWN  = 2;
export const LEFT  = 3;

// TAB IDs
export const TAB_UNITS = 0;
export const TAB_VISUALS = 1;

// BUTTON IDs
export const BUTTON_RESET    = 10;
export const BUTTON_END_TURN = 11;

export const BUTTON_SETTINGS = 12;

// Settings
export const BUTTON_CLOSE_SETTINGS = 99;

// Units Tab
export const BUTTON_ACCEPT   = 13;
export const BUTTON_CANCEL   = 14;
export const BUTTON_SET_TO_DEFAULT = 15;

export const BUTTON_ENEMIES_UP   = 16;
export const BUTTON_ENEMIES_DOWN = 17;
export const BUTTON_PLAYERS_UP   = 18;
export const BUTTON_PLAYERS_DOWN = 19;

// Visuals Tab
export const BUTTON_WHITE_GRID = 20;



export const NAMES = [
    "Josh", "Maxwell", "Krista", "Mo",
    "나연", "정연", "사나", "모모", "지효", "미나", "다현", "채영", "쯔위",
    "소연", "우기", "미연", "슈화", "민니", "수진",
    "솔라", "문별", "휘인", "화사",
    "Charlie", "Pip", "Leafy", "Jolene",
    "Montana", "Jovi", "Puddle", "Veythra", "Ze'eil", "Torq"
]

export const QUOTES = [
    "You can do it!",
    "I believe in you!",
    "I'm sleeeepy...",
    "How did I get here?",
    "Those are some ugly-ass goblins.",
    "Those are some ugly ass-goblins.",
    "Help! I'm stuck in this game!",
    "Let's do this!",
    "I'm hungry...",
    "안녕하세요!",
    "Wheeeee! This is fun!",
    "Red five diamonds in my bag...",
    "I am the top super lady!",
    "I'm twerking on the runway!",
    "Cheer up, baby!",
    "My boob and booty is hot!",
    "Stick 'em with the pointy end!",
    "These guys suck!",
    "Goblins? More like butt-lins! Gottem.",
    "Hey, good-lookin! ;)",
    "Does this colour look good on me?"
]