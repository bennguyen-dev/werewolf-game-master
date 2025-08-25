'use client';

import React from 'react';

import { Button } from '@/components/ui/button';

import { IActionFormProps } from './IActionFormProps';

export const WerewolfActionForm: React.FC<IActionFormProps> = ({
  game,
  onComplete,
  onSkip,
  selectedPlayerIds,
  currentRole,
}) => {
  const { submitGroupAction } = game;

  const canSubmit = selectedPlayerIds.length === 1;

  const handleSubmit = () => {
    if (!canSubmit) return;

    const payload = selectedPlayerIds[0];
    const result = submitGroupAction(currentRole.name, payload);

    if (result.success) {
      onComplete();
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium">
        {`Chọn 1 người để cắn (đã chọn: ${selectedPlayerIds.length}/1)`}
      </div>
      <div className="flex gap-2">
        <Button onClick={handleSubmit} disabled={!canSubmit} className="flex-1">
          Xác nhận cắn
        </Button>
        {onSkip && (
          <Button onClick={onSkip} variant="outline" className="flex-1">
            Bỏ qua
          </Button>
        )}
      </div>
    </div>
  );
};
