import { IGameConfig } from '@/features/setup';

export const INITIAL_CONFIG: IGameConfig = {
  name: '',
  numberOfPlayers: 0,
  type: 'balanced',
  players: [],
  roles: {},
  timeSettings: {
    discuss: 300,
    vote: 60,
    defend: 120,
  },
};
