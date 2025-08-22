import { GameState } from '../types/GameState';
import { ActionData, IAction } from './IAction';

export class HealAction implements IAction {
  private targetId: string;
  private previousHealedPlayer?: string | null;

  constructor(targetId: string) {
    this.targetId = targetId;
  }

  execute(gameState: GameState): void {
    const target = gameState.getPlayerById(this.targetId);
    if (target) {
      // Save previous state for undo
      this.previousHealedPlayer = gameState.nightlyHealed;

      // Immediately heal the player
      gameState.nightlyHealed = this.targetId;
      if (target.isMarkedForDeath) {
        target.isMarkedForDeath = false;
        console.log(
          `ACTION: Player ${target.name} is immediately healed and saved from death!`,
        );
      } else {
        console.log(
          `ACTION: Player ${target.name} is being healed (protection for tonight).`,
        );
      }
    }
  }

  undo(gameState: GameState): void {
    // Restore previous healed player
    gameState.nightlyHealed = this.previousHealedPlayer || null;

    console.log(`UNDO: Heal action reversed.`);
  }

  getType(): string {
    return 'HealAction';
  }

  serialize(): ActionData {
    return {
      type: 'HealAction',
      payload: {
        targetId: this.targetId,
      },
      timestamp: Date.now(),
    };
  }
}
