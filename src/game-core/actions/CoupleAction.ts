import {IAction} from "@/game-core/actions/IAction";
import {GameState} from "@/game-core/types/GameState";
import {LoverRoleDecorator} from "@/game-core/roles/decorators/LoverRoleDecorator";

export class CoupleAction implements IAction {
    constructor(private player1Id: string, private player2Id: string) {}

    execute(gameState: GameState): void {
        const player1 = gameState.getPlayerById(this.player1Id);
        const player2 = gameState.getPlayerById(this.player2Id);
        if (player1 && player2) {
            player1.lover = player2;
            player2.lover = player1;

            // If lovers are from different factions, they become their own faction.
            if (player1.role.faction !== player2.role.faction) {
                // Decorate the original roles instead of mutating them.
                player1.role = new LoverRoleDecorator(player1.role);
                player2.role = new LoverRoleDecorator(player2.role);
            }
            
            console.log(`ACTION: ${player1.name} and ${player2.name} are now lovers.`);
        }
    }
}