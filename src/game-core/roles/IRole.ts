import { IAction } from '@/game-core/actions/IAction';
import { Faction, RoleName } from '@/game-core/types/enums';
import { GameEvent } from '@/game-core/types/GameEvent';
import { GameState } from '@/game-core/types/GameState';
import { Player } from '@/game-core/types/Player';

/**
 * Đại diện cho một vai trò trong game.
 * Tuân thủ kiến trúc Event-Driven.
 */
export interface IRole {
  readonly name: RoleName;
  readonly faction: Faction;
  readonly description: string;

  /**
   * Phương thức cốt lõi để xử lý các sự kiện của game.
   * Role sẽ kiểm tra loại sự kiện và quyết định có tạo ra Action hay không.
   * @param event Sự kiện vừa xảy ra trong game.
   * @param gameState Trạng thái hiện tại của game.
   * @param self Người chơi mang vai trò này.
   * @returns Mảng các Action, hoặc null nếu không có phản ứng.
   */
  onGameEvent(
    event: GameEvent,
    gameState: GameState,
    self: Player,
  ): IAction[] | null;

  /**
   * Tạo ra một hoặc nhiều Action dựa trên yêu cầu từ UI.
   * Đây là phương thức chính để một vai trò phản ứng với hành động của người chơi.
   * @param self Người chơi mang vai trò này.
   * @param payload Dữ liệu từ UI (ví dụ: ID người chơi bị nhắm tới).
   * @returns Mảng các Action, hoặc null nếu không có hành động.
   */
  createAction(self: Player, payload: unknown): IAction[] | null;

  /**
   * Cung cấp dữ liệu ngữ cảnh cho UI.
   * Giúp tách biệt logic game khỏi logic hiển thị.
   * @param gameState Trạng thái hiện tại của game.
   * @param self Người chơi mang vai trò này.
   * @returns Một object chứa dữ liệu cần thiết cho UI của vai trò này.
   */
  getActionOptions(gameState: GameState, self: Player): any; // Sẽ định nghĩa type cụ thể cho UI context sau
}
