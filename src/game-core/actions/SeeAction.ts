import { IAction } from "./IAction";
import { GameState } from "../types/GameState";

export class SeeAction implements IAction {
    constructor(private targetId: string, private seerId: string) {}

    execute(gameState: GameState): void {
        const target = gameState.getPlayerById(this.targetId);
        const seer = gameState.getPlayerById(this.seerId);

        if (target && seer) {
            const targetFaction = target.role.faction;
            // Write the result to the game state so the engine can retrieve it for the UI
            gameState.lastSeerResult = {
                targetId: target.id,
                targetName: target.name,
                revealedFaction: targetFaction
            };
            console.log(`ACTION: Seer ${seer.name} saw ${target.name}. Result stored in gameState.`);
        }
    }
}
