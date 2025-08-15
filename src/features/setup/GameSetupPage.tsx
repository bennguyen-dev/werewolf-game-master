'use client';

import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import {
  GameType,
  getSuggestedRoleSetups,
  RoleSetup,
} from '@/game-core/config/RoleSuggestions';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';

import { SeatingChart } from './components/SeatingChart';
import { SetupPanel } from './components/SetupPanel';

export interface Player {
  id: string;
  name: string;
}

interface TimeSettings {
  discuss: number;
  vote: number;
  defend: number;
}

export interface GameConfig {
  gameName: string;
  playerCount: number;
  gameType: GameType;
  players: Player[];
  roles: RoleSetup;
  timeSettings: TimeSettings;
  setupName: string;
  setupDescription: string;
}

const initialConfig: GameConfig = {
  gameName: '',
  playerCount: 0,
  gameType: 'balanced',
  players: [],
  roles: {},
  timeSettings: {
    discuss: 300,
    vote: 60,
    defend: 120,
  },
  setupName: '',
  setupDescription: '',
};

export default function GameSetupPage() {
  const [config, setConfig] = useLocalStorage<GameConfig>(
    'werewolf-gm-config',
    initialConfig,
  );

  // Effect to update role suggestions when player count or game type changes
  useEffect(() => {
    if (config.playerCount > 0) {
      const suggestions = getSuggestedRoleSetups(
        config.playerCount,
        config.gameType,
      );
      if (suggestions.length > 0) {
        const suggestion = suggestions[0];
        setConfig((prevConfig) => ({
          ...prevConfig,
          roles: suggestion.setup,
          setupName: suggestion.name,
          setupDescription: suggestion.description,
        }));
      } else {
        setConfig((prevConfig) => ({
          ...prevConfig,
          roles: {},
          setupName: 'Tùy chỉnh',
          setupDescription: 'Không có gợi ý nào cho lựa chọn này.',
        }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.playerCount, config.gameType]);

  // Effect to sync players array with player count
  useEffect(() => {
    setConfig((prev) => {
      const currentPlayers = prev.players;
      const targetCount = prev.playerCount;

      if (currentPlayers.length === targetCount) {
        return prev; // No changes needed
      }

      let newPlayers: Player[];

      if (currentPlayers.length < targetCount) {
        // Add new players
        const playersToAdd = targetCount - currentPlayers.length;
        const newPlayerEntries = Array.from({ length: playersToAdd }, () => ({
          id: crypto.randomUUID(),
          name: '',
        }));
        newPlayers = [...currentPlayers, ...newPlayerEntries];
      } else {
        // Remove players from the end
        newPlayers = currentPlayers.slice(0, targetCount);
      }

      return { ...prev, players: newPlayers };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.playerCount]);

  const isConfigValid = () => {
    if (!config.gameName || config.playerCount === 0) return false;
    if (config.players.length !== config.playerCount) return false;
    if (config.players.some((p) => !p.name.trim())) return false;

    const totalRoles = Object.values(config.roles).reduce(
      (sum, count) => sum + (count || 0),
      0,
    );
    if (totalRoles !== config.playerCount) return false;

    return true;
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center p-8 md:p-12 lg:p-16 bg-muted/40">
      <div className="w-full max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Tạo ván chơi mới</h1>
        <p className="text-muted-foreground mb-8">
          Bắt đầu bằng việc điền các thông tin cơ bản dưới đây.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
          <div className="lg:col-span-1">
            <SetupPanel config={config} setConfig={setConfig} />
          </div>
          <div className="lg:col-span-2">
            <SeatingChart config={config} setConfig={setConfig} />
          </div>
        </div>

        <div className="mt-8 flex justify-end w-full">
          <Button size="lg" disabled={!isConfigValid()}>
            Tiếp tục
          </Button>
        </div>
      </div>
    </main>
  );
}
