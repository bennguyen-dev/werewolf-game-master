import { IAction } from "./IAction";
import { GameState } from "../types/GameState";

export class PoisonAction implements IAction {
    constructor(private targetId: string) {}

    execute(gameState: GameState): void {
        const target = gameState.getPlayerById(this.targetId);
        if (target) {
            target.isMarkedForDeath = true;
            console.log(`ACTION: Player ${target.name} is marked for death by poison.`);
        }
    }
}
