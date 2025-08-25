'use client';

import { ArrowRight, Check, Moon } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { IGameConfig } from '@/features/setup';
import { RoleName } from '@/game-core/types/enums';
import { IUseGameReturn } from '@/hooks/useGame';

import {
  BodyguardActionForm,
  CupidActionForm,
  SeerActionForm,
  WerewolfActionForm,
  WitchActionForm,
} from './RoleActionForms';

interface IProps {
  game: IUseGameReturn;
  config: IGameConfig;
  selectedPlayerIds: string[];
  setSelectedPlayerIds: (playerIds: string[]) => void;
}

type FirstNightStep = 'assign' | 'action' | 'completed';

export const FirstNightCard: React.FC<IProps> = ({
  game,
  config,
  selectedPlayerIds,
  setSelectedPlayerIds,
}) => {
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState<FirstNightStep>('assign');
  const [completedRoles, setCompletedRoles] = useState<Set<RoleName>>(
    new Set(),
  );

  const {
    gameState,
    assignRoleToPlayers,
    resolveNight,
    checkIfRoleCanAct,
    getFirstNightTurnOrder,
  } = game;

  // Guard against missing config or roleSetup
  if (!gameState || !config.roles) return null;

  const firstNightRoles = getFirstNightTurnOrder();
  const currentRole = firstNightRoles[currentRoleIndex];
  const isAllCompleted = currentRoleIndex >= firstNightRoles.length;

  const getRequiredPlayerCount = (roleName: RoleName): number => {
    return config.roles[roleName] || 1;
  };

  const moveToNextRole = () => {
    if (!currentRole) return;
    setCompletedRoles((prev) => new Set([...prev, currentRole.name]));
    setSelectedPlayerIds([]);
    setCurrentStep('assign');
    setCurrentRoleIndex((prev) => prev + 1);
  };

  const handleAssignRole = () => {
    if (!currentRole) return;

    const playersToAssign =
      currentRole.name === RoleName.Villager
        ? gameState.players.filter((p) => !p.role).map((p) => p.id)
        : selectedPlayerIds;

    if (playersToAssign.length === 0) return;

    const result = assignRoleToPlayers(playersToAssign, currentRole.name);

    if (result.success) {
      setSelectedPlayerIds([]);
      const playerWithRole = gameState.players.find(
        (p) => p.role?.name === currentRole.name,
      );
      if (playerWithRole && playerWithRole.role) {
        const actionOptions = playerWithRole.role.getActionOptions(
          gameState,
          playerWithRole,
        );
        const canAct = checkIfRoleCanAct(actionOptions);

        if (canAct) {
          setCurrentStep('action');
        } else {
          moveToNextRole();
        }
      } else {
        moveToNextRole();
      }
    }
  };

  const handleResolveNight = () => {
    const result = resolveNight();
    if (result.success) {
      setCurrentStep('completed');
    }
  };

  const canAssignRole = () => {
    if (!currentRole) return false;

    if (currentRole.name === RoleName.Villager) {
      return true;
    }

    const requiredCount = getRequiredPlayerCount(currentRole.name);
    return selectedPlayerIds.length === requiredCount;
  };

  const getSelectionRequirement = () => {
    if (!currentRole) return '';

    if (currentRole.name === RoleName.Villager) {
      return `Gán vai trò cho tất cả người chơi còn lại`;
    }

    const requiredCount = getRequiredPlayerCount(currentRole.name);
    return `Chọn ${requiredCount} người làm ${currentRole.name} (đã chọn: ${selectedPlayerIds.length}/${requiredCount})`;
  };

  const renderActionForm = () => {
    if (!currentRole) return null;

    const props = {
      game,
      onComplete: moveToNextRole,
      onSkip: moveToNextRole,
      selectedPlayerIds,
      setSelectedPlayerIds,
      currentRole,
    };

    switch (currentRole.name) {
      case RoleName.Werewolf:
        return <WerewolfActionForm {...props} />;
      case RoleName.Bodyguard:
        return <BodyguardActionForm {...props} />;
      case RoleName.Cupid:
        return <CupidActionForm {...props} />;
      case RoleName.Seer:
        return <SeerActionForm {...props} />;
      case RoleName.Witch:
        return <WitchActionForm {...props} />;
      default:
        return (
          <div className="text-sm text-muted-foreground">
            Vai trò này không có hành động trong đêm đầu tiên.
          </div>
        );
    }
  };

  // --- RENDER LOGIC ---

  if (isAllCompleted && currentStep !== 'completed') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon /> Hoàn thành lượt
          </CardTitle>
          <CardDescription>
            Tất cả vai trò đã thực hiện hành động.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleResolveNight} className="w-full" size="lg">
            <ArrowRight className="w-4 h-4 mr-2" />
            Kết thúc đêm đầu tiên
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (currentStep === 'completed') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Check className="text-green-600" /> Đêm đầu tiên hoàn thành
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!currentRole) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Moon /> Đêm đầu tiên
        </CardTitle>
        <CardDescription>
          Bước {currentRoleIndex + 1}/{firstNightRoles.length}:{' '}
          {currentRole.name}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
          <div>
            <div className="font-medium">{currentRole.name}</div>
            <div className="text-sm text-muted-foreground">
              {currentRole.description}
            </div>
          </div>
        </div>

        {currentStep === 'assign' ? (
          <div className="space-y-4">
            <div className="text-sm font-medium">
              {getSelectionRequirement()}
            </div>
            <Button
              onClick={handleAssignRole}
              className="w-full"
              disabled={!canAssignRole()}
            >
              Gán vai trò
            </Button>
          </div>
        ) : (
          renderActionForm()
        )}
      </CardContent>
    </Card>
  );
};
