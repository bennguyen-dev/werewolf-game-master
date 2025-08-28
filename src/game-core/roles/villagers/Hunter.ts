import { IAction } from '@/game-core/actions/IAction';
import { ShootAction } from '@/game-core/actions/ShootAction';
import { Faction, RoleName } from '@/game-core/types/enums';
import { GameEvent } from '@/game-core/types/GameEvent';
import { GameState } from '@/game-core/types/GameState';
import { Player } from '@/game-core/types/Player';
import { IHunterActionOptions } from '@/game-core/types/RoleActionOptions';

import { IRole } from '../IRole';

export class Hunter implements IRole {
  readonly name = RoleName.Hunter;
  readonly faction = Faction.Villager;
  readonly description =
    'Nếu bạn chết, bạn được quyền bắn chết một người chơi khác.';

  private hasShot = false;

  onGameEvent(
    event: GameEvent,
    gameState: GameState,
    self: Player,
  ): IAction[] | null {
    // Hunter's main logic is reacting to their own death.
    // The action is created and submitted via the UI, so no automatic action is needed here.
    return null;
  }

  createAction(self: Player, payload?: unknown): IAction[] | null {
    if (typeof payload !== 'string' || this.hasShot) {
      return null; // Can't shoot if already shot or payload is invalid
    }

    // Mark that the hunter has used their ability.
    this.hasShot = true;

    const targetId = payload;
    // The shooter is the Hunter themselves.
    return [new ShootAction(targetId, self.id)];
  }

  getActionOptions(gameState: GameState, self: Player): IHunterActionOptions {
    // Hunter can only shoot when dead AND hasn't shot yet.
    const canShoot = !self.isAlive && !this.hasShot;

    return {
      canAct: canShoot,
      canShoot,
      availableTargets: canShoot
        ? gameState.getLivingPlayers().map((p) => ({ id: p.id, name: p.name }))
        : [],
    };
  }
}
