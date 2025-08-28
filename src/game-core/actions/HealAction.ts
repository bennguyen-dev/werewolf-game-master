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

      // Heal the player (remove death mark)
      gameState.nightlyHealed = this.targetId;
      if (target.isMarkedForDeath) {
        target.isMarkedForDeath = false;
      }
    }
  }

  undo(gameState: GameState): void {
    // Restore previous healed player
    gameState.nightlyHealed = this.previousHealedPlayer || null;
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
