import { GameState } from '../types/GameState';
import { ActionData, IAction } from './IAction';

export class PoisonAction implements IAction {
  private targetId: string;
  private previousMarkedForDeath?: boolean;

  constructor(targetId: string) {
    this.targetId = targetId;
  }

  execute(gameState: GameState): void {
    const target = gameState.getPlayerById(this.targetId);
    if (target && target.isAlive) {
      // Save previous state for undo
      this.previousMarkedForDeath = target.isMarkedForDeath;

      // Mark for death by poison
      target.isMarkedForDeath = true;
      gameState.nightlyPoisoned = this.targetId;

      console.log(
        `ACTION: Player ${target.name} is marked for death by poison.`,
      );
    }
  }

  undo(gameState: GameState): void {
    const target = gameState.getPlayerById(this.targetId);
    if (target && this.previousMarkedForDeath !== undefined) {
      // Restore previous marked for death state
      target.isMarkedForDeath = this.previousMarkedForDeath;
      gameState.nightlyPoisoned = null;

      console.log(`UNDO: Poison removed from ${target.name}.`);
    }
  }

  getType(): string {
    return 'PoisonAction';
  }

  serialize(): ActionData {
    return {
      type: 'PoisonAction',
      payload: {
        targetId: this.targetId,
      },
      timestamp: Date.now(),
    };
  }
}
