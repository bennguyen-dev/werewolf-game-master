'use client';

import React from 'react';

import { Button } from '@/components/ui/button';

import { IActionFormProps } from './IActionFormProps';

export const BodyguardActionForm: React.FC<IActionFormProps> = ({
  game,
  onComplete,
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
        {`Chọn 1 người để bảo vệ (đã chọn: ${selectedPlayerIds.length}/1)`}
      </div>
      <Button onClick={handleSubmit} disabled={!canSubmit} className="w-full">
        Xác nhận bảo vệ
      </Button>
    </div>
  );
};
