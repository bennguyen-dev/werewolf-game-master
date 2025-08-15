import { IAction } from '@/game-core/actions/IAction';
import { GameState } from '@/game-core/types/GameState';

export class ProtectAction implements IAction {
  constructor(private targetId: string) {}

  execute(gameState: GameState): void {
    const target = gameState.getPlayerById(this.targetId);
    if (target) {
      target.isProtected = true;
      console.log(`ACTION: Player ${target.name} is being protected.`);
    }
  }
}
