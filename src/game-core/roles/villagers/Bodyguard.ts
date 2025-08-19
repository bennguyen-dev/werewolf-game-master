import { IAction } from '@/game-core/actions/IAction';
import { ProtectAction } from '@/game-core/actions/ProtectAction';
import { Faction, RoleName } from '@/game-core/types/enums';
import { GameEvent } from '@/game-core/types/GameEvent';
import { GameState } from '@/game-core/types/GameState';
import { Player } from '@/game-core/types/Player';

import { IRole } from '../IRole';

export class Bodyguard implements IRole {
  readonly name = RoleName.Bodyguard;
  readonly faction = Faction.Villager;
  readonly description =
    'Mỗi đêm, bạn chọn một người để bảo vệ. Nếu người đó bị Sói cắn, họ sẽ không chết.';

  onGameEvent(
    event: GameEvent,
    gameState: GameState,
    self: Player,
  ): IAction[] | null {
    return null; // Bodyguard acts via UI trigger
  }

  createAction(self: Player, payload?: unknown): IAction[] | null {
    if (typeof payload !== 'string') return null;
    const targetId = payload;

    if (targetId === self.id) {
      // Logic rule: Bodyguard cannot protect themselves.
      // This could also be enforced in a RuleSet.
      return null;
    }

    return [new ProtectAction(targetId)];
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
