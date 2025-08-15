'use client';

import { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PlayerSeatProps {
  seatNumber: number;
  playerName: string;
  onPlayerNameChange: (name: string) => void;
  // We pass down the dnd-kit props to the root element
  [key: string]: any;
}

export const PlayerSeat: React.FC<PlayerSeatProps> = ({
  seatNumber,
  playerName,
  onPlayerNameChange,
  ...props
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(playerName);

  const handleSave = () => {
    onPlayerNameChange(name);
    setIsEditing(false);
  };

  // Clicks on buttons should not trigger drag
  const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div
      className="flex flex-col items-center gap-2 w-28 text-center p-2 bg-background rounded-lg shadow"
      {...props}
    >
      <Avatar
        className="w-16 h-16 border-2 border-dashed border-muted-foreground hover:border-primary cursor-pointer"
        onClick={() => setIsEditing(true)}
      >
        <AvatarImage
          src={`https://api.dicebear.com/8.x/adventurer/svg?seed=${name || 'placeholder'}`}
        />
        <AvatarFallback>{seatNumber}</AvatarFallback>
      </Avatar>
      {isEditing ? (
        <div className="flex flex-col gap-1 w-full">
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            onMouseDown={stopPropagation} // Prevent drag from starting on input click
            onClick={stopPropagation} // Prevent any other click handlers
            autoFocus
            className="h-8 text-center"
          />
          <Button
            size="sm"
            onClick={handleSave}
            onMouseDown={stopPropagation} // Prevent drag from starting on button click
            className="h-7"
          >
            Save
          </Button>
        </div>
      ) : (
        <p
          className="font-medium truncate w-full h-12 flex items-center justify-center"
          onClick={() => setIsEditing(true)}
        >
          {playerName || `Seat ${seatNumber}`}
        </p>
      )}
    </div>
  );
};
