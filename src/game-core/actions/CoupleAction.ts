import { ActionData, IAction } from '@/game-core/actions/IAction';
import { LoverRoleDecorator } from '@/game-core/roles/decorators/LoverRoleDecorator';
import { GameState } from '@/game-core/types/GameState';
import { Player } from '@/game-core/types/Player';

export class CoupleAction implements IAction {
  private player1Id: string;
  private player2Id: string;
  private previousLover1?: Player | null;
  private previousLover2?: Player | null;
  private previousRole1?: any;
  private previousRole2?: any;

  constructor(player1Id: string, player2Id: string) {
    this.player1Id = player1Id;
    this.player2Id = player2Id;
  }

  execute(gameState: GameState): void {
    const player1 = gameState.getPlayerById(this.player1Id);
    const player2 = gameState.getPlayerById(this.player2Id);
    if (player1 && player2) {
      // Save previous state for undo
      this.previousLover1 = player1.lover;
      this.previousLover2 = player2.lover;
      this.previousRole1 = player1.role;
      this.previousRole2 = player2.role;

      player1.lover = player2;
      player2.lover = player1;

      // If lovers are from different factions, they become their own faction.
      if (
        player1.role &&
        player2.role &&
        player1.role.faction !== player2.role.faction
      ) {
        // Decorate the original roles instead of mutating them.
        player1.role = new LoverRoleDecorator(player1.role);
        player2.role = new LoverRoleDecorator(player2.role);
      }

      console.log(
        `ACTION: ${player1.name} and ${player2.name} are now lovers.`,
      );
    }
  }

  undo(gameState: GameState): void {
    const player1 = gameState.getPlayerById(this.player1Id);
    const player2 = gameState.getPlayerById(this.player2Id);

    if (player1 && player2) {
      // Restore previous lover relationships
      player1.lover = this.previousLover1 || null;
      player2.lover = this.previousLover2 || null;

      // Restore previous roles (remove decorator if applied)
      if (this.previousRole1) player1.role = this.previousRole1;
      if (this.previousRole2) player2.role = this.previousRole2;

      console.log(
        `UNDO: Lover relationship between ${player1.name} and ${player2.name} removed.`,
      );
    }
  }

  getType(): string {
    return 'CoupleAction';
  }

  serialize(): ActionData {
    return {
      type: 'CoupleAction',
      payload: {
        player1Id: this.player1Id,
        player2Id: this.player2Id,
      },
      timestamp: Date.now(),
    };
  }
}
