import { GameState } from '../types/GameState';
import { ActionData, IAction } from './IAction';

export class ShootAction implements IAction {
  private targetId: string;
  private shooterId: string;
  private previousState?: { isAlive: boolean };

  constructor(targetId: string, shooterId: string) {
    this.targetId = targetId;
    this.shooterId = shooterId;
  }

  execute(gameState: GameState): void {
    const target = gameState.getPlayerById(this.targetId);
    if (target && target.isAlive) {
      this.previousState = { isAlive: target.isAlive };
      // Hunter's shot is immediate and definitive.
      target.isAlive = false;
    }
  }

  undo(gameState: GameState): void {
    if (!this.previousState) return;
    const target = gameState.getPlayerById(this.targetId);
    if (target) {
      target.isAlive = this.previousState.isAlive;
    }
  }

  getType(): string {
    return 'ShootAction';
  }

  serialize(): ActionData {
    return {
      type: 'ShootAction',
      payload: {
        targetId: this.targetId,
        shooterId: this.shooterId,
      },
      timestamp: Date.now(),
    };
  }
}
