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
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { GameConfig, Player } from '../GameSetupPage';
import { PlayerSeat } from './PlayerSeat';

const getGridLayout = (playerCount: number) => {
  if (playerCount <= 6) return { rows: 1, cols: playerCount };
  if (playerCount <= 8) return { rows: 3, cols: 4 }; // 2 players on sides
  if (playerCount <= 10) return { rows: 3, cols: 4 }; // 2 players on sides
  if (playerCount <= 12) return { rows: 3, cols: 5 }; // 2 players on sides
  if (playerCount <= 14) return { rows: 4, cols: 5 }; // 3 players on sides
  if (playerCount <= 16) return { rows: 4, cols: 6 }; // 3 players on sides
  if (playerCount <= 18) return { rows: 5, cols: 6 }; // 3 players on sides

  // For larger counts, prioritize keeping rows at 5 (3 side players)
  const cols = Math.ceil((playerCount + 4) / 2 / 2) + 1;
  return { rows: 5, cols };
};

interface SeatingChartProps {
  config: GameConfig;
  setConfig: (config: GameConfig | ((prev: GameConfig) => GameConfig)) => void;
}

export const SeatingChart: React.FC<SeatingChartProps> = ({
  config,
  setConfig,
}) => {
  const { players, playerCount } = config;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 10 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handlePlayerNameChange = (playerIndex: number, newName: string) => {
    const updatedPlayers = [...players];
    if (updatedPlayers[playerIndex]) {
      updatedPlayers[playerIndex].name = newName;
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

  const { rows, cols } = getGridLayout(playerCount);
  const grid: (Player | null)[] = Array(rows * cols).fill(null);
  let playerIdx = 0;

  const placePlayer = (r: number, c: number) => {
    if (playerIdx < players.length && grid[r * cols + c] === null) {
      grid[r * cols + c] = players[playerIdx];
      playerIdx++;
    }
  };

  if (rows === 1) {
    // Single row layout
    for (let c = 0; c < cols; c++) placePlayer(0, c);
  } else {
    // Clockwise for hollow rectangle
    // Top row, left to right
    for (let c = 0; c < cols; c++) placePlayer(0, c);
    // Right column, top to bottom
    for (let r = 1; r < rows; r++) placePlayer(r, cols - 1);
    // Bottom row, right to left
    for (let c = cols - 2; c >= 0; c--) placePlayer(rows - 1, c);
    // Left column, bottom to top
    for (let r = rows - 2; r > 0; r--) placePlayer(r, 0);
  }

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
                    <SortablePlayer
                      key={player.id}
                      id={player.id}
                      player={player}
                      seatNumber={playerIndex + 1}
                      onPlayerNameChange={(newName) =>
                        handlePlayerNameChange(playerIndex, newName)
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

interface SortablePlayerProps {
  id: string;
  player: Player;
  seatNumber: number;
  onPlayerNameChange: (name: string) => void;
}

const SortablePlayer: React.FC<SortablePlayerProps> = ({
  id,
  player,
  seatNumber,
  onPlayerNameChange,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
    gridColumn: 'span 1',
    gridRow: 'span 1',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <PlayerSeat
        seatNumber={seatNumber}
        playerName={player.name}
        onPlayerNameChange={onPlayerNameChange}
      />
    </div>
  );
};
