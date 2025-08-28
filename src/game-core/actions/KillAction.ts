import { GameState } from '../types/GameState';
import { ActionData, IAction } from './IAction';

export class KillAction implements IAction {
  private targetId: string;
  private killerId: string;
  private previousState?: { isMarkedForDeath: boolean };

  constructor(targetId: string, killerId: string) {
    this.targetId = targetId;
    this.killerId = killerId;
  }

  execute(gameState: GameState): void {
    const target = gameState.getPlayerById(this.targetId);
    if (target && target.isAlive) {
      // Save previous state for undo
      this.previousState = {
        isMarkedForDeath: target.isMarkedForDeath,
      };

      // Check if target is protected
      if (target.isProtected) {
        console.log(
          `ACTION: Player ${target.name} was attacked but protected!`,
        );
        gameState.nightlyKills.set(this.targetId, this.killerId);
        return;
      }

      // Mark for death (will die at end of night)
      target.isMarkedForDeath = true;
      gameState.nightlyKills.set(this.targetId, this.killerId);

      console.log(
        `ACTION: Player ${target.name} is marked for death by ${this.killerId}.`,
      );
    }
  }

  undo(gameState: GameState): void {
    if (!this.previousState) return;

    const target = gameState.getPlayerById(this.targetId);
    if (target) {
      target.isMarkedForDeath = this.previousState.isMarkedForDeath;
      gameState.nightlyKills.delete(this.targetId);

      console.log(`UNDO: Unmarked ${target.name} for death.`);
    }
  }

  getType(): string {
    return 'KillAction';
  }

  serialize(): ActionData {
    return {
      type: 'KillAction',
      payload: {
        targetId: this.targetId,
        killerId: this.killerId,
      },
      timestamp: Date.now(),
    };
  }
}
