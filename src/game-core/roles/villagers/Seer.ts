import { IAction } from '@/game-core/actions/IAction';
import { SeeAction } from '@/game-core/actions/SeeAction';
import { Faction, RoleName } from '@/game-core/types/enums';
import { GameEvent } from '@/game-core/types/GameEvent';
import { GameState } from '@/game-core/types/GameState';
import { Player } from '@/game-core/types/Player';

import { IRole } from '../IRole';

export class Seer implements IRole {
  readonly name = RoleName.Seer;
  readonly faction = Faction.Villager;
  readonly description = 'Mỗi đêm, bạn được chọn một người để xem phe của họ.';

  onGameEvent(
    event: GameEvent,
    gameState: GameState,
    self: Player,
  ): IAction[] | null {
    // Seer chỉ hành động khi đêm bắt đầu
    if (event.type === 'PHASE_CHANGED' && event.payload.newPhase === 'NIGHT') {
      // Logic tạo action sẽ được gọi từ một phương thức khác, được trigger bởi UI
    }
    return null;
  }

  createAction(self: Player, payload?: unknown): IAction[] | null {
    if (typeof payload !== 'string') {
      return null;
    }
    const targetId = payload;
    return [new SeeAction(targetId, self.id)];
  }

  getActionOptions(gameState: GameState, self: Player): any {
    return {
      availableTargets: gameState
        .getLivingPlayers()
        .filter((p) => p.id !== self.id)
        .map((p) => ({ id: p.id, name: p.name })),
    };
  }
}
