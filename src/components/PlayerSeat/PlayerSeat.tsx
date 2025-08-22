'use client';

import { Eye, Heart, Shield, Skull } from 'lucide-react';
import { FC, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Player } from '@/game-core/types/Player';

import { PlayerNameEditDialog } from './PlayerNameEditDialog';

export interface IPlayerSeatProps {
  player: Player;
  index?: number;
  onEdit?: (data: Player) => void;
  onClick?: () => void;
  className?: string;
  selected?: boolean;
}

export const PlayerSeat: FC<IPlayerSeatProps> = ({
  index,
  player,
  onEdit,
  onClick,
  className = '',
  selected = false,
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

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      handleEditClick();
    }
  };

  const getPlayerStatus = () => {
    if (!player.isAlive) return 'Đã chết';
    if (player.isProtected) return 'Được bảo vệ';
    if (player.isMarkedForDeath) return 'Sắp chết';
    if (player.isSilenced) return 'Bị câm';
    return 'Còn sống';
  };

  const getPlayerStatusColor = () => {
    if (!player.isAlive) return 'text-red-500';
    if (player.isProtected) return 'text-blue-500';
    if (player.isMarkedForDeath) return 'text-orange-500';
    if (player.isSilenced) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getStatusIcon = () => {
    if (!player.isAlive) return <Skull className="w-3 h-3" />;
    if (player.isProtected) return <Shield className="w-3 h-3" />;
    if (player.lover) return <Heart className="w-3 h-3" />;
    return null;
  };

  const getRoleIcon = () => {
    switch (player.role?.name) {
      case 'Seer':
        return <Eye className="w-3 h-3" />;
      default:
        return null;
    }
  };

  return (
    <>
      <div
        className={`
          flex flex-col items-center gap-2 w-28 text-center p-2 rounded-lg shadow transition-all cursor-pointer
          ${
            selected
              ? 'bg-primary text-primary-foreground ring-2 ring-primary'
              : 'bg-background hover:shadow-md'
          }
          ${!player.isAlive ? 'opacity-60' : ''}
          ${className}
        `}
        onClick={handleClick}
      >
        {/* Avatar with Status Icon */}
        <div className="relative">
          <Avatar className="w-16 h-16 border-2 border-dashed border-muted-foreground">
            <AvatarImage
              src={`https://api.dicebear.com/8.x/adventurer/svg?seed=${player.name || 'placeholder'}`}
              alt={`Avatar for ${player.name || `Player ${index}`}`}
            />
            <AvatarFallback>{index}</AvatarFallback>
          </Avatar>

          {/* Status Icon Overlay */}
          {getStatusIcon() && (
            <div className="absolute -top-1 -right-1 bg-background rounded-full p-1 border">
              {getStatusIcon()}
            </div>
          )}
        </div>

        {/* Player Name */}
        <p
          className="font-medium truncate w-full text-sm"
          title={player.name || `Seat ${index}`}
        >
          {player.name || `Player ${index}`}
        </p>

        {/* Role Badge (if showing roles) */}
        {player.role && (
          <Badge
            variant="secondary"
            className="text-xs flex items-center gap-1"
          >
            {getRoleIcon()}
            {player.role.name}
          </Badge>
        )}

        {/* Status Text */}
        <p className={`text-xs ${getPlayerStatusColor()}`}>
          {getPlayerStatus()}
        </p>

        {/* Lover indicator */}
        {player.lover && (
          <div className="flex items-center gap-1 text-xs text-pink-500">
            <Heart className="w-3 h-3 fill-current" />
            <span>Yêu {player.lover.name}</span>
          </div>
        )}
      </div>

      <PlayerNameEditDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        currentName={player.name}
        index={index}
        onSave={handleSave}
      />
    </>
  );
};
