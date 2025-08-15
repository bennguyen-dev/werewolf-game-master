import { Faction, RoleName } from "@/game-core/types/enums";
import { Player } from "@/game-core/types/Player";
import { GameState } from "@/game-core/types/GameState";
import { IAction } from "@/game-core/actions/IAction";
import { HealAction } from "@/game-core/actions/HealAction";
import { PoisonAction } from "@/game-core/actions/PoisonAction";
import { GameEvent } from "@/game-core/types/GameEvent";
import { IRole } from "../IRole";

export class Witch implements IRole {
    readonly name = RoleName.Witch;
    readonly faction = Faction.Villager;
    readonly description = 'Bạn có một bình cứu và một bình độc. Mỗi đêm bạn được biết ai bị Sói cắn và có thể chọn cứu người đó, hoặc giết một người khác.';

    private hasHealPotion = true;
    private hasPoisonPotion = true;

    handleGameEvent(event: GameEvent, gameState: GameState, self: Player): IAction[] | null {
        // Witch chỉ hành động khi đêm bắt đầu
        return null;
    }

    createAction(self: Player, payload?: unknown): IAction[] | null {
        if (typeof payload !== 'object' || payload === null) return null;

        const { healTarget, poisonTarget } = payload as { healTarget?: string; poisonTarget?: string };
        const actions: IAction[] = [];

        if (healTarget && this.hasHealPotion) {
            this.hasHealPotion = false;
            actions.push(new HealAction(healTarget));
        }

        if (poisonTarget && this.hasPoisonPotion) {
            this.hasPoisonPotion = false;
            actions.push(new PoisonAction(poisonTarget));
        }

        return actions.length > 0 ? actions : null;
    }

    getUiContext(gameState: GameState, self: Player): any {
        const killedByWerewolfId = Array.from(gameState.nightlyKills.keys())[0];
        const killedPlayer = killedByWerewolfId ? gameState.getPlayerById(killedByWerewolfId) : null;

        return {
            canHeal: this.hasHealPotion && killedPlayer,
            healTarget: killedPlayer ? { id: killedPlayer.id, name: killedPlayer.name } : null,
            canPoison: this.hasPoisonPotion,
            poisonTargets: gameState.getLivingPlayers().filter(p => p.id !== self.id)
                .map(p => ({ id: p.id, name: p.name }))
        };
    }
}
