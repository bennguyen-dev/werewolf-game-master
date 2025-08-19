'use client';

import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import React, { Dispatch, SetStateAction } from 'react';

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
  IGameConfig,
  SortablePlayerSeat,
} from '@/features/setup';
import { Player } from '@/game-core/types/Player';

interface IProps {
  config: IGameConfig;
  setConfig: Dispatch<SetStateAction<IGameConfig>>;
}

export const PlayerArrangementGrid: React.FC<IProps> = ({
  config,
  setConfig,
}) => {
  const { players, numberOfPlayers } = config;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 10 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const onChangePlayer = (index: number, newPlayer: Player) => {
    const updatedPlayers = [...players];
    if (updatedPlayers[index]) {
      updatedPlayers[index] = newPlayer;
      setConfig((prev) => ({ ...prev, players: updatedPlayers }));
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setConfig((prev) => {
        const oldIndex = prev.players.findIndex((p) => p.id === active.id);
        const newIndex = prev.players.findIndex((p) => p.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return prev;
        return {
          ...prev,
          players: arrayMove(prev.players, oldIndex, newIndex),
        };
      });
    }
  };

  const { rows, cols } = calculateGridLayout(numberOfPlayers);
  const grid = arrangePlayersInGrid(players, rows, cols);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Sơ đồ bàn chơi</CardTitle>
        <CardDescription>
          Click vào người chơi để sửa tên. Kéo và thả để thay đổi vị trí.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 md:p-6 flex items-center justify-center">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={players.map((p) => p.id)}
            strategy={rectSortingStrategy}
          >
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
                  const playerIndex = players.findIndex(
                    (p) => p.id === player.id,
                  );
                  return (
                    <SortablePlayerSeat
                      key={player.id}
                      id={player.id}
                      player={player}
                      number={playerIndex + 1}
                      onEdit={(newPlayer) =>
                        onChangePlayer(playerIndex, newPlayer)
                      }
                    />
                  );
                }
                return <div key={`empty-${index}`} className="w-28 h-36" />;
              })}
            </div>
          </SortableContext>
        </DndContext>
      </CardContent>
    </Card>
  );
};
