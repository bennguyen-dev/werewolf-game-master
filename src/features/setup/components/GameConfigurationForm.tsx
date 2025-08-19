'use client';

import React, { Dispatch, SetStateAction } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { IGameConfig } from '@/features/setup';
import { GameType, gameTypeNames } from '@/game-core/config/RoleSuggestions';
import { RoleName } from '@/game-core/types/enums';

interface IProps {
  config: IGameConfig;
  setConfig: Dispatch<SetStateAction<IGameConfig>>;
}

export const GameConfigurationForm: React.FC<IProps> = ({
  config,
  setConfig,
}) => {
  const { name, numberOfPlayers, type, roles, timeSettings } = config;

  const handleFieldChange = (field: keyof IGameConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleTimeChange = (
    field: keyof typeof timeSettings,
    value: string,
  ) => {
    const numericValue = Number(value);
    if (!isNaN(numericValue) && numericValue >= 0) {
      setConfig((prev) => ({
        ...prev,
        timeSettings: { ...prev.timeSettings, [field]: numericValue },
      }));
    }
  };

  const handleRoleCountChange = (roleName: RoleName, change: number) => {
    const currentCount = roles[roleName] || 0;
    const newCount = Math.max(0, currentCount + change);
    setConfig((prev) => ({
      ...prev,
      roles: { ...prev.roles, [roleName]: newCount },
    }));
  };

  const totalRoles = Object.values(roles).reduce(
    (sum, count) => sum + (count || 0),
    0,
  );

  const isRoleCountValid = totalRoles === numberOfPlayers;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Cấu hình ván chơi</CardTitle>
        <CardDescription>
          Thiết lập các thông số cho ván Ma Sói của bạn.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Game Name */}
        <div className="space-y-2">
          <Label htmlFor="game-name">Tên phiên Game</Label>
          <Input
            id="game-name"
            placeholder="Game tối thứ 7..."
            value={name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
          />
        </div>

        {/* Player Count and Game Type */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="player-count">Số người chơi</Label>
            <Select
              onValueChange={(value) =>
                handleFieldChange('numberOfPlayers', Number(value))
              }
              value={numberOfPlayers > 0 ? String(numberOfPlayers) : ''}
            >
              <SelectTrigger id="player-count">
                <SelectValue placeholder="Chọn số lượng" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 15 }, (_, i) => i + 6).map((num) => (
                  <SelectItem key={num} value={String(num)}>
                    {num} người
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="game-type">Thể loại</Label>
            <Select
              onValueChange={(value) =>
                handleFieldChange('type', value as GameType)
              }
              value={type}
            >
              <SelectTrigger id="game-type">
                <SelectValue placeholder="Chọn thể loại" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(gameTypeNames).map(([key, name]) => (
                  <SelectItem key={key} value={key}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Role Configuration */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label>Cấu hình vai trò</Label>
            <span
              className={`text-sm font-medium ${
                !isRoleCountValid ? 'text-destructive' : 'text-muted-foreground'
              }`}
            >
              {totalRoles}/{numberOfPlayers || '?'}
            </span>
          </div>
          <div className="p-4 border rounded-md bg-muted space-y-2 min-h-[100px]">
            {Object.keys(roles).length > 0 ? (
              Object.entries(roles).map(
                ([roleName, count]) =>
                  count > 0 && (
                    <div
                      key={roleName}
                      className="flex items-center justify-between"
                    >
                      <span className="capitalize">
                        {roleName.replace(/_/g, ' ')}
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() =>
                            handleRoleCountChange(roleName as RoleName, -1)
                          }
                          disabled={count <= 0}
                        >
                          -
                        </Button>
                        <span className="font-mono w-4 text-center">
                          {count}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() =>
                            handleRoleCountChange(roleName as RoleName, 1)
                          }
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  ),
              )
            ) : (
              <p className="text-sm text-muted-foreground text-center pt-4">
                {numberOfPlayers > 0
                  ? 'Không có gợi ý cho cấu hình này.'
                  : 'Chọn số lượng người chơi để xem gợi ý.'}
              </p>
            )}
          </div>
          {!isRoleCountValid && numberOfPlayers > 0 && (
            <p className="text-sm text-destructive">
              Tổng số vai trò phải bằng số người chơi ({numberOfPlayers}).
            </p>
          )}
        </div>

        {/* Time Settings */}
        <div className="space-y-4">
          <Label>Cài đặt thời gian (giây)</Label>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="time-discuss" className="text-sm font-normal">
                Thảo luận
              </Label>
              <Input
                id="time-discuss"
                type="number"
                min="0"
                value={timeSettings.discuss}
                onChange={(e) => handleTimeChange('discuss', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time-vote" className="text-sm font-normal">
                Bỏ phiếu
              </Label>
              <Input
                id="time-vote"
                type="number"
                min="0"
                value={timeSettings.vote}
                onChange={(e) => handleTimeChange('vote', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time-defend" className="text-sm font-normal">
                Biện hộ
              </Label>
              <Input
                id="time-defend"
                type="number"
                min="0"
                value={timeSettings.defend}
                onChange={(e) => handleTimeChange('defend', e.target.value)}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
