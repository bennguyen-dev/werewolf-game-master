import { IAction } from '../../actions/IAction';
import { Faction, RoleName } from '../../types/enums';
import { GameEvent } from '../../types/GameEvent';
import { GameState } from '../../types/GameState';
import { Player } from '../../types/Player';
import { IRole } from '../IRole';

/**
 * Decorator Pattern: Wraps an existing role to change its faction to Lovers.
 * It delegates all method calls to the original role, except for the `faction` property.
 */
export class LoverRoleDecorator implements IRole {
  // The faction is overridden to Lovers.
  readonly faction = Faction.Lovers;

  // Keep the original name and description.
  get name(): RoleName {
    return this.wrappedRole.name;
  }
  get description(): string {
    return `Bạn đã bị Cupid ghép đôi và giờ thuộc phe Tình nhân. Mục tiêu của bạn là trở thành 2 người sống sót cuối cùng cùng với người yêu của mình. (Vai trò gốc: ${this.wrappedRole.description})`;
  }

  private wrappedRole: IRole;

  constructor(wrappedRole: IRole) {
    this.wrappedRole = wrappedRole;
  }

  // Delegate all method calls to the wrapped role.
  handleGameEvent(
    event: GameEvent,
    gameState: GameState,
    self: Player,
  ): IAction[] | null {
    return this.wrappedRole.handleGameEvent(event, gameState, self);
  }

  getUiContext(gameState: GameState, self: Player): any {
    return this.wrappedRole.getUiContext(gameState, self);
  }

  // Also delegate the temporary createAction method
  createAction(self: Player, payload?: unknown): IAction[] | null {
    if (typeof (this.wrappedRole as any).createAction === 'function') {
      return (this.wrappedRole as any).createAction(self, payload);
    }
    return null;
  }
}
