'use client';

import React, { useEffect, useState } from 'react';

import {
  FirstNightCard,
  HistoryCard,
  MorningResultsCard,
} from '@/features/game-master/components/ControlPanel';
import { PlayerGrid } from '@/features/game-master/components/PlayerGrid';
import { IGameConfig, INITIAL_CONFIG } from '@/features/setup';
import { GamePhase } from '@/game-core/types/enums';
import { useGame } from '@/hooks/useGame';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface IProps {}

export const GameMasterPage: React.FC<IProps> = ({}) => {
  const game = useGame();
  const [config] = useLocalStorage<IGameConfig>(
    'werewolf-gm-config',
    INITIAL_CONFIG,
  );
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);

  const handleStartDayDiscussion = () => {
    // TODO: Implement transition to day discussion phase
    console.log('Starting day discussion...');
  };

  const renderControlCard = () => {
    // Single source of truth - only use gameState.phase
    const currentPhase = game.gameState?.phase;

    // Show MorningResultsCard if we're in day phase (after any night)
    if (currentPhase === GamePhase.Day_Discuss) {
      return (
        <MorningResultsCard
          game={game}
          onStartDayDiscussion={handleStartDayDiscussion}
        />
      );
    }

    // Default to FirstNightCard for night phase
    return (
      <FirstNightCard
        game={game}
        config={config}
        selectedPlayerIds={selectedPlayerIds}
        setSelectedPlayerIds={setSelectedPlayerIds}
      />
    );
  };

  useEffect(() => {
    if (!game.gameEngine && config?.players?.length) {
      game.initializeGame(config.players);
    }
  }, [config, game]);

  useEffect(() => {
    if (game.gameState?.phase === 'SETUP' && game.gameEngine) {
      game.startFirstNight();
    }
  }, [game, game.gameEngine]);

  return (
    <main className="flex min-h-screen w-full flex-col items-center p-8 md:p-12 lg:p-16 bg-muted/40">
      <div className="w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
          <div className="lg:col-span-1 space-y-6">
            {renderControlCard()}

            <HistoryCard gameHistory={game.gameHistory} />
          </div>

          <div className="lg:col-span-2">
            <PlayerGrid
              players={game.gameState?.players || []}
              selectedPlayerIds={selectedPlayerIds}
              setSelectedPlayerIds={setSelectedPlayerIds}
            />
          </div>
        </div>
      </div>
    </main>
  );
};
