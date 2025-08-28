import { GamePhase } from './enums';
import { Player } from './Player';

// Định nghĩa các loại sự kiện có thể xảy ra trong game
export type GameEventType =
  | 'GAME_STARTED'
  | 'PHASE_CHANGED'
  | 'PLAYER_DIED'
  | 'ACTION_SUBMITTED'
  | 'ACTION_UNDONE';

// Định nghĩa cấu trúc cơ bản cho một sự kiện
interface BaseGameEvent<T extends GameEventType, P> {
  type: T;
  payload: P;
}

// Định nghĩa payload cho từng loại sự kiện cụ thể
export type GameStartedEvent = BaseGameEvent<
  'GAME_STARTED',
  { playerCount: number }
>;
export type PhaseChangedEvent = BaseGameEvent<
  'PHASE_CHANGED',
  { newPhase: GamePhase; day: number }
>;
export type PlayerDiedEvent = BaseGameEvent<
  'PLAYER_DIED',
  { player: Player; cause: 'KILLED' | 'VOTED_OUT' | 'POISONED' | 'SHOT' }
>;

export type ActionSubmittedEvent = BaseGameEvent<
  'ACTION_SUBMITTED',
  { actingRoleName: string; actionType: string | string[] }
>;

export type ActionUndoneEvent = BaseGameEvent<
  'ACTION_UNDONE',
  { actionType: string }
>;

// Union type cho tất cả các sự kiện có thể xảy ra
export type GameEvent =
  | GameStartedEvent
  | PhaseChangedEvent
  | PlayerDiedEvent
  | ActionSubmittedEvent
  | ActionUndoneEvent;
