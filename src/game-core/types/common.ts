import { ActionData } from '@/game-core/actions/IAction';
import { GameEvent } from '@/game-core/types/GameEvent';
import { GameStateSnapshot } from '@/game-core/types/GameState';

export interface ActionResult {
  success: boolean;
  message?: string;
  data?: unknown;
}

export interface SerializedGameState {
  gameState: GameStateSnapshot;
  actionHistory: ActionData[];
  gameHistory: GameEvent[];
}
