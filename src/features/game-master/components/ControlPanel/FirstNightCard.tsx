'use client';

import { ArrowRight, Check, Eye, Moon } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Faction, RoleName } from '@/game-core/types/enums';
import { IUseGameReturn } from '@/hooks/useGame';

interface IProps {
  game: IUseGameReturn;
  selectedPlayerIds: string[];
  setSelectedPlayerIds: (playerIds: string[]) => void;
}

type FirstNightStep =
  | 'assign'
  | 'action'
  | 'witch-heal'
  | 'witch-poison'
  | 'completed';

export const FirstNightCard: React.FC<IProps> = ({
  game,
  selectedPlayerIds,
  setSelectedPlayerIds,
}) => {
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState<FirstNightStep>('assign');
  const [completedRoles, setCompletedRoles] = useState<Set<RoleName>>(
    new Set(),
  );
  const [seerResult, setSeerResult] = useState<{
    targetName: string;
    revealedFaction: Faction;
  } | null>(null);
  const [witchActions, setWitchActions] = useState<{
    willHeal: boolean;
    poisonTarget: string | null;
  }>({ willHeal: false, poisonTarget: null });

  const {
    gameState,
    assignRoleToPlayers,
    submitGroupAction,
    resolveNight,
    checkIfRoleCanAct,
    getRoleActionOptions,
  } = game;

  if (!gameState) return null;

  const availablePlayers = gameState.players.filter((p) => !p.role);
  // Get first night role order from rule system
  const firstNightRoles = game.getFirstNightTurnOrder();
  const currentRole = firstNightRoles[currentRoleIndex];
  const isAllCompleted = currentRoleIndex >= firstNightRoles.length;

  const handleAssignRole = () => {
    if (selectedPlayerIds.length === 0 || !currentRole) return;

    const result = assignRoleToPlayers(selectedPlayerIds, currentRole.name);

    if (result.success) {
      setSelectedPlayerIds([]);

      // Check if role has action by finding a player with this role and checking their action options
      const playerWithRole = gameState.players.find(
        (p) => p.role?.name === currentRole.name,
      );
      if (playerWithRole && playerWithRole.role) {
        const actionOptions = playerWithRole.role.getActionOptions(
          gameState,
          playerWithRole,
        );

        // Check if role can act based on their action options
        const canActOnFirstNight = checkIfRoleCanAct(actionOptions);

        if (canActOnFirstNight) {
          // Special handling for Witch - start with heal step
          if (currentRole.name === RoleName.Witch) {
            setCurrentStep('witch-heal');
          } else {
            setCurrentStep('action');
          }
        } else {
          // No action needed, move to next role
          moveToNextRole();
        }
      } else {
        // No action needed, move to next role
        moveToNextRole();
      }
    }
  };

  const handleRoleAction = (payload: unknown) => {
    if (!currentRole) return;

    const result = submitGroupAction(currentRole.name, payload);

    if (result.success) {
      setSelectedPlayerIds([]);

      // For Seer, show the result before moving on
      if (currentRole.name === RoleName.Seer && gameState?.lastSeerResult) {
        setSeerResult({
          targetName: gameState.lastSeerResult.targetName,
          revealedFaction: gameState.lastSeerResult.revealedFaction,
        });
      } else {
        moveToNextRole();
      }
    }
  };

  const handleAcknowledgeResult = () => {
    setSeerResult(null);
    moveToNextRole();
  };

  const handleWitchActions = (overridePoisonTarget?: string | null) => {
    console.log('🧙‍♀️ handleWitchActions called');
    console.log('  currentRole:', currentRole?.name);
    console.log('  witchActions:', witchActions);

    if (!currentRole || currentRole.name !== RoleName.Witch) {
      console.log('  ❌ Not witch role, returning');
      return;
    }

    // Find the witch player
    const witchPlayer = gameState.players.find(
      (p) => p.role?.name === RoleName.Witch,
    );
    console.log('  witchPlayer found:', witchPlayer?.name);

    if (!witchPlayer || !witchPlayer.role) {
      console.log('  ❌ No witch player found, returning');
      return;
    }

    // Execute actions immediately
    let actionsExecuted = 0;
    console.log('  🎯 Starting action execution...');

    // Handle heal action first
    if (witchActions.willHeal) {
      console.log('  💚 Processing heal action...');
      const witchActionOptions = getRoleActionOptions(RoleName.Witch);
      console.log(
        '    deadPlayerId:',
        witchActionOptions && 'deadPlayerId' in witchActionOptions
          ? witchActionOptions.deadPlayerId
          : 'not found',
      );

      if (
        witchActionOptions &&
        'deadPlayerId' in witchActionOptions &&
        witchActionOptions.deadPlayerId
      ) {
        const healAction = witchPlayer.role.createAction(witchPlayer, {
          healTarget: witchActionOptions.deadPlayerId,
        });
        console.log(
          '    healAction created:',
          healAction ? `success (${healAction.length} actions)` : 'failed',
        );

        if (healAction && healAction.length > 0) {
          healAction[0].execute(gameState);
          actionsExecuted++;
          console.log('    ✅ Witch heal action executed immediately');
        }
      }
    } else {
      console.log('  ⏭️ Skipping heal action (willHeal: false)');
    }

    // Handle poison action separately (important: create separate action)
    const finalPoisonTarget =
      overridePoisonTarget !== undefined
        ? overridePoisonTarget
        : witchActions.poisonTarget;
    console.log(
      '    finalPoisonTarget:',
      finalPoisonTarget,
      '(override:',
      overridePoisonTarget,
      ', state:',
      witchActions.poisonTarget,
      ')',
    );

    if (finalPoisonTarget) {
      console.log('  ☠️ Processing poison action...');
      console.log('    poisonTarget:', finalPoisonTarget);
      console.log(
        '    witch has poison potion:',
        (witchPlayer.role as any).hasPoisonPotion,
      );

      const poisonAction = witchPlayer.role.createAction(witchPlayer, {
        poisonTarget: finalPoisonTarget,
      });
      console.log(
        '    poisonAction created:',
        poisonAction ? `success (${poisonAction.length} actions)` : 'failed',
      );

      if (poisonAction && poisonAction.length > 0) {
        poisonAction[0].execute(gameState);
        actionsExecuted++;
        console.log('    ✅ Witch poison action executed immediately');
      } else {
        console.log(
          '    ❌ Failed to create poison action - witch may not have poison potion',
        );
      }
    } else {
      console.log('  ⏭️ Skipping poison action (no poisonTarget)');
    }

    console.log(`Witch executed ${actionsExecuted} actions immediately`);

    // Move to next role
    moveToNextRole();

    // Reset witch actions for next time
    setWitchActions({ willHeal: false, poisonTarget: null });
    setSelectedPlayerIds([]);
  };

  const moveToNextRole = () => {
    if (!currentRole) return;

    setCompletedRoles((prev) => new Set([...prev, currentRole.name]));
    setCurrentStep('assign');
    setCurrentRoleIndex((prev) => prev + 1);
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
      return availablePlayers.length > 0;
    }

    if (currentRole.name === RoleName.Werewolf) {
      return selectedPlayerIds.length === 2;
    }

    return selectedPlayerIds.length === 1;
  };

  const canSubmitAction = () => {
    switch (currentRole?.name) {
      case RoleName.Cupid:
        return selectedPlayerIds.length === 2;
      case RoleName.Seer:
      case RoleName.Bodyguard:
      case RoleName.Werewolf:
        return selectedPlayerIds.length === 1;
      default:
        return false;
    }
  };

  const getActionPayload = () => {
    if (!currentRole) return null;

    switch (currentRole.name) {
      case RoleName.Cupid:
        if (selectedPlayerIds.length === 2) {
          return {
            target1Id: selectedPlayerIds[0],
            target2Id: selectedPlayerIds[1],
          };
        }
        break;

      case RoleName.Seer:
      case RoleName.Bodyguard:
      case RoleName.Werewolf:
        if (selectedPlayerIds.length === 1) {
          return selectedPlayerIds[0];
        }
        break;

      default:
        break;
    }
    return null;
  };

  const getSelectionRequirement = () => {
    if (!currentRole) return '';

    if (currentStep === 'assign') {
      if (currentRole.name === RoleName.Villager) {
        return `Chọn tất cả người chơi còn lại (${availablePlayers.length} người)`;
      }

      if (currentRole.name === RoleName.Werewolf) {
        return `Chọn 2 người làm Ma Sói (đã chọn: ${selectedPlayerIds.length}/2)`;
      }

      return `Chọn 1 người làm ${currentRole.name} (đã chọn: ${selectedPlayerIds.length}/1)`;
    }

    if (currentStep === 'action') {
      switch (currentRole.name) {
        case RoleName.Cupid:
          return `Chọn 2 người để ghép đôi (đã chọn: ${selectedPlayerIds.length}/2)`;
        case RoleName.Seer:
          return `Chọn 1 người để xem phe (đã chọn: ${selectedPlayerIds.length}/1)`;
        case RoleName.Bodyguard:
          return `Chọn 1 người để bảo vệ (đã chọn: ${selectedPlayerIds.length}/1)`;
        case RoleName.Werewolf:
          return `Chọn 1 người để cắn (đã chọn: ${selectedPlayerIds.length}/1)`;
        default:
          return '';
      }
    }

    if (currentStep === 'witch-heal') {
      const witchActionOptions = getRoleActionOptions(RoleName.Witch);
      if (
        witchActionOptions &&
        'deadPlayerId' in witchActionOptions &&
        witchActionOptions.deadPlayerId
      ) {
        const deadPlayer = gameState.getPlayerById(
          witchActionOptions.deadPlayerId,
        );
        return `${deadPlayer?.name || 'Ai đó'} bị sói cắn. Bạn có muốn cứu không?`;
      } else {
        return `Không có ai bị sói cắn đêm nay. Bỏ qua bước cứu.`;
      }
    }

    if (currentStep === 'witch-poison') {
      return `Chọn 1 người để đầu độc (đã chọn: ${selectedPlayerIds.length}/1)`;
    }

    return '';
  };

  // All roles completed, show resolve night
  if (isAllCompleted && currentStep !== 'completed') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="w-5 h-5" />
            Hoàn thành gán vai trò
          </CardTitle>
          <CardDescription>
            Tất cả vai trò đã được gán và thực hiện hành động
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="text-sm font-medium mb-2 text-green-800">
              ✅ Đã hoàn thành:
            </div>
            <div className="text-xs space-y-1">
              {Array.from(completedRoles).map((role) => (
                <div
                  key={role}
                  className="flex items-center gap-2 text-green-700"
                >
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  {role}
                </div>
              ))}
            </div>
          </div>

          <Button onClick={handleResolveNight} className="w-full" size="lg">
            <ArrowRight className="w-4 h-4 mr-2" />
            Kết thúc đêm đầu tiên
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Night completed
  if (currentStep === 'completed') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600" />
            Đêm đầu tiên hoàn thành
          </CardTitle>
          <CardDescription>
            Game sẽ chuyển sang giai đoạn ban ngày
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-lg">🌅 Đêm đầu tiên đã kết thúc!</p>
            <p className="text-muted-foreground">
              Kiểm tra kết quả và chuẩn bị cho ban ngày
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentRole) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Moon className="w-5 h-5" />
          Đêm đầu tiên
        </CardTitle>
        <CardDescription>
          Bước {currentRoleIndex + 1}/{firstNightRoles.length}:
          {currentStep === 'assign' ? ' Gán vai trò' : ' Thực hiện hành động'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Role Info */}
        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
          {/*{currentRole.icon}*/}
          <div>
            <div className="font-medium">{currentRole.name}</div>
            <div className="text-sm text-muted-foreground">
              {currentRole.description}
            </div>
          </div>
        </div>

        {/* Selection Requirement */}
        <div className="text-sm font-medium">{getSelectionRequirement()}</div>

        {/* Selected Players */}
        {selectedPlayerIds.length > 0 && (
          <div className="text-xs text-muted-foreground">
            Đã chọn:{' '}
            {selectedPlayerIds
              .map((playerId) => {
                const player = gameState.getPlayerById(playerId);
                return player?.name;
              })
              .join(', ')}
          </div>
        )}

        {selectedPlayerIds.length === 0 && (
          <div className="text-xs text-yellow-600">
            💡 Click vào người chơi bên phải để chọn
          </div>
        )}

        {/* Seer Result Display */}
        {seerResult && (
          <div className="p-4 border-t">
            <div className="text-center space-y-2">
              <h3 className="text-md font-semibold flex items-center justify-center gap-2">
                <Eye className="w-5 h-5" />
                Kết quả soi
              </h3>
              <p className="text-lg">
                <span className="font-bold">{seerResult.targetName}</span> là
                phe{' '}
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
        )}

        {/* Action Button */}
        {currentStep === 'assign' && (
          <Button
            onClick={() => {
              if (currentRole.name === RoleName.Villager) {
                // For Villager, assign all remaining players
                const remainingPlayerIds = availablePlayers.map((p) => p.id);
                const result = assignRoleToPlayers(
                  remainingPlayerIds,
                  currentRole.name,
                );
                if (result.success) {
                  setSelectedPlayerIds([]);
                  moveToNextRole();
                }
              } else {
                handleAssignRole();
              }
            }}
            disabled={!canAssignRole()}
            className="w-full"
          >
            {currentRole.name === RoleName.Villager
              ? `Gán tất cả làm ${currentRole.name} (${availablePlayers.length} người)`
              : `Gán vai trò ${currentRole.name}`}
          </Button>
        )}

        {currentStep === 'action' && !seerResult && (
          <Button
            onClick={() => {
              const payload = getActionPayload();
              if (payload) {
                handleRoleAction(payload);
              }
            }}
            disabled={!canSubmitAction()}
            className="w-full"
          >
            Thực hiện hành động
          </Button>
        )}

        {/* Witch Heal Step */}
        {currentStep === 'witch-heal' && (
          <div className="space-y-3">
            {(() => {
              const witchActionOptions = getRoleActionOptions(RoleName.Witch);
              const hasDeadPlayer =
                witchActionOptions &&
                'deadPlayerId' in witchActionOptions &&
                witchActionOptions.deadPlayerId;

              if (hasDeadPlayer) {
                return (
                  <>
                    <Button
                      onClick={() => {
                        setWitchActions((prev) => ({
                          ...prev,
                          willHeal: true,
                        }));
                        setCurrentStep('witch-poison');
                      }}
                      className="w-full"
                    >
                      Cứu người bị sói cắn
                    </Button>
                    <Button
                      onClick={() => {
                        setWitchActions((prev) => ({
                          ...prev,
                          willHeal: false,
                        }));
                        setCurrentStep('witch-poison');
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      Không cứu
                    </Button>
                  </>
                );
              } else {
                return (
                  <Button
                    onClick={() => {
                      setWitchActions((prev) => ({ ...prev, willHeal: false }));
                      setCurrentStep('witch-poison');
                    }}
                    className="w-full"
                  >
                    Tiếp tục (không có ai để cứu)
                  </Button>
                );
              }
            })()}
          </div>
        )}

        {/* Witch Poison Step */}
        {currentStep === 'witch-poison' && (
          <div className="space-y-3">
            <Button
              onClick={() => {
                if (selectedPlayerIds.length === 1) {
                  const targetId = selectedPlayerIds[0];
                  setWitchActions((prev) => ({
                    ...prev,
                    poisonTarget: targetId,
                  }));
                  handleWitchActions(targetId); // Pass directly to avoid async state issue
                }
              }}
              disabled={selectedPlayerIds.length !== 1}
              className="w-full"
            >
              Đầu độc người đã chọn
            </Button>
            <Button
              onClick={() => {
                setWitchActions((prev) => ({ ...prev, poisonTarget: null }));
                handleWitchActions(null); // Pass null directly
              }}
              variant="outline"
              className="w-full"
            >
              Không đầu độc ai
            </Button>
          </div>
        )}

        {/* Progress */}
        {completedRoles.size > 0 && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-sm font-medium mb-2">Đã hoàn thành:</div>
            <div className="text-xs space-y-1">
              {Array.from(completedRoles).map((role) => (
                <div key={role} className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  {role}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
