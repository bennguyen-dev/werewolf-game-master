import { IAction } from '@/game-core/actions/IAction';
import { roleMap } from '@/game-core/roles';
import { IRole } from '@/game-core/roles/IRole';
import { IRuleSet } from '@/game-core/rules/IRuleSet';
import { StandardRuleSet } from '@/game-core/rules/StandardRuleSet';
import { ActionResult, SerializedGameState } from '@/game-core/types/common';
import { GamePhase, RoleName } from '@/game-core/types/enums';
import type { GameStateSnapshot } from '@/game-core/types/GameState';
import { GameState } from '@/game-core/types/GameState';
import { Player } from '@/game-core/types/Player';

import { GameEvent } from './types/GameEvent';

export class GameEngine {
  public gameState: GameState;
  private ruleSet: IRuleSet;
  private immediateActionQueue: IAction[] = [];
  private gameHistory: GameEvent[] = [];
  private votingResults: Map<string, string[]> = new Map();

  // Action history for undo functionality
  private actionHistory: IAction[] = [];
  private stateSnapshots: GameStateSnapshot[] = [];

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
    this.gameState = new GameState(playerObjects, ruleSet);
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
          // All reaction actions go to immediate queue for instant processing
          this.immediateActionQueue.push(...actions);
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

  public getFirstNightTurnOrder(): IRole[] {
    return this.ruleSet.getFirstNightTurnOrder();
  }

  public startFirstNight(): void {
    this.gameState.phase = GamePhase.Night;
    this.gameState.dayNumber = 0;
    this._broadcastEvent({
      type: 'PHASE_CHANGED',
      payload: { newPhase: GamePhase.Night, day: this.gameState.dayNumber },
    });
  }

  public assignRoleToPlayers(
    playerIds: string[],
    roleName: RoleName,
  ): ActionResult {
    const roleFactory = roleMap.get(roleName);
    if (!roleFactory) {
      return { success: false, message: `Role ${roleName} not found.` };
    }

    let assignedCount = 0;
    for (const playerId of playerIds) {
      const player = this.gameState.getPlayerById(playerId);
      if (!player) {
        console.warn(`Player with ID ${playerId} not found. Skipping.`);
        continue;
      }

      if (player.role) {
        console.warn(`Player ${player.name} already has a role. Skipping.`);
        continue;
      }
      player.role = roleFactory();
      assignedCount++;
    }

    return {
      success: true,
      message: `Assigned ${roleName} to ${assignedCount} players.`,
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

    if (actions && Array.isArray(actions)) {
      // Save snapshot before executing for undo support
      this.stateSnapshots.push(this.gameState.createSnapshot());

      // Add actions to history and execute them immediately
      this.actionHistory.push(...actions);
      actions.forEach((action) => action.execute(this.gameState));

      // Broadcast action submitted event
      this._broadcastEvent({
        type: 'ACTION_SUBMITTED',
        payload: {
          actingRoleName,
          actionType: actions.map((a) => a.getType()),
        },
      });

      return { success: true, message: 'Group action submitted and executed.' };
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

    // Process deaths - convert marked players to dead
    const deadPlayersToday: Player[] = [];
    this.gameState.players.forEach((player) => {
      if (player.isMarkedForDeath && player.isAlive) {
        player.isAlive = false;
        player.isMarkedForDeath = false;
        deadPlayersToday.push(player);
      }
    });

    // Broadcast death events for chain reactions (like Hunter shot)
    deadPlayersToday.forEach((deadPlayer) => {
      this._broadcastEvent({
        type: 'PLAYER_DIED',
        payload: { player: deadPlayer, cause: 'KILLED' },
      });
    });

    // Process any immediate reactions (like Hunter shot)
    this._processImmediateActions();

    // Check win conditions
    const winner = this.ruleSet.checkWinConditions(this.gameState);
    if (winner) {
      this.gameState.winner = winner;
      this.gameState.phase = GamePhase.Finished;
    } else {
      // Transition to day phase
      this.gameState.dayNumber++;
      this.gameState.phase = GamePhase.Day_Discuss;
      this._broadcastEvent({
        type: 'PHASE_CHANGED',
        payload: {
          newPhase: GamePhase.Day_Discuss,
          day: this.gameState.dayNumber,
        },
      });
    }

    // Reset nightly actions for next night
    this.gameState.resetNightlyActions();

    return { success: true, message: 'Night ended, starting day discussion.' };
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

  public undoLastAction(): ActionResult {
    if (this.actionHistory.length === 0) {
      return { success: false, message: 'No actions to undo' };
    }

    const lastAction = this.actionHistory.pop()!;
    const lastSnapshot = this.stateSnapshots.pop()!;

    this.gameState.restoreFromSnapshot(lastSnapshot);

    this._broadcastEvent({
      type: 'ACTION_UNDONE',
      payload: { actionType: lastAction.getType() },
    });

    return { success: true, message: 'Action undone successfully' };
  }

  public canUndo(): boolean {
    return this.actionHistory.length > 0;
  }

  public getRuleSet(): IRuleSet {
    return this.ruleSet;
  }

  public getSerializableState(): SerializedGameState {
    return {
      gameState: this.gameState.createSnapshot(),
      actionHistory: this.actionHistory.map((a) => a.serialize()),
      gameHistory: this.gameHistory,
    };
  }

  static fromSerializedState(
    data: SerializedGameState,
    players: { id: string; name: string }[],
  ): GameEngine {
    const engine = new GameEngine(players);

    engine.gameState.restoreFromSnapshot(data.gameState);

    engine.gameHistory = data.gameHistory || [];

    return engine;
  }
}
