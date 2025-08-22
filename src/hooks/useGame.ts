'use client';

import { useCallback, useState } from 'react';

import { GameEngine } from '@/game-core/GameEngine';
import { IRole } from '@/game-core/roles/IRole';
import { ActionResult } from '@/game-core/types/common';
import { GamePhase, RoleName } from '@/game-core/types/enums';
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
  currentPhase: GamePhase;
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
  const [gameHistory, setGameHistory] = useState<string[]>([]);
  const [gameStartTime, setGameStartTime] = useState<Date | null>(null);
  const [, setUpdateCount] = useState(0);

  const forceUpdate = useCallback(() => setUpdateCount((c) => c + 1), []);

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
        setGameHistory([`🎮 Game khởi tạo với ${players.length} người chơi`]);

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
    const timestamp = new Date().toLocaleTimeString();
    setGameHistory((prev) => [...prev, `${timestamp} - ${message}`]);
  }, []);

  const assignRoleToPlayers = useCallback(
    (playerIds: string[], roleName: RoleName): ActionResult => {
      if (!gameEngine) {
        return { success: false, message: 'Game not initialized' };
      }

      const result = gameEngine.assignRoleToPlayers(playerIds, roleName);

      if (result.success) {
        const playerNames = playerIds
          .map((id) => gameEngine.gameState.getPlayerById(id)?.name)
          .filter(Boolean)
          .join(', ');
        addToHistory(`✅ Đã gán ${roleName} cho [${playerNames}]`);
        forceUpdate();
      } else {
        addToHistory(`❌ Lỗi gán vai trò ${roleName}: ${result.message}`);
      }

      return result;
    },
    [gameEngine, addToHistory, forceUpdate],
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

      if (result.success) {
        addToHistory(`✅ ${roleName} đã thực hiện hành động`);
        forceUpdate();
      } else {
        addToHistory(`❌ Lỗi hành động ${roleName}: ${result.message}`);
      }

      return result;
    },
    [gameEngine, addToHistory, forceUpdate],
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

      addToHistory('🌙 Bắt đầu đêm đầu tiên - Gán vai trò cho người chơi');
      forceUpdate(); // Force re-render to update phase
      return { success: true, message: 'First night started' };
    } catch (error) {
      return {
        success: false,
        message: `Failed to start first night: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      };
    }
  }, [gameEngine, addToHistory, forceUpdate]);

  const resolveNight = useCallback((): ActionResult => {
    if (!gameEngine) {
      return { success: false, message: 'Game not initialized' };
    }

    const result = gameEngine.resolveNight();

    if (result.success) {
      const deadPlayers = gameEngine.gameState.players.filter(
        (p) => !p.isAlive,
      );
      if (deadPlayers.length > 0) {
        addToHistory(`💀 ${deadPlayers.length} người chơi đã chết trong đêm`);
      } else {
        addToHistory('✨ Không ai chết trong đêm này');
      }

      addToHistory('☀️ Kết thúc đêm, chuyển sang ban ngày');
      forceUpdate();
    } else {
      addToHistory(`❌ Lỗi kết thúc đêm: ${result.message}`);
    }

    return result;
  }, [gameEngine, addToHistory, forceUpdate]);

  const resolveVoting = useCallback((): ActionResult => {
    if (!gameEngine) {
      return { success: false, message: 'Game not initialized' };
    }

    const result = gameEngine.resolveVoting();

    if (result.success) {
      addToHistory('🗳️ Đã xử lý kết quả bỏ phiếu');
      forceUpdate();
    } else {
      addToHistory(`❌ Lỗi xử lý bỏ phiếu: ${result.message}`);
    }

    return result;
  }, [gameEngine, addToHistory, forceUpdate]);

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
    currentPhase: gameEngine?.gameState.phase || GamePhase.Setup,
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
