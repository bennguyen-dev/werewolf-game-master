'use client';

import { useCallback, useMemo, useState } from 'react';

import { GameEngine } from '@/game-core/GameEngine';
import { HistoryEntry } from '@/game-core/GameHistory';
import { IRole } from '@/game-core/roles/IRole';
import { ActionResult } from '@/game-core/types/common';
import { RoleName } from '@/game-core/types/enums';
import { GameState } from '@/game-core/types/GameState';
import { Player } from '@/game-core/types/Player';
import {
  IHunterActionOptions,
  RoleActionOptions,
} from '@/game-core/types/RoleActionOptions';

export interface IUseGameReturn {
  // State
  gameEngine: GameEngine | null;
  gameState: GameState | null;
  gameHistory: string[];
  gameStartTime: Date | null;

  // Game Management
  initializeGame: (players: { id: string; name: string }[]) => ActionResult;

  // Role Management
  assignRoleToPlayers: (
    playerIds: string[],
    roleName: RoleName,
  ) => ActionResult;
  getRoleActionOptions: (roleName: RoleName) => RoleActionOptions | null;
  getFirstNightTurnOrder: () => IRole[];

  // Action Management
  submitGroupAction: (roleName: RoleName, payload: unknown) => ActionResult;

  // Phase Management
  startFirstNight: () => ActionResult;
  resolveNight: () => ActionResult;
  resolveVoting: () => ActionResult;

  // Utilities
  findPlayerWithRole: (roleName: RoleName) => Player | null;
  getPlayersWithRole: (roleName: RoleName) => Player[];
  addToHistory: (message: string) => void;
  checkIfRoleCanAct: (actionOptions: RoleActionOptions) => boolean;
}

export const useGame = (): IUseGameReturn => {
  const [gameEngine, setGameEngine] = useState<GameEngine | null>(null);
  const [gameStartTime, setGameStartTime] = useState<Date | null>(null);
  const [historyUpdateTrigger, setHistoryUpdateTrigger] = useState(0);

  // Format structured history entries into readable messages
  const formatHistoryEntry = useCallback(
    (entry: HistoryEntry, currentGameEngine?: GameEngine): string => {
      const timestamp = new Date(entry.timestamp).toLocaleTimeString();
      const phaseText =
        entry.phase === 'NIGHT'
          ? '🌙'
          : entry.phase === 'DAY_DISCUSS'
            ? '☀️'
            : '🗳️';

      // Handle game events
      if (entry.type === 'GAME_EVENT') {
        switch (entry.eventType) {
          case 'ROLE_ASSIGNED':
            const { roleName, playerNames, count } = entry.eventData;
            return `${timestamp} 👥 Đã gán ${roleName} cho ${count} người: [${playerNames.join(', ')}]`;

          case 'FIRST_NIGHT_STARTED':
            return `${timestamp} 🌙 Bắt đầu đêm đầu tiên - Gán vai trò cho người chơi`;

          case 'NIGHT_STARTED':
            return `${timestamp} 🌙 Bắt đầu đêm ${entry.eventData.dayNumber}`;

          case 'NIGHT_ENDED':
            const { deadPlayers, totalDeaths } = entry.eventData;
            if (totalDeaths === 0) {
              return `${timestamp} ☀️ Kết thúc đêm - Không ai chết`;
            } else {
              const deadNames = deadPlayers.map((p: any) => p.name).join(', ');
              return `${timestamp} ☀️ Kết thúc đêm - ${totalDeaths} người chết: [${deadNames}]`;
            }

          case 'DAY_STARTED':
            return `${timestamp} ☀️ Bắt đầu ngày ${entry.eventData.dayNumber} - Thảo luận`;

          case 'VOTING_ENDED':
            const { votedOutPlayer } = entry.eventData;
            if (votedOutPlayer) {
              return `${timestamp} 🗳️ Kết thúc bỏ phiếu - ${votedOutPlayer.name} bị loại`;
            } else {
              return `${timestamp} 🗳️ Kết thúc bỏ phiếu - Không ai bị loại`;
            }

          case 'GAME_ENDED':
            return `${timestamp} 🏆 Game kết thúc - ${entry.eventData.winner} thắng!`;

          default:
            return `${timestamp} ${phaseText} ${entry.eventType}`;
        }
      }

      // Handle actions
      if (entry.type === 'ACTION') {
        const targetText = entry.targetName ? ` → ${entry.targetName}` : '';

        // Format action type to Vietnamese
        const actionMap: Record<string, string> = {
          KillAction: 'tấn công',
          SeeAction: 'điều tra',
          ProtectAction: 'bảo vệ',
          HealAction: 'cứu chữa',
          PoisonAction: 'đầu độc',
          CoupleAction: 'ghép đôi',
        };

        const actionText = actionMap[entry.actionType!] || entry.actionType;

        // Handle special action formatting using actionPayload
        if (
          entry.actionType === 'CoupleAction' &&
          entry.eventData?.actionPayload
        ) {
          // Cupid action with 2 targets from payload
          const payload = entry.eventData.actionPayload;
          const player1 = currentGameEngine?.gameState.getPlayerById(
            payload.player1Id,
          );
          const player2 = currentGameEngine?.gameState.getPlayerById(
            payload.player2Id,
          );
          const targetNames = [player1?.name, player2?.name]
            .filter(Boolean)
            .join(' và ');
          return `${timestamp} ${phaseText} ${entry.roleName}(${entry.actorName}) đã ${actionText} ${targetNames}`;
        } else if (
          entry.actionType === 'SeeAction' &&
          entry.eventData?.seerResult
        ) {
          // Seer action with result
          const seerResult = entry.eventData.seerResult;
          const targetName = seerResult.targetName;
          const resultText = seerResult.revealedFaction; // Hiển thị faction trực tiếp như trong SeerActionForm
          return `${timestamp} ${phaseText} ${entry.roleName}(${entry.actorName}) đã ${actionText} ${targetName} - Kết quả: ${resultText}`;
        } else if (entry.eventData?.isGroupAction) {
          // Group action (Werewolf)
          return `${timestamp} ${phaseText} ${entry.roleName}(${entry.actorName}) đã ${actionText}${targetText}`;
        } else {
          // Standard single target action - get target from payload
          const payload = entry.eventData?.actionPayload;
          const targetId = payload?.targetId;
          const target = targetId
            ? currentGameEngine?.gameState.getPlayerById(targetId)
            : null;
          const targetText = target ? ` → ${target.name}` : '';
          return `${timestamp} ${phaseText} ${entry.roleName}(${entry.actorName}) đã ${actionText}${targetText}`;
        }
      }

      return `${timestamp} ${phaseText} Unknown entry type`;
    },
    [],
  );

  // Convert structured history to formatted strings
  const gameHistory = useMemo(() => {
    if (!gameEngine) return [];

    const structuredHistory = gameEngine.getActionHistory().getEntries();
    const formattedHistory = structuredHistory.map((entry) =>
      formatHistoryEntry(entry, gameEngine),
    );

    // Add initial game start message
    const startMessage = `🎮 Game khởi tạo với ${gameEngine.gameState.players.length} người chơi`;

    return [startMessage, ...formattedHistory];
  }, [gameEngine, formatHistoryEntry, historyUpdateTrigger]);

  // Helper function to check if a role can act based on their action options
  const checkIfRoleCanAct = useCallback(
    (actionOptions: RoleActionOptions): boolean => {
      // Check if role explicitly says it can't act
      if ('canAct' in actionOptions && actionOptions.canAct === false) {
        return false;
      }

      // Check if role has available targets (most roles need targets to act)
      if ('availableTargets' in actionOptions) {
        const targets = actionOptions.availableTargets;
        if (!targets || targets.length === 0) {
          return false;
        }

        // For Cupid, check if requiresTargetCount is specified
        if (
          'requiresTargetCount' in actionOptions &&
          actionOptions.requiresTargetCount
        ) {
          return targets.length >= actionOptions.requiresTargetCount;
        }

        return true;
      }

      // Handle specific action options
      if ('canShoot' in actionOptions) {
        return (actionOptions as IHunterActionOptions).canShoot;
      }

      // Default: if no specific restrictions, role can act
      return true;
    },
    [],
  );

  const initializeGame = useCallback(
    (players: { id: string; name: string }[]): ActionResult => {
      try {
        const engine = new GameEngine(players);
        const startTime = new Date();

        setGameEngine(engine);
        setGameStartTime(startTime);

        return {
          success: true,
          message: `Game initialized with ${players.length} players`,
        };
      } catch (error) {
        return {
          success: false,
          message: `Failed to initialize game: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        };
      }
    },
    [],
  );

  const addToHistory = useCallback((message: string) => {
    // This method is kept for backward compatibility but no longer used
    // History is now automatically generated from structured data
  }, []);

  const assignRoleToPlayers = useCallback(
    (playerIds: string[], roleName: RoleName): ActionResult => {
      if (!gameEngine) {
        return { success: false, message: 'Game not initialized' };
      }

      const result = gameEngine.assignRoleToPlayers(playerIds, roleName);

      // Force history update trigger for role assignment
      if (result.success) {
        setHistoryUpdateTrigger((prev) => prev + 1);
      }

      return result;
    },
    [gameEngine, addToHistory],
  );

  const getRoleActionOptions = useCallback(
    (roleName: RoleName): RoleActionOptions | null => {
      if (!gameEngine) return null;

      const player = gameEngine.gameState.players.find(
        (p) => p.role?.name === roleName,
      );
      if (!player || !player.role) return null;

      return player.role.getActionOptions(gameEngine.gameState, player);
    },
    [gameEngine],
  );

  const submitGroupAction = useCallback(
    (roleName: RoleName, payload: unknown): ActionResult => {
      if (!gameEngine) {
        return { success: false, message: 'Game not initialized' };
      }

      const result = gameEngine.submitGroupAction(roleName, payload);
      // Action details are now automatically tracked in structured history

      // Force history update trigger
      if (result.success) {
        setHistoryUpdateTrigger((prev) => prev + 1);
      }

      return result;
    },
    [gameEngine],
  );

  const getFirstNightTurnOrder = useCallback((): IRole[] => {
    if (!gameEngine) {
      return [];
    }
    return gameEngine.getFirstNightTurnOrder();
  }, [gameEngine]);

  const startFirstNight = useCallback((): ActionResult => {
    if (!gameEngine) {
      return { success: false, message: 'Game not initialized' };
    }

    try {
      gameEngine.startFirstNight();

      // Force history update trigger
      setHistoryUpdateTrigger((prev) => prev + 1);

      return { success: true, message: 'First night started' };
    } catch (error) {
      return {
        success: false,
        message: `Failed to start first night: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      };
    }
  }, [gameEngine]);

  const resolveNight = useCallback((): ActionResult => {
    if (!gameEngine) {
      return { success: false, message: 'Game not initialized' };
    }

    const result = gameEngine.resolveNight();

    // Force history update trigger
    if (result.success) {
      setHistoryUpdateTrigger((prev) => prev + 1);
    }

    return result;
  }, [gameEngine]);

  const resolveVoting = useCallback((): ActionResult => {
    if (!gameEngine) {
      return { success: false, message: 'Game not initialized' };
    }

    const result = gameEngine.resolveVoting();

    // Force history update trigger
    if (result.success) {
      setHistoryUpdateTrigger((prev) => prev + 1);
    }

    return result;
  }, [gameEngine]);

  const findPlayerWithRole = useCallback(
    (roleName: RoleName): Player | null => {
      if (!gameEngine) return null;

      return (
        gameEngine.gameState.players.find((p) => p.role?.name === roleName) ||
        null
      );
    },
    [gameEngine],
  );

  const getPlayersWithRole = useCallback(
    (roleName: RoleName): Player[] => {
      if (!gameEngine) return [];

      return gameEngine.gameState.players.filter(
        (p) => p.role?.name === roleName,
      );
    },
    [gameEngine],
  );

  return {
    // State
    gameEngine,
    gameState: gameEngine?.gameState || null,
    gameHistory,
    gameStartTime,

    // Game Management
    initializeGame,
    getFirstNightTurnOrder,

    // Role Management
    assignRoleToPlayers,
    getRoleActionOptions,

    // Action Management
    submitGroupAction,

    // Phase Management
    startFirstNight,
    resolveNight,
    resolveVoting,

    // Utilities
    findPlayerWithRole,
    getPlayersWithRole,
    addToHistory,
    checkIfRoleCanAct,
  };
};
