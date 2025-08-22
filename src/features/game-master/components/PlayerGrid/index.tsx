'use client';

import React from 'react';

import { PlayerSeat } from '@/components/PlayerSeat';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  arrangePlayersInGrid,
  calculateGridLayout,
} from '@/features/game-master/utils';
import { Player } from '@/game-core/types/Player';

interface IProps {
  players: Player[];
  title?: string;
  description?: string;
  selectedPlayerIds: string[];
  setSelectedPlayerIds: (player: string[]) => void;
}

export const PlayerGrid: React.FC<IProps> = ({
  players,
  selectedPlayerIds,
  setSelectedPlayerIds,
  title = 'Sơ đồ người chơi',
  description = 'Click vào người chơi để chọn. Trạng thái hiện tại của từng người.',
}) => {
  const { rows, cols } = calculateGridLayout(players.length);
  const grid = arrangePlayersInGrid(players, rows, cols);

  const onClickPlayer = (playerId: string) => {
    setSelectedPlayerIds(
      selectedPlayerIds.includes(playerId)
        ? selectedPlayerIds.filter((id) => id !== playerId)
        : [...selectedPlayerIds, playerId],
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Còn sống: {players.filter((p) => p.isAlive).length}</span>
            <span>Đã chết: {players.filter((p) => !p.isAlive).length}</span>
          </div>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 md:p-6 flex items-center justify-center">
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
            width: '100%',
            maxWidth: `${cols * 8}rem`,
          }}
        >
          {grid.map((player, index) => {
            if (player) {
              return (
                <PlayerSeat
                  key={player.id}
                  player={player}
                  index={index}
                  selected={selectedPlayerIds.includes(player.id)}
                  onClick={() => onClickPlayer(player.id)}
                />
              );
            }
            return <div key={`empty-${index}`} className="w-28 h-36" />;
          })}
        </div>
      </CardContent>
    </Card>
  );
};
