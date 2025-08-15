import { Faction, RoleName } from '@/game-core/types/enums';
import { GameState } from '@/game-core/types/GameState';

export interface IRuleSet {
  // Trả về thứ tự các role thức dậy vào ban đêm
  getNightTurnOrder(): RoleName[];

  // Kiểm tra điều kiện thắng
  checkWinConditions(gameState: GameState): Faction | 'LOVERS' | null;

  // Các luật lệ cụ thể
  canKillOnFirstNight(): boolean;
  canWitchUsePotionsOnSelf(): boolean;
  canWitchHealAndPoisonSameNight(): boolean;
  shouldRevealRoleOnDeath(): boolean;
  canBodyguardProtectSamePerson(): boolean;
  canVoteWithoutMajority(): boolean;
}
