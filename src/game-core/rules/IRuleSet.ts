import { IRole } from '@/game-core/roles/IRole';
import { Faction } from '@/game-core/types/enums';
import { GameState } from '@/game-core/types/GameState';

export interface IRuleSet {
  // Trả về thứ tự các role thức dậy vào ban đêm
  getNightTurnOrder(): IRole[];

  // Trả về thứ tự các role thức dậy vào đêm đầu tiên
  getFirstNightTurnOrder(): IRole[];

  // Kiểm tra điều kiện thắng
  checkWinConditions(gameState: GameState): Faction | null;

  // Các luật lệ cụ thể
  canWerewolfKillOnFirstNight(): boolean;
}
