import { GameState } from '@/game-core/types/GameState';

/**
 * Interface cho mọi hành động trong game.
 * Mỗi hành động là một Command Pattern, biết cách tự thực thi
 * để thay đổi trạng thái game.
 */
export interface IAction {
  /**
   * Thực thi hành động và thay đổi trạng thái game.
   * @param gameState Trạng thái game sẽ được thay đổi.
   */
  execute(gameState: GameState): void;

  /**
   * Hoàn tác hành động (optional cho backward compatibility)
   * @param gameState Trạng thái game sẽ được restore.
   */
  undo?(gameState: GameState): void;

  /**
   * Lấy type của action để identify
   */
  getType(): string;

  /**
   * Serialize action để lưu localStorage
   */
  serialize(): ActionData;
}

/**
 * Type cho serialized action data
 */
export interface ActionData {
  type: string;
  payload: any;
  timestamp: number;
}
