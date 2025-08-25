'use client';

import { ArrowRight, Eye } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Faction } from '@/game-core/types/enums';

import { IActionFormProps } from './IActionFormProps';

export const SeerActionForm: React.FC<IActionFormProps> = ({
  game,
  onComplete,
  selectedPlayerIds,
  currentRole,
}) => {
  const { submitGroupAction, gameEngine } = game;
  const [seerResult, setSeerResult] = useState<{
    targetName: string;
    revealedFaction: Faction;
  } | null>(null);

  const canSubmit = selectedPlayerIds.length === 1;

  const handleSubmit = () => {
    if (!canSubmit) return;

    const payload = selectedPlayerIds[0];
    const result = submitGroupAction(currentRole.name, payload);

    if (result.success) {
      // The action mutates the engine's state directly.
      // We read the result from the engine instance itself to get the fresh data,
      // avoiding the stale `gameState` from the React hook.
      const freshSeerResult = gameEngine?.gameState.lastSeerResult;

      if (freshSeerResult) {
        setSeerResult({
          targetName: freshSeerResult.targetName,
          revealedFaction: freshSeerResult.revealedFaction,
        });
      } else {
        // Fallback in case the result isn't found, move on
        onComplete();
      }
    }
  };

  const handleAcknowledgeResult = () => {
    setSeerResult(null);
    onComplete();
  };

  if (seerResult) {
    return (
      <div className="p-4 border-t">
        <div className="text-center space-y-2">
          <h3 className="text-md font-semibold flex items-center justify-center gap-2">
            <Eye className="w-5 h-5" />
            Kết quả soi
          </h3>
          <p className="text-lg">
            <span className="font-bold">{seerResult.targetName}</span> là phe{' '}
            <span
              className={`font-bold ${
                seerResult.revealedFaction === Faction.Werewolf
                  ? 'text-red-600'
                  : 'text-green-600'
              }`}
            >
              {seerResult.revealedFaction}
            </span>
          </p>
          <Button onClick={handleAcknowledgeResult} className="w-full">
            Tiếp tục <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium">
        {`Chọn 1 người để xem phe (đã chọn: ${selectedPlayerIds.length}/1)`}
      </div>
      <Button onClick={handleSubmit} disabled={!canSubmit} className="w-full">
        Tiên tri
      </Button>
    </div>
  );
};
