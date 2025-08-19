import { GameType, RoleSetup } from '@/game-core/config/RoleSuggestions';
import { Player } from '@/game-core/types/Player';

export interface IGameConfig {
  name: string;
  description?: string;

  numberOfPlayers: number;
  type: GameType;
  players: Player[];
  roles: RoleSetup;

  timeSettings: {
    discuss: number;
    vote: number;
    defend: number;
  };
}
