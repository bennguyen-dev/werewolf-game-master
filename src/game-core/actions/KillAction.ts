import { GameState } from '../types/GameState';
import { IAction } from './IAction';

export class KillAction implements IAction {
  constructor(
    private targetId: string,
    private killerId: string,
  ) {}

  execute(gameState: GameState): void {
    const target = gameState.getPlayerById(this.targetId);
    if (target) {
      target.isMarkedForDeath = true;
      // Optional: log who marked whom for more detailed history
      console.log(
        `ACTION: Player ${target.name} is marked for death by ${this.killerId}.`,
      );
    }
  }
}
