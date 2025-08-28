import { IAction } from '@/game-core/actions/IAction';
import { GamePhase, RoleName } from '@/game-core/types/enums';
import { GameState } from '@/game-core/types/GameState';
import { Player } from '@/game-core/types/Player';

// Unified history entry cho cả actions và game events
export interface HistoryEntry {
  // Basic info
  timestamp: number;
  phase: GamePhase;
  dayNumber: number;

  // Entry type
  type: 'ACTION' | 'GAME_EVENT';

  // For actions
  actorId?: string;
  actorName?: string;
  roleName?: RoleName;
  actionType?: string; // "KillAction", "SeeAction"
  targetId?: string;
  targetName?: string;

  // For game events
  eventType?: string; // "ROLE_ASSIGNED", "PHASE_CHANGED", "NIGHT_RESULTS"
  eventData?: any; // Flexible data for different event types
  message?: string; // Pre-formatted message for simple events
}

export class GameHistory {
  private entries: HistoryEntry[] = [];

  /**
   * Thêm một action entry vào history
   */
  addActionEntry(action: IAction, actor: Player, gameState: GameState): void {
    const serialized = action.serialize();
    const actionType = action.getType();

    const entry: HistoryEntry = {
      timestamp: Date.now(),
      phase: gameState.phase,
      dayNumber: gameState.dayNumber,
      type: 'ACTION',
      actorId: actor.id,
      actorName: actor.name,
      roleName: actor.role!.name,
      actionType: actionType,
      // Store serialized payload for later use in formatting
      eventData: {
        actionPayload: serialized.payload,
        seerResult:
          actionType === 'SeeAction' ? gameState.lastSeerResult : undefined,
      },
    };

    this.entries.push(entry);
  }

  /**
   * Thêm một group action entry vào history (cho Werewolf, etc.)
   */
  addGroupActionEntry(
    action: IAction,
    actors: Player[],
    gameState: GameState,
  ): void {
    const serialized = action.serialize();
    const targetId = serialized.payload.targetId;
    const target = targetId ? gameState.getPlayerById(targetId) : null;

    const actorNames = actors.map((p) => p.name).join(', ');
    const roleName = actors[0]?.role?.name;

    const entry: HistoryEntry = {
      timestamp: Date.now(),
      phase: gameState.phase,
      dayNumber: gameState.dayNumber,
      type: 'ACTION',
      actorId: actors.map((p) => p.id).join(','), // Multiple IDs
      actorName: actorNames, // Multiple names
      roleName: roleName,
      actionType: action.getType(),
      targetId: targetId,
      targetName: target?.name,
      eventData: {
        isGroupAction: true,
        groupMembers: actors.map((p) => ({ id: p.id, name: p.name })),
      },
    };

    this.entries.push(entry);
  }

  /**
   * Thêm một game event vào history
   */
  addGameEvent(
    eventType: string,
    gameState: GameState,
    eventData?: any,
    message?: string,
  ): void {
    const entry: HistoryEntry = {
      timestamp: Date.now(),
      phase: gameState.phase,
      dayNumber: gameState.dayNumber,
      type: 'GAME_EVENT',
      eventType,
      eventData,
      message,
    };

    this.entries.push(entry);
  }

  /**
   * Lấy tất cả entries
   */
  getEntries(): HistoryEntry[] {
    return [...this.entries];
  }

  /**
   * Lấy entries theo phase
   */
  getEntriesByPhase(phase: GamePhase, dayNumber?: number): HistoryEntry[] {
    return this.entries.filter(
      (entry) =>
        entry.phase === phase &&
        (dayNumber === undefined || entry.dayNumber === dayNumber),
    );
  }

  /**
   * Lấy entries theo role
   */
  getEntriesByRole(roleName: RoleName): HistoryEntry[] {
    return this.entries.filter((entry) => entry.roleName === roleName);
  }

  /**
   * Lấy actions của đêm gần nhất
   */
  getLastNightActions(): HistoryEntry[] {
    if (this.entries.length === 0) return [];

    const maxDay = Math.max(...this.entries.map((e) => e.dayNumber));
    return this.getEntriesByPhase(GamePhase.Night, maxDay).filter(
      (entry) => entry.type === 'ACTION',
    );
  }

  /**
   * Lấy chỉ actions (không bao gồm game events)
   */
  getActionEntries(): HistoryEntry[] {
    return this.entries.filter((entry) => entry.type === 'ACTION');
  }

  /**
   * Lấy chỉ game events (không bao gồm actions)
   */
  getGameEventEntries(): HistoryEntry[] {
    return this.entries.filter((entry) => entry.type === 'GAME_EVENT');
  }

  /**
   * Clear tất cả history (để reset game)
   */
  clear(): void {
    this.entries = [];
  }
}
