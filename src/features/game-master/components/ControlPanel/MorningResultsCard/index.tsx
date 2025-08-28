'use client';

import {
  Activity,
  ArrowRight,
  CheckCircle,
  Heart,
  Shield,
  Skull,
  Sun,
  Zap,
} from 'lucide-react';
import React, { useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { HunterActionForm } from '@/features/game-master/components/ControlPanel/FirstNightCard/RoleActionForms';
import { Player } from '@/game-core/types/Player';
import { IUseGameReturn } from '@/hooks/useGame';

interface IProps {
  game: IUseGameReturn;
  onStartDayDiscussion: () => void;
  selectedPlayerIds: string[];
  setSelectedPlayerIds: React.Dispatch<React.SetStateAction<string[]>>;
}

export const MorningResultsCard: React.FC<IProps> = ({
  game,
  onStartDayDiscussion,
  selectedPlayerIds,
  setSelectedPlayerIds,
}) => {
  const { gameState } = game;

  // Calculate morning data from structured history
  const morningData = useMemo(() => {
    if (!gameState || !game.gameEngine) return null;

    // Get last night actions directly from structured history
    const lastNightActions = game.gameEngine.getLastNightActions();

    // Count actions by type
    const werewolfKills = lastNightActions.filter(
      (action) => action.actionType === 'KillAction',
    ).length;
    const bodyguardProtected = lastNightActions.filter(
      (action) => action.actionType === 'ProtectAction',
    ).length;
    const seerActions = lastNightActions.filter(
      (action) => action.actionType === 'SeeAction',
    ).length;

    // Get witch actions with details
    const healActions = lastNightActions.filter(
      (action) => action.actionType === 'HealAction',
    );
    const poisonActions = lastNightActions.filter(
      (action) => action.actionType === 'PoisonAction',
    );
    const witchHealed =
      healActions.length > 0 ? healActions[0].targetName : null;
    const witchPoisoned =
      poisonActions.length > 0 ? poisonActions[0].targetName : null;

    const actions = {
      werewolfKills,
      witchHealed,
      witchPoisoned,
      bodyguardProtected,
      seerActions,
    };

    // Get night results from NIGHT_ENDED event
    const allHistory = game.gameEngine.getActionHistory().getEntries();
    const lastNightEndEvent = allHistory
      .filter(
        (entry) =>
          entry.type === 'GAME_EVENT' && entry.eventType === 'NIGHT_ENDED',
      )
      .pop(); // Get the most recent one

    const deadPlayerNames =
      lastNightEndEvent?.eventData?.deadPlayers?.map((p: Player) => p.name) ||
      [];
    const totalDeaths = lastNightEndEvent?.eventData?.totalDeaths || 0;

    const alivePlayers = gameState.getLivingPlayers();

    const result = {
      werewolfKills: actions.werewolfKills,
      witchHealed: actions.witchHealed,
      witchPoisoned: actions.witchPoisoned,
      bodyguardProtected: actions.bodyguardProtected,
      deadPlayerNames,
      totalDeaths: totalDeaths,
      totalSurvivors: alivePlayers.length,
      totalActions:
        actions.werewolfKills +
        actions.bodyguardProtected +
        actions.seerActions,
    };

    return result;
  }, [gameState, game.gameEngine]);

  if (!gameState || !morningData) {
    return null;
  }

  const hasAnyActions = morningData.totalActions > 0;
  const hasDeaths = morningData.totalDeaths > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sun className="text-yellow-500" />
          Sáng hôm sau - Ngày {gameState.dayNumber}
        </CardTitle>
        <CardDescription>
          Tóm tắt những gì đã xảy ra trong đêm vừa qua
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Action Summary */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            <h3 className="font-semibold">Tóm tắt hành động đêm qua</h3>
            {hasAnyActions && (
              <Badge variant="secondary">
                {morningData.totalActions} hành động
              </Badge>
            )}
          </div>

          {!hasAnyActions ? (
            <p className="text-muted-foreground text-center py-4">
              Không có hành động nào được thực hiện trong đêm vừa qua.
            </p>
          ) : (
            <div className="space-y-3">
              {/* Werewolf Kills */}
              {morningData.werewolfKills > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <Skull className="w-4 h-4 text-red-500" />
                  <span className="font-medium">Ma sói tấn công:</span>
                  <Badge variant="destructive">
                    {morningData.werewolfKills} lần
                  </Badge>
                </div>
              )}

              {/* Witch Heal */}
              {morningData.witchHealed && (
                <div className="flex items-center gap-2 text-sm">
                  <Heart className="w-4 h-4 text-green-500" />
                  <span className="font-medium">Phù thủy cứu:</span>
                  <span className="text-green-600">
                    {morningData.witchHealed}
                  </span>
                </div>
              )}

              {/* Witch Poison */}
              {morningData.witchPoisoned && (
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4 text-purple-500" />
                  <span className="font-medium">Phù thủy độc:</span>
                  <span className="text-purple-600">
                    {morningData.witchPoisoned}
                  </span>
                </div>
              )}

              {/* Bodyguard Protection */}
              {morningData.bodyguardProtected > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">Bảo vệ che chở:</span>
                  <Badge variant="outline">
                    {morningData.bodyguardProtected} người
                  </Badge>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Death Results */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {hasDeaths ? (
              <>
                <Skull className="w-5 h-5 text-red-500" />
                <h3 className="font-semibold text-red-700">
                  Kết quả cuối cùng
                </h3>
                <Badge variant="destructive">
                  {morningData.totalDeaths} người chết
                </Badge>
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 text-green-500" />
                <h3 className="font-semibold text-green-700">
                  Kết quả cuối cùng
                </h3>
              </>
            )}
          </div>

          {!hasDeaths ? (
            <div className="text-center py-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-green-700 font-medium">
                🎉 Không ai chết trong đêm vừa qua!
              </p>
              <p className="text-green-600 text-sm mt-1">
                Tất cả mọi người đều an toàn và sống sót qua đêm.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {morningData.deadPlayerNames.map(
                (name: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-3 border border-red-200 rounded-lg bg-red-50"
                  >
                    <Skull className="w-4 h-4 text-red-500" />
                    <span className="font-medium text-red-700">{name}</span>
                    <span className="text-sm text-muted-foreground">
                      đã chết
                    </span>
                  </div>
                ),
              )}
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="pt-4 border-t">
          <div className="grid grid-cols-3 gap-4 text-sm text-center">
            <div>
              <span className="text-muted-foreground block">Hành động</span>
              <span className="font-medium text-lg">
                {morningData.totalActions}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block">Đã chết</span>
              <span className="font-medium text-lg text-red-600">
                {morningData.totalDeaths}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block">Còn sống</span>
              <span className="font-medium text-lg text-green-600">
                {morningData.totalSurvivors}
              </span>
            </div>
          </div>
        </div>

        {/* Hunter Action */}
        <HunterActionForm
          game={game}
          selectedPlayerIds={selectedPlayerIds}
          setSelectedPlayerIds={setSelectedPlayerIds}
        />

        {/* Action Button */}
        <div className="pt-4 border-t">
          <Button onClick={onStartDayDiscussion} className="w-full" size="lg">
            <ArrowRight className="w-4 h-4 mr-2" />
            Bắt đầu thảo luận ban ngày
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
