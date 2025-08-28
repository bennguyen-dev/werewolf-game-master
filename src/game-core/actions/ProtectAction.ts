import { ActionData, IAction } from '@/game-core/actions/IAction';
import { GameState } from '@/game-core/types/GameState';

export class ProtectAction implements IAction {
  private targetId: string;
  private previousProtectedState?: boolean;

  constructor(targetId: string) {
    this.targetId = targetId;
  }

  execute(gameState: GameState): void {
    const target = gameState.getPlayerById(this.targetId);
    if (target) {
      // Save previous state for undo
      this.previousProtectedState = target.isProtected;

      target.isProtected = true;
    }
  }

  undo(gameState: GameState): void {
    const target = gameState.getPlayerById(this.targetId);
    if (target && this.previousProtectedState !== undefined) {
      // Restore previous protection state
      target.isProtected = this.previousProtectedState;
    }
  }

  getType(): string {
    return 'ProtectAction';
  }

  serialize(): ActionData {
    return {
      type: 'ProtectAction',
      payload: {
        targetId: this.targetId,
      },
      timestamp: Date.now(),
    };
  }
}
