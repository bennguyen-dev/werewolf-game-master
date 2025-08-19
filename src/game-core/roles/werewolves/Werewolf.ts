import { IAction } from '@/game-core/actions/IAction';
import { KillAction } from '@/game-core/actions/KillAction';
import { Faction, RoleName } from '@/game-core/types/enums';
import { GameEvent } from '@/game-core/types/GameEvent';
import { GameState } from '@/game-core/types/GameState';
import { Player } from '@/game-core/types/Player';

import { IRole } from '../IRole';

export class Werewolf implements IRole {
  readonly name = RoleName.Werewolf;
  readonly faction = Faction.Werewolf;
  readonly description =
    'Mỗi đêm, bạn và đồng bọn cùng nhau chọn một người để cắn.';

  onGameEvent(
    event: GameEvent,
    gameState: GameState,
    self: Player,
  ): IAction[] | null {
    if (event.type === 'PHASE_CHANGED' && event.payload.newPhase === 'NIGHT') {
      // Werewolves need a payload (targetId) to act. This will be provided by the UI.
      // In a real scenario, the UI would call a method on the engine like `submitPlayerInput`
      // which would then be passed to the role. For now, we assume the payload is available.
      // This part of the logic will be completed when we refactor the UI interaction.
    }
    return null;
  }

  // This method will be called by a new `submitAction` method on the GameEngine
  // which will be created in a later phase.
  createAction(self: Player, payload?: unknown): IAction[] | null {
    if (typeof payload !== 'string') {
      return null;
    }
    const targetId = payload;
    return [new KillAction(targetId, self.id)];
  }

  getActionOptions(gameState: GameState, self: Player): any {
    const livingPlayers = gameState.getLivingPlayers();
    const otherPlayers = livingPlayers.filter((p) => p.id !== self.id);

    return {
      availableTargets: otherPlayers.map((p) => ({
        id: p.id,
        name: p.name,
        isValid: p.role?.faction !== Faction.Werewolf,
        reason:
          p.role?.faction === Faction.Werewolf
            ? 'Không thể giết đồng bọn'
            : undefined,
      })),
    };
  }
}
