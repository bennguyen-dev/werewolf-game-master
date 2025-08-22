import { GameEngine } from '@/game-core/GameEngine';
import { GamePhase } from '@/game-core/types/enums';

export interface IGameMasterState {
  gameEngine: GameEngine | null;
  currentPhase: GamePhase;
  selectedPlayers: string[];
  activeTimer: {
    duration: number;
    remaining: number;
    isRunning: boolean;
  } | null;
  gameHistory: string[];
  notes: Record<string, string>; // playerId -> notes
}

export interface IPhaseAction {
  id: string;
  label: string;
  description: string;
  action: () => void;
  disabled?: boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary';
}

export interface IPlayerAction {
  playerId: string;
  action: string;
  timestamp: Date;
  details?: any;
}

export interface ITimerConfig {
  discuss: number;
  vote: number;
  defend: number;
}
