import { Player } from '@/game-core/types/Player';

/**
 * Calculate optimal grid layout for given number of players
 * Arranges players in a hollow rectangle pattern for better game visibility
 */
export const calculateGridLayout = (playerCount: number) => {
  if (playerCount <= 6) return { rows: 1, cols: playerCount };
  if (playerCount <= 8) return { rows: 3, cols: 3 };
  if (playerCount <= 10) return { rows: 3, cols: 4 };
  if (playerCount <= 12) return { rows: 3, cols: 5 };
  if (playerCount <= 14) return { rows: 4, cols: 5 };
  if (playerCount <= 16) return { rows: 4, cols: 6 };
  if (playerCount <= 18) return { rows: 5, cols: 6 };

  // For larger counts, maintain reasonable proportions
  const cols = Math.ceil((playerCount + 4) / 2 / 2) + 1;
  return { rows: 5, cols };
};

/**
 * Arrange players in a clockwise hollow rectangle pattern
 */
export const arrangePlayersInGrid = (
  players: Player[],
  rows: number,
  cols: number,
): (Player | null)[] => {
  const grid: (Player | null)[] = Array(rows * cols).fill(null);
  let playerIdx = 0;

  const placePlayer = (r: number, c: number) => {
    if (playerIdx < players.length && grid[r * cols + c] === null) {
      grid[r * cols + c] = players[playerIdx];
      playerIdx++;
    }
  };

  if (rows === 1) {
    // Single row layout for small groups
    for (let c = 0; c < cols; c++) placePlayer(0, c);
  } else {
    // Clockwise hollow rectangle arrangement
    // Top row, left to right
    for (let c = 0; c < cols; c++) placePlayer(0, c);
    // Right column, top to bottom
    for (let r = 1; r < rows; r++) placePlayer(r, cols - 1);
    // Bottom row, right to left
    for (let c = cols - 2; c >= 0; c--) placePlayer(rows - 1, c);
    // Left column, bottom to top
    for (let r = rows - 2; r > 0; r--) placePlayer(r, 0);
  }

  return grid;
};
