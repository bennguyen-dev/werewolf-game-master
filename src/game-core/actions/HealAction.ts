import { IAction } from "./IAction";
import { GameState } from "../types/GameState";

export class HealAction implements IAction {
    constructor(private targetId: string) {}

    execute(gameState: GameState): void {
        const target = gameState.getPlayerById(this.targetId);
        if (target) {
            gameState.nightlyHealed = this.targetId;
            console.log(`ACTION: Player ${target.name} is being healed.`);
        }
    }
}
