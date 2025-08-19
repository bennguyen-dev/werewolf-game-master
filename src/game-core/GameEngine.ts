import { IAction } from '@/game-core/actions/IAction';
import { roleMap } from '@/game-core/roles';
import { IRuleSet } from '@/game-core/rules/IRuleSet';
import { StandardRuleSet } from '@/game-core/rules/StandardRuleSet';
import { ActionResult } from '@/game-core/types/common';
import { GamePhase, RoleName } from '@/game-core/types/enums';
import { GameState } from '@/game-core/types/GameState';
import { Player } from '@/game-core/types/Player';

import { GameEvent } from './types/GameEvent';

export class GameEngine {
  public gameState: GameState;
  private ruleSet: IRuleSet;
  private nightActionQueue: IAction[] = [];
  private immediateActionQueue: IAction[] = [];
  private gameHistory: GameEvent[] = [];
  private votingResults: Map<string, string[]> = new Map();

  constructor(
    players: {
      id: string;
      name: string;
    }[],
    ruleSet: IRuleSet = new StandardRuleSet(),
  ) {
    this.ruleSet = ruleSet;
    // Khởi tạo người chơi mà không gán vai trò
    const playerObjects = players.map((p) => new Player(p.id, p.name));
    this.gameState = new GameState(playerObjects);
    this._broadcastEvent({
      type: 'GAME_STARTED',
      payload: { playerCount: playerObjects.length },
    });
  }

  private _broadcastEvent(event: GameEvent): void {
    this.gameHistory.push(event);
    const livingPlayers = this.gameState.getLivingPlayers();
    for (const player of livingPlayers) {
      // Chỉ broadcast tới những player đã có vai trò
      if (player.role) {
        const actions = player.role.onGameEvent(event, this.gameState, player);
        if (actions) {
          if (event.type === 'PLAYER_DIED') {
            this.immediateActionQueue.push(...actions);
          } else {
            this.nightActionQueue.push(...actions);
          }
        }
      }
    }
  }

  private _processImmediateActions(): void {
    while (this.immediateActionQueue.length > 0) {
      const action = this.immediateActionQueue.shift()!;
      action.execute(this.gameState);
    }
  }

  public assignRoleToPlayers(
    playerIds: string[],
    roleName: RoleName,
  ): ActionResult {
    const roleFactory = roleMap.get(roleName);
    if (!roleFactory) {
      return { success: false, message: `Role ${roleName} not found.` };
    }

    for (const playerId of playerIds) {
      const player = this.gameState.getPlayerById(playerId);
      if (!player) {
        console.warn(
          `Player with id ${playerId} not found during role assignment.`,
        );
        continue;
      }
      if (player.role) {
        console.warn(`Player ${player.name} already has a role. Skipping.`);
        continue;
      }
      player.role = roleFactory();
    }

    return {
      success: true,
      message: `Assigned ${roleName} to ${playerIds.length} players.`,
    };
  }

  public submitGroupAction(
    actingRoleName: RoleName,
    payload: unknown,
  ): ActionResult {
    const responsiblePlayer = this.gameState
      .getLivingPlayers()
      .find((p) => p.role?.name === actingRoleName);

    if (!responsiblePlayer || !responsiblePlayer.role) {
      return {
        success: false,
        message: `No active player found with role ${actingRoleName} to perform the action.`,
      };
    }

    const actions = responsiblePlayer.role.createAction(
      responsiblePlayer,
      payload,
    );

    if (actions) {
      this.nightActionQueue.push(...actions);
      return { success: true, message: 'Group action submitted.' };
    }

    return {
      success: false,
      message: 'Invalid action or payload for the group.',
    };
  }

  public resolveNight(): ActionResult {
    if (this.gameState.phase !== GamePhase.Night) {
      return { success: false, message: 'Not in night phase' };
    }

    this.nightActionQueue.forEach((action) => action.execute(this.gameState));
    this.nightActionQueue = [];

    const deadPlayersToday: Player[] = [];
    this.gameState.getLivingPlayers().forEach((player) => {
      if (player.isMarkedForDeath) {
        player.isAlive = false;
        deadPlayersToday.push(player);
      }
    });

    deadPlayersToday.forEach((deadPlayer) => {
      this._broadcastEvent({
        type: 'PLAYER_DIED',
        payload: { player: deadPlayer, cause: 'KILLED' },
      });
    });

    this._processImmediateActions();

    const winner = this.ruleSet.checkWinConditions(this.gameState);
    if (winner) {
      this.gameState.winner = winner;
      this.gameState.phase = GamePhase.Finished;
    } else {
      this.gameState.phase = GamePhase.Day_Discuss;
      this._broadcastEvent({
        type: 'PHASE_CHANGED',
        payload: {
          newPhase: GamePhase.Day_Discuss,
          day: this.gameState.dayNumber,
        },
      });
    }

    this.gameState.resetNightlyActions();
    return { success: true, message: 'Night processed.' };
  }

  public resolveVoting(): ActionResult {
    const votedOutPlayer = this._getVotedOutPlayer();

    if (votedOutPlayer) {
      votedOutPlayer.isAlive = false;
      this._broadcastEvent({
        type: 'PLAYER_DIED',
        payload: { player: votedOutPlayer, cause: 'VOTED_OUT' },
      });
      this._processImmediateActions();
    }

    const winner = this.ruleSet.checkWinConditions(this.gameState);
    if (winner) {
      this.gameState.winner = winner;
      this.gameState.phase = GamePhase.Finished;
    } else {
      this.gameState.phase = GamePhase.Night;
      this.gameState.dayNumber++;
      this._broadcastEvent({
        type: 'PHASE_CHANGED',
        payload: { newPhase: GamePhase.Night, day: this.gameState.dayNumber },
      });
    }
    this.votingResults.clear();
    return { success: true, message: 'Voting processed.' };
  }

  private _getVotedOutPlayer(): Player | null {
    return null;
  }
}
