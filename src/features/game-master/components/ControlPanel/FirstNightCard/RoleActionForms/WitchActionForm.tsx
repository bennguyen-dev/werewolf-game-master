'use client';

import { Heart, Skull } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { RoleName } from '@/game-core/types/enums';
import { IWitchActionOptions } from '@/game-core/types/RoleActionOptions';

import { IActionFormProps } from './IActionFormProps';

export const WitchActionForm: React.FC<IActionFormProps> = ({
  game,
  onComplete,
  selectedPlayerIds,
}) => {
  const { gameState, getRoleActionOptions, submitGroupAction } = game;

  const [healDecision, setHealDecision] = useState<'heal' | 'no-heal'>(
    'no-heal',
  );
  const [witchOptions, setWitchOptions] = useState<IWitchActionOptions | null>(
    null,
  );

  useEffect(() => {
    const options = getRoleActionOptions(RoleName.Witch);
    if (options) {
      setWitchOptions(options as IWitchActionOptions);
    }
  }, [getRoleActionOptions]);

  const handleSubmit = () => {
    if (!gameState) return;

    const payload = {
      healTarget: healDecision === 'heal' ? witchOptions?.deadPlayerId : null,
      poisonTarget:
        selectedPlayerIds.length === 1 ? selectedPlayerIds[0] : null,
    };

    const result = submitGroupAction(RoleName.Witch, payload);

    if (result.success) {
      onComplete();
    }
  };

  if (!gameState || !witchOptions) return null;

  const deadPlayerId = witchOptions.deadPlayerId;
  const deadPlayer = deadPlayerId
    ? gameState.getPlayerById(deadPlayerId)
    : null;

  const canUseHealPotion = witchOptions.hasHealPotion && deadPlayer;
  const canUsePoisonPotion = witchOptions.hasPoisonPotion;

  return (
    <div className="space-y-4">
      {/* Heal Potion Card */}
      <Card
        className={!canUseHealPotion ? 'opacity-50 pointer-events-none' : ''}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Heart className="text-red-500" /> Bình Máu
          </CardTitle>
        </CardHeader>
        <CardContent>
          {canUseHealPotion ? (
            <RadioGroup
              value={healDecision}
              onValueChange={(value: 'heal' | 'no-heal') => {
                setHealDecision(value);
              }}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="heal" id="r-heal" />
                <Label htmlFor="r-heal">Cứu {deadPlayer?.name}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no-heal" id="r-no-heal" />
                <Label htmlFor="r-no-heal">Không cứu</Label>
              </div>
            </RadioGroup>
          ) : (
            <p className="text-sm text-muted-foreground">
              {witchOptions.hasHealPotion
                ? 'Không có ai bị giết đêm nay.'
                : 'Đã hết bình máu.'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Poison Potion Card */}
      <Card
        className={!canUsePoisonPotion ? 'opacity-50 pointer-events-none' : ''}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Skull className="text-gray-600" /> Bình Độc
          </CardTitle>
        </CardHeader>
        <CardContent>
          {canUsePoisonPotion ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Click vào một người chơi ở lưới bên phải để chọn mục tiêu đầu
                độc.
              </p>
              <p className="text-sm font-medium">
                {selectedPlayerIds.length === 1
                  ? `Sẽ đầu độc: ${gameState.getPlayerById(selectedPlayerIds[0])?.name}`
                  : 'Chưa chọn ai.'}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Đã hết bình độc.</p>
          )}
        </CardContent>
      </Card>

      <Button onClick={handleSubmit} className="w-full" size="lg">
        Xác nhận hành động
      </Button>
    </div>
  );
};
