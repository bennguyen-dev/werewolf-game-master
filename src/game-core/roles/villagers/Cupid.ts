import { CoupleAction } from '@/game-core/actions/CoupleAction';
import { IAction } from '@/game-core/actions/IAction';
import { Faction, RoleName } from '@/game-core/types/enums';
import { GameEvent } from '@/game-core/types/GameEvent';
import { GameState } from '@/game-core/types/GameState';
import { Player } from '@/game-core/types/Player';

import { IRole } from '../IRole';

export class Cupid implements IRole {
  readonly name = RoleName.Cupid;
  readonly faction = Faction.Villager;
  readonly description =
    'Đêm đầu tiên, bạn chọn hai người để ghép đôi. Nếu một trong hai chết, người còn lại cũng sẽ chết theo.';

  handleGameEvent(
    event: GameEvent,
    gameState: GameState,
    self: Player,
  ): IAction[] | null {
    // Cupid only acts on the first night.
    if (
      event.type === 'PHASE_CHANGED' &&
      event.payload.newPhase === 'NIGHT' &&
      event.payload.day === 1
    ) {
      // Ready to act
    }
    return null;
  }

  createAction(self: Player, payload?: unknown): IAction[] | null {
    if (!Array.isArray(payload) || payload.length < 2) {
      return null;
    }
    const targetIds = payload as string[];
    return [new CoupleAction(targetIds[0], targetIds[1])];
  }

  getUiContext(gameState: GameState, self: Player): any {
    // Cupid can only act on day 1.
    if (gameState.dayNumber !== 1) {
      return { canAct: false, availableTargets: [] };
    }
    return {
      canAct: true,
      availableTargets: gameState
        .getLivingPlayers()
        .map((p) => ({ id: p.id, name: p.name })),
    };
  }
}
