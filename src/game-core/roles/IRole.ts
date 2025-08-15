import {Faction, RoleName} from "@/game-core/types/enums";
import {Player} from "@/game-core/types/Player";
import {IAction} from "@/game-core/actions/IAction";
import {GameState} from "@/game-core/types/GameState";
import { GameEvent } from "@/game-core/types/GameEvent";

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
    handleGameEvent(event: GameEvent, gameState: GameState, self: Player): IAction[] | null;

    /**
     * Cung cấp dữ liệu ngữ cảnh cho UI.
     * Giúp tách biệt logic game khỏi logic hiển thị.
     * @param gameState Trạng thái hiện tại của game.
     * @param self Người chơi mang vai trò này.
     * @returns Một object chứa dữ liệu cần thiết cho UI của vai trò này.
     */
    getUiContext(gameState: GameState, self: Player): any; // Sẽ định nghĩa type cụ thể cho UI context sau
}
