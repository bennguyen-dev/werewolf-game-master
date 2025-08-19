'use client';

import { FC, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Player } from '@/game-core/types/Player';

import { PlayerNameEditDialog } from './PlayerNameEditDialog';

export interface IPlayerSeatProps {
  number: number;
  player: Player;
  onEdit?: (data: Player) => void;
  className?: string;
  // Allow passing through additional props for drag-and-drop or other functionality
  [key: string]: any;
}

export const PlayerSeat: FC<IPlayerSeatProps> = ({
  number,
  player,
  onEdit,
  className = '',
  ...props
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const handleSave = (newName: string) => {
    if (onEdit) {
      onEdit({ ...player, name: newName });
    }
  };

  const handleEditClick = () => {
    setIsDialogOpen(true);
  };

  // Prevent event propagation for interactive elements
  const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <>
      <div
        className={`flex flex-col items-center gap-2 w-28 text-center p-2 bg-background rounded-lg shadow hover:shadow-md transition-shadow ${className}`}
        {...props}
      >
        <Avatar
          className="w-16 h-16 border-2 border-dashed border-muted-foreground hover:border-primary cursor-pointer transition-colors"
          onClick={(e) => {
            stopPropagation(e);
            handleEditClick();
          }}
        >
          <AvatarImage
            src={`https://api.dicebear.com/8.x/adventurer/svg?seed=${player.name || 'placeholder'}`}
            alt={`Avatar for ${player.name || `Player ${number}`}`}
          />
          <AvatarFallback>{number}</AvatarFallback>
        </Avatar>

        <p
          className="font-medium truncate w-full h-12 flex items-center justify-center cursor-pointer hover:text-primary transition-colors"
          onClick={(e) => {
            stopPropagation(e);
            handleEditClick();
          }}
          title={player.name || `Seat ${number}`}
        >
          {player.name || `Seat ${number}`}
        </p>
      </div>

      <PlayerNameEditDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        currentName={player.name}
        playerNumber={number}
        onSave={handleSave}
      />
    </>
  );
};
