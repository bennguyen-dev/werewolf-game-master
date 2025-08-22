import { IAction } from '@/game-core/actions/IAction';
import { Faction, RoleName } from '@/game-core/types/enums';
import { GameEvent } from '@/game-core/types/GameEvent';
import { GameState } from '@/game-core/types/GameState';
import { Player } from '@/game-core/types/Player';
import { IVillagerActionOptions } from '@/game-core/types/RoleActionOptions';

import { IRole } from '../IRole';

export class Villager implements IRole {
  readonly name = RoleName.Villager;
  readonly faction = Faction.Villager;
  readonly description =
    'Bạn là một Dân làng vô tội, mục tiêu của bạn là treo cổ hết Sói.';

  onGameEvent(
    event: GameEvent,
    gameState: GameState,
    self: Player,
  ): IAction[] | null {
    // Villagers have no special actions to react to events.
    return null;
  }

  createAction(self: Player, payload: unknown): IAction[] | null {
    // Villagers have no actions.
    return null;
  }

  getActionOptions(gameState: GameState, self: Player): IVillagerActionOptions {
    // Villagers have no special actions
    return {
      canAct: false, // Villagers never have actions
    };
  }
}
