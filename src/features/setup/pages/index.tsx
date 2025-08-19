'use client';

import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import {
  GameConfigurationForm,
  IGameConfig,
  INITIAL_CONFIG,
  PlayerArrangementGrid,
} from '@/features/setup';
import { getSuggestedRoleSetups } from '@/game-core/config/RoleSuggestions';
import { Player } from '@/game-core/types/Player';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';

export const SetupPage = () => {
  const [config, setConfig] = useLocalStorage<IGameConfig>(
    'werewolf-gm-config',
    INITIAL_CONFIG,
  );

  // Effect to update role suggestions when player count or game type changes
  useEffect(() => {
    if (config.numberOfPlayers > 0) {
      const suggestions = getSuggestedRoleSetups(
        config.numberOfPlayers,
        config.type,
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
  }, [config.numberOfPlayers, config.type, setConfig]);

  // Effect to sync players array with player count
  useEffect(() => {
    setConfig((prev) => {
      const currentPlayers = prev.players;
      const targetCount = prev.numberOfPlayers;

      if (currentPlayers.length === targetCount) {
        return prev; // No changes needed
      }

      let newPlayers: Player[];

      if (currentPlayers.length < targetCount) {
        // Add new players
        const playersToAdd = targetCount - currentPlayers.length;
        const newPlayerEntries: Player[] = Array.from(
          { length: playersToAdd },
          (_, index) => ({
            id: crypto.randomUUID(),
            name: `Player ${currentPlayers.length + index + 1}`,
            role: null,
            isAlive: true,
            isProtected: false,
            isCursedByWerewolf: false,
            isSilenced: false,
            isUsedWitchHeal: false,
            isMarkedForDeath: false,
            lover: null,
          }),
        );
        newPlayers = [...currentPlayers, ...newPlayerEntries];
      } else {
        // Remove players from the end
        newPlayers = currentPlayers.slice(0, targetCount);
      }

      return { ...prev, players: newPlayers };
    });
  }, [config.numberOfPlayers, setConfig]);

  const isConfigValid = () => {
    if (!config.name || config.numberOfPlayers === 0) return false;
    if (config.players.length !== config.numberOfPlayers) return false;
    if (config.players.some((p) => !p.name.trim())) return false;

    const totalRoles = Object.values(config.roles).reduce(
      (sum, count) => sum + (count || 0),
      0,
    );
    if (totalRoles !== config.numberOfPlayers) return false;

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
            <GameConfigurationForm config={config} setConfig={setConfig} />
          </div>
          <div className="lg:col-span-2">
            <PlayerArrangementGrid config={config} setConfig={setConfig} />
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
};
