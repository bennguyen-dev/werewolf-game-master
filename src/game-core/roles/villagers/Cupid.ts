import { CoupleAction } from '@/game-core/actions/CoupleAction';
import { IAction } from '@/game-core/actions/IAction';
import { Faction, RoleName } from '@/game-core/types/enums';
import { GameEvent } from '@/game-core/types/GameEvent';
import { GameState } from '@/game-core/types/GameState';
import { Player } from '@/game-core/types/Player';
import { ICupidActionOptions } from '@/game-core/types/RoleActionOptions';

import { IRole } from '../IRole';

export class Cupid implements IRole {
  readonly name = RoleName.Cupid;
  readonly faction = Faction.Villager;
  readonly description =
    'Đêm đầu tiên, bạn chọn hai người để ghép đôi. Nếu một trong hai chết, người còn lại cũng sẽ chết theo.';

  onGameEvent(
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
    // Handle both array format and object format
    let target1Id: string, target2Id: string;

    if (Array.isArray(payload) && payload.length >= 2) {
      target1Id = payload[0];
      target2Id = payload[1];
    } else if (typeof payload === 'object' && payload !== null) {
      const obj = payload as { target1Id?: string; target2Id?: string };
      if (obj.target1Id && obj.target2Id) {
        target1Id = obj.target1Id;
        target2Id = obj.target2Id;
      } else {
        return null;
      }
    } else {
      return null;
    }

    return [new CoupleAction(target1Id, target2Id)];
  }

  getActionOptions(gameState: GameState, self: Player): ICupidActionOptions {
    // Cupid can only act on first night (day 0)
    if (gameState.dayNumber !== 0) {
      return {
        canAct: false,
        availableTargets: [],
        requiresTargetCount: 2,
      };
    }

    return {
      canAct: true,
      availableTargets: gameState
        .getLivingPlayers()
        .filter((p) => p.id !== self.id) // Can't couple self
        .map((p) => ({ id: p.id, name: p.name })),
      requiresTargetCount: 2,
    };
  }
}
