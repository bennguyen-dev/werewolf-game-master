'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PlayerNameEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  playerNumber: number;
  onSave: (newName: string) => void;
}

export const PlayerNameEditDialog: React.FC<PlayerNameEditDialogProps> = ({
  isOpen,
  onClose,
  currentName,
  playerNumber,
  onSave,
}) => {
  const [name, setName] = useState(currentName);

  const handleSave = () => {
    const trimmedName = name.trim();
    if (trimmedName) {
      onSave(trimmedName);
      onClose();
    }
  };

  const handleCancel = () => {
    setName(currentName); // Reset to original name
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  // Reset name when dialog opens
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setName(currentName);
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa tên người chơi</DialogTitle>
          <DialogDescription>
            Nhập tên mới cho người chơi số {playerNumber}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="player-name" className="text-right">
              Tên
            </Label>
            <Input
              id="player-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="col-span-3"
              placeholder={`Player ${playerNumber}`}
              autoFocus
              maxLength={50}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
