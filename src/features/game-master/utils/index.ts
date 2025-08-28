import { Player } from '@/game-core/types/Player';

/**
 * Format time in MM:SS format
 */
export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Get player status display text
 */
export const getPlayerStatus = (player: Player): string => {
  if (!player.isAlive) return 'Đã chết';
  if (player.isMarkedForDeath) return 'Sắp chết';
  if (player.isProtected) return 'Được bảo vệ';
  if (player.isSilenced) return 'Bị câm';
  return 'Còn sống';
};

/**
 * Get player status color
 */
export const getPlayerStatusColor = (player: Player): string => {
  if (!player.isAlive) return 'text-red-500';
  if (player.isMarkedForDeath) return 'text-orange-500';
  if (player.isProtected) return 'text-blue-500';
  if (player.isSilenced) return 'text-yellow-500';
  return 'text-green-500';
};

/**
 * Calculate grid layout for player display (reuse from setup)
 */
export const calculateGridLayout = (playerCount: number) => {
  if (playerCount <= 6) return { rows: 1, cols: playerCount };
  if (playerCount <= 8) return { rows: 3, cols: 3 };
  if (playerCount <= 10) return { rows: 3, cols: 4 };
  if (playerCount <= 12) return { rows: 3, cols: 5 };
  if (playerCount <= 14) return { rows: 4, cols: 5 };
  if (playerCount <= 16) return { rows: 4, cols: 6 };
  if (playerCount <= 18) return { rows: 5, cols: 6 };

  const cols = Math.ceil((playerCount + 4) / 2 / 2) + 1;
  return { rows: 5, cols };
};

/**
 * Arrange players in grid (reuse from setup)
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
    for (let c = 0; c < cols; c++) placePlayer(0, c);
  } else {
    // Top row
    for (let c = 0; c < cols; c++) placePlayer(0, c);
    // Right column
    for (let r = 1; r < rows; r++) placePlayer(r, cols - 1);
    // Bottom row
    for (let c = cols - 2; c >= 0; c--) placePlayer(rows - 1, c);
    // Left column
    for (let r = rows - 2; r > 0; r--) placePlayer(r, 0);
  }

  return grid;
};
