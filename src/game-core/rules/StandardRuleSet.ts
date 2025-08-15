import {IRuleSet} from "@/game-core/rules/IRuleSet";
import {Faction, RoleName} from "@/game-core/types/enums";
import {GameState} from "@/game-core/types/GameState";
import {Player} from "@/game-core/types/Player";

export class StandardRuleSet implements IRuleSet {
    getNightTurnOrder(): RoleName[] {
        return [
            RoleName.Cupid,
            RoleName.Bodyguard,
            RoleName.Werewolf,
            RoleName.Witch,
            RoleName.Seer,
        ];
    }

    checkWinConditions(gameState: GameState): Faction | 'LOVERS' | null {
        const livingPlayers = gameState.getLivingPlayers();
        if (livingPlayers.length === 0) {
            return null; // No one wins if everyone is dead
        }

        // Count living players by faction
        const livingWerewolves = livingPlayers.filter(p => p.role.faction === Faction.Werewolf);
        const livingVillagers = livingPlayers.filter(p => p.role.faction === Faction.Villager);
        
        // Check for lovers (players that have lover property set)
        const livingLovers = livingPlayers.filter(p => p.lover !== null);

        // 1. Check for Lovers win condition first (highest priority)
        // If only the two lovers are alive, they win
        if (livingLovers.length === 2 && livingPlayers.length === 2) {
            return 'LOVERS';
        }

        // 2. Check for Werewolf win condition
        // Werewolves win if they equal or outnumber villagers (excluding lovers)
        const nonLoverWerewolves = livingWerewolves.filter(p => p.lover === null);
        const nonLoverVillagers = livingVillagers.filter(p => p.lover === null);
        
        if (nonLoverWerewolves.length >= nonLoverVillagers.length && nonLoverWerewolves.length > 0) {
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

    canKillOnFirstNight(): boolean {
        return false; // Standard: Werewolves cannot kill on first night
    }

    canWitchUsePotionsOnSelf(): boolean {
        return true; // Standard: Witch can use potions on herself
    }

    canWitchHealAndPoisonSameNight(): boolean {
        return true; // Standard: Witch can use both potions in same night
    }

    shouldRevealRoleOnDeath(): boolean {
        return true; // Standard: Reveal role when player dies
    }

    canBodyguardProtectSamePerson(): boolean {
        return false; // Standard: Cannot protect same person consecutive nights
    }

    canVoteWithoutMajority(): boolean {
        return false; // Standard: Need majority to execute, ties result in no execution
    }
}