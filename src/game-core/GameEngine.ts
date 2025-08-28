import { IAction } from '@/game-core/actions/IAction';
import { GameHistory } from '@/game-core/GameHistory';
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
  private actionHistory: GameHistory = new GameHistory();
  private votingResults: Map<string, string[]> = new Map();

  // Action history for undo functionality
  private undoActionHistory: IAction[] = [];
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

    // Add to history
    this.actionHistory.addGameEvent('FIRST_NIGHT_STARTED', this.gameState, {
      dayNumber: this.gameState.dayNumber,
    });

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
    const assignedPlayers: string[] = [];

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
      assignedPlayers.push(player.name);
    }

    // Add to history
    if (assignedCount > 0) {
      this.actionHistory.addGameEvent('ROLE_ASSIGNED', this.gameState, {
        roleName,
        playerNames: assignedPlayers,
        count: assignedCount,
      });
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
      this.undoActionHistory.push(...actions);
      actions.forEach((action) => {
        action.execute(this.gameState);

        // Get all players with same role for group actions
        const allPlayersWithRole = this.gameState
          .getLivingPlayers()
          .filter((p) => p.role?.name === actingRoleName);

        // Add action entry (works for both individual and group roles)
        this.actionHistory.addActionEntry(
          action,
          allPlayersWithRole,
          this.gameState,
        );
      });

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

  public submitImmediateAction(
    actingRoleName: RoleName,
    payload: unknown,
  ): ActionResult {
    let responsiblePlayer = this.gameState
      .getLivingPlayers()
      .find((p) => p.role?.name === actingRoleName);

    if (!responsiblePlayer || !responsiblePlayer.role) {
      // Fallback to dead players for roles like Hunter
      const deadPlayer = this.gameState.players.find(
        (p) => !p.isAlive && p.role?.name === actingRoleName,
      );
      if (!deadPlayer || !deadPlayer.role) {
        return {
          success: false,
          message: `No active or eligible player found with role ${actingRoleName}.`,
        };
      }
      // Re-assign for the dead player to be the actor
      responsiblePlayer = deadPlayer;
    }

    const actions = responsiblePlayer.role?.createAction(
      responsiblePlayer,
      payload,
    );

    if (actions && Array.isArray(actions)) {
      // Note: Immediate actions can have targets. We need to check for deaths.
      const targetId =
        typeof payload === 'string'
          ? payload
          : (payload as any)?.targetId || null;
      const targetPlayer = targetId
        ? this.gameState.getPlayerById(targetId)
        : null;
      const targetWasAlive = targetPlayer?.isAlive || false;

      actions.forEach((action) => {
        // Execute immediately
        action.execute(this.gameState);

        // Add to history
        this.actionHistory.addActionEntry(
          action,
          [responsiblePlayer],
          this.gameState,
        );

        // Broadcast
        this._broadcastEvent({
          type: 'ACTION_SUBMITTED',
          payload: {
            actingRoleName,
            actionType: action.getType(),
          },
        });
      });

      // Check if the target player died as a result of the action
      if (targetPlayer && targetWasAlive && !targetPlayer.isAlive) {
        this._broadcastEvent({
          type: 'PLAYER_DIED',
          payload: { player: targetPlayer, cause: 'SHOT' }, // Or a more generic cause
        });
      }

      // Process any further immediate actions that might have been queued by the event
      this._processImmediateActions();

      // Check for win conditions as the action might end the game
      const winner = this.ruleSet.checkWinConditions(this.gameState);
      if (winner) {
        this.gameState.winner = winner;
        this.gameState.phase = GamePhase.Finished;
        this.actionHistory.addGameEvent('GAME_ENDED', this.gameState, {
          winner,
        });
      }

      return { success: true, message: 'Immediate action executed.' };
    }

    return {
      success: false,
      message: 'Invalid action for immediate execution.',
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

    // Add night results to history
    this.actionHistory.addGameEvent('NIGHT_ENDED', this.gameState, {
      deadPlayers: deadPlayersToday,
      totalDeaths: deadPlayersToday.length,
      dayNumber: this.gameState.dayNumber,
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

      // Add game end to history
      this.actionHistory.addGameEvent('GAME_ENDED', this.gameState, {
        winner: winner,
      });
    } else {
      // Transition to day phase
      this.gameState.dayNumber++;
      this.gameState.phase = GamePhase.Day_Discuss;

      // Add day start to history
      this.actionHistory.addGameEvent('DAY_STARTED', this.gameState, {
        dayNumber: this.gameState.dayNumber,
      });

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

  public startVotingPhase(): ActionResult {
    if (this.gameState.phase !== GamePhase.Day_Discuss) {
      return { success: false, message: 'Not in discussion phase' };
    }
    this.gameState.phase = GamePhase.Day_Vote;
    this._broadcastEvent({
      type: 'PHASE_CHANGED',
      payload: { newPhase: GamePhase.Day_Vote, day: this.gameState.dayNumber },
    });
    return { success: true, message: 'Voting phase started.' };
  }

  public resolveVoting(votedPlayerId: string | null): ActionResult {
    let votedOutPlayer: Player | null = null;
    if (votedPlayerId) {
      votedOutPlayer = this.gameState.getPlayerById(votedPlayerId);
    }

    // Add voting results to history
    this.actionHistory.addGameEvent('VOTING_ENDED', this.gameState, {
      votedOutPlayer: votedOutPlayer || null,
      dayNumber: this.gameState.dayNumber,
    });

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

      // Add game end to history
      this.actionHistory.addGameEvent('GAME_ENDED', this.gameState, { winner });
    } else {
      this.gameState.phase = GamePhase.Night;

      // Add night start to history
      this.actionHistory.addGameEvent('NIGHT_STARTED', this.gameState, {
        dayNumber: this.gameState.dayNumber,
      });

      this._broadcastEvent({
        type: 'PHASE_CHANGED',
        payload: { newPhase: GamePhase.Night, day: this.gameState.dayNumber },
      });
    }
    this.votingResults.clear();
    return { success: true, message: 'Voting processed.' };
  }

  public undoLastAction(): ActionResult {
    if (this.undoActionHistory.length === 0) {
      return { success: false, message: 'No actions to undo' };
    }

    const lastAction = this.undoActionHistory.pop()!;
    const lastSnapshot = this.stateSnapshots.pop()!;

    this.gameState.restoreFromSnapshot(lastSnapshot);

    this._broadcastEvent({
      type: 'ACTION_UNDONE',
      payload: { actionType: lastAction.getType() },
    });

    return { success: true, message: 'Action undone successfully' };
  }

  public canUndo(): boolean {
    return this.undoActionHistory.length > 0;
  }

  public getRuleSet(): IRuleSet {
    return this.ruleSet;
  }

  public getSerializableState(): SerializedGameState {
    return {
      gameState: this.gameState.createSnapshot(),
      actionHistory: this.undoActionHistory.map((a) => a.serialize()),
      gameHistory: this.gameHistory,
    };
  }

  // Public methods to access structured action history
  public getActionHistory(): GameHistory {
    return this.actionHistory;
  }

  public getLastNightActions() {
    return this.actionHistory.getLastNightActions();
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
