import { roleMap } from '@/game-core/roles';
import { IRole } from '@/game-core/roles/IRole';
import { IRuleSet } from '@/game-core/rules/IRuleSet';
import { Faction, RoleName } from '@/game-core/types/enums';
import { GameState } from '@/game-core/types/GameState';

export class StandardRuleSet implements IRuleSet {
  getNightTurnOrder(): IRole[] {
    return [
      roleMap.get(RoleName.Cupid)!(),
      roleMap.get(RoleName.Bodyguard)!(),
      roleMap.get(RoleName.Werewolf)!(),
      roleMap.get(RoleName.Witch)!(),
      roleMap.get(RoleName.Seer)!(),
    ];
  }

  getFirstNightTurnOrder(): IRole[] {
    return [
      roleMap.get(RoleName.Cupid)!(),
      roleMap.get(RoleName.Bodyguard)!(),
      roleMap.get(RoleName.Werewolf)!(),
      roleMap.get(RoleName.Witch)!(),
      roleMap.get(RoleName.Seer)!(),
      roleMap.get(RoleName.Hunter)!(),
    ];
  }

  checkWinConditions(gameState: GameState): Faction | null {
    const livingPlayers = gameState.getLivingPlayers();
    if (livingPlayers.length === 0) {
      return null; // No one wins if everyone is dead
    }

    // Count living players by faction
    const livingWerewolves = livingPlayers.filter(
      (p) => p.role?.faction === Faction.Werewolf,
    );
    const livingVillagers = livingPlayers.filter(
      (p) => p.role?.faction === Faction.Villager,
    );

    // Check for lovers (players that have lover property set)
    const livingLovers = livingPlayers.filter((p) => p.lover !== null);

    // 1. Check for Lovers win condition first (highest priority)
    // If only the two lovers are alive, they win
    if (livingLovers.length === 2 && livingPlayers.length === 2) {
      return Faction.Lovers;
    }

    // 2. Check for Werewolf win condition
    // Werewolves win if they equal or outnumber villagers (excluding lovers)
    const nonLoverWerewolves = livingWerewolves.filter((p) => p.lover === null);
    const nonLoverVillagers = livingVillagers.filter((p) => p.lover === null);

    if (
      nonLoverWerewolves.length > nonLoverVillagers.length &&
      nonLoverWerewolves.length > 0
    ) {
      return Faction.Werewolf;
    }

    // 3. Check for Villager win condition
    // Villagers win if all werewolves are eliminated
    if (livingWerewolves.length === 0) {
      return Faction.Villager;
    }

    // 4. If no faction has won, the game continues
    return null;
  }

  canWerewolfKillOnFirstNight(): boolean {
    return true;
  }
}
