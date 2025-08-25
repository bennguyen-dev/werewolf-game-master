'use client';

import React from 'react';

import { Button } from '@/components/ui/button';

import { IActionFormProps } from './IActionFormProps';

export const CupidActionForm: React.FC<IActionFormProps> = ({
  game,
  onComplete,
  selectedPlayerIds,
  currentRole,
}) => {
  const { submitGroupAction } = game;

  const canSubmit = selectedPlayerIds.length === 2;

  const handleSubmit = () => {
    if (!canSubmit) return;

    const payload = {
      target1Id: selectedPlayerIds[0],
      target2Id: selectedPlayerIds[1],
    };
    const result = submitGroupAction(currentRole.name, payload);

    if (result.success) {
      onComplete();
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium">
        {`Chọn 2 người để ghép đôi (đã chọn: ${selectedPlayerIds.length}/2)`}
      </div>
      <Button onClick={handleSubmit} disabled={!canSubmit} className="w-full">
        Ghép đôi
      </Button>
    </div>
  );
};
