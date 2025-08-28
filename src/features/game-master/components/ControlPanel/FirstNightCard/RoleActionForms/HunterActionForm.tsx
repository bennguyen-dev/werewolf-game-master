import React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RoleName } from '@/game-core/types/enums';
import { IHunterActionOptions } from '@/game-core/types/RoleActionOptions';
import { IUseGameReturn } from '@/hooks/useGame';

// Define specific props for this form to align with the new architecture
interface IHunterActionFormProps {
  game: IUseGameReturn;
  selectedPlayerIds: string[];
  setSelectedPlayerIds: React.Dispatch<React.SetStateAction<string[]>>;
}

export const HunterActionForm: React.FC<IHunterActionFormProps> = ({
  game,
  selectedPlayerIds,
  setSelectedPlayerIds,
}) => {
  const { gameState, submitImmediateAction } = game;

  if (!gameState) {
    return null;
  }

  // Find dead hunters who are eligible to shoot.
  const deadHunters = gameState.players.filter(
    (p) => !p.isAlive && p.role?.name === 'Hunter',
  );

  if (deadHunters.length === 0) {
    return null; // No dead hunters, no action.
  }

  const hunter = deadHunters[0];
  const actionOptions = hunter.role?.getActionOptions(gameState, hunter);

  // Do not render if the hunter cannot shoot (e.g., already shot).
  if (!(actionOptions as IHunterActionOptions)?.canShoot) {
    return null;
  }

  const canSubmit = selectedPlayerIds.length === 1;

  const handleSubmit = () => {
    if (!canSubmit) return;

    const targetId = selectedPlayerIds[0];
    const result = submitImmediateAction(RoleName.Hunter, targetId);

    if (result.success) {
      // Clear the selection after the shot is successfully submitted.
      setSelectedPlayerIds([]);
    }
    // TODO: Display error message if result.success is false
  };

  const selectedPlayerName = canSubmit
    ? gameState.getPlayerById(selectedPlayerIds[0])?.name
    : 'mục tiêu';

  return (
    <Card className="w-full border-red-500 bg-red-50/50 mt-4">
      <CardHeader>
        <CardTitle className="text-red-600">
          🏹 Phát Bắn Cuối Cùng - {hunter.name}
        </CardTitle>
        <p className="text-sm text-gray-600">
          Chọn một người chơi trên lưới để bắn. Hành động này không thể hoàn
          tác.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm font-medium">
          {`Chọn 1 người để bắn (đã chọn: ${selectedPlayerIds.length}/1)`}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full bg-red-600 hover:bg-red-700"
        >
          🎯 Bắn {selectedPlayerName}
        </Button>
      </CardContent>
    </Card>
  );
};
