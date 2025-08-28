import { GameState } from '../types/GameState';
import { ActionData, IAction } from './IAction';

export class SeeAction implements IAction {
  private targetId: string;
  private seerId: string;
  private previousSeerResult?: any;

  constructor(targetId: string, seerId: string) {
    this.targetId = targetId;
    this.seerId = seerId;
  }

  execute(gameState: GameState): void {
    const target = gameState.getPlayerById(this.targetId);
    const seer = gameState.getPlayerById(this.seerId);

    if (target && seer && target.role) {
      // Save previous state for undo
      this.previousSeerResult = gameState.lastSeerResult;

      const targetFaction = target.role.faction;
      // Write the result to the game state so the engine can retrieve it for the UI
      gameState.lastSeerResult = {
        targetId: target.id,
        targetName: target.name,
        revealedFaction: targetFaction,
      };
    }
  }

  undo(gameState: GameState): void {
    // Restore previous seer result
    gameState.lastSeerResult = this.previousSeerResult || null;
  }

  getType(): string {
    return 'SeeAction';
  }

  serialize(): ActionData {
    return {
      type: 'SeeAction',
      payload: {
        targetId: this.targetId,
        seerId: this.seerId,
      },
      timestamp: Date.now(),
    };
  }
}
