import { IAction } from '@/game-core/actions/IAction';
import { KillAction } from '@/game-core/actions/KillAction';
import { Faction, RoleName } from '@/game-core/types/enums';
import { GameEvent } from '@/game-core/types/GameEvent';
import { GameState } from '@/game-core/types/GameState';
import { Player } from '@/game-core/types/Player';

import { IRole } from '../IRole';

export class Hunter implements IRole {
  readonly name = RoleName.Hunter;
  readonly faction = Faction.Villager;
  readonly description =
    'Nếu bạn chết, bạn được quyền bắn chết một người chơi khác.';

  handleGameEvent(
    event: GameEvent,
    gameState: GameState,
    self: Player,
  ): IAction[] | null {
    // Hunter's main logic is reacting to their own death.
    if (event.type === 'PLAYER_DIED' && event.payload.player.id === self.id) {
      // The action creation will be triggered by the UI after the death is announced.
      // The UI will then call a method on the engine to submit the Hunter's shot.
    }
    return null;
  }

  createAction(self: Player, payload?: unknown): IAction[] | null {
    if (typeof payload !== 'string') {
      return null;
    }
    const targetId = payload;
    // The killer is the Hunter themselves.
    return [new KillAction(targetId, self.id)];
  }

  getUiContext(gameState: GameState, self: Player): any {
    // The UI context for the Hunter is only relevant when they have just died.
    // This would be triggered by the UI upon receiving the PLAYER_DIED event for the hunter.
    return {
      canShoot: !self.isAlive, // Can only shoot if dead
      availableTargets: gameState
        .getLivingPlayers()
        .map((p) => ({ id: p.id, name: p.name })),
    };
  }
}
