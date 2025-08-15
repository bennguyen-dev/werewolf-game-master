import { Faction, RoleName } from "@/game-core/types/enums";
import { IRole } from "../IRole";
import { GameEvent } from "@/game-core/types/GameEvent";
import { GameState } from "@/game-core/types/GameState";
import { Player } from "@/game-core/types/Player";
import { IAction } from "@/game-core/actions/IAction";

export class Villager implements IRole {
    readonly name = RoleName.Villager;
    readonly faction = Faction.Villager;
    readonly description = 'Bạn là một Dân làng vô tội, mục tiêu của bạn là treo cổ hết Sói.';

    handleGameEvent(event: GameEvent, gameState: GameState, self: Player): IAction[] | null {
        // Villagers have no special actions to react to events.
        return null;
    }

    getUiContext(gameState: GameState, self: Player): any {
        // Villagers have no special UI context.
        return {};
    }
}
