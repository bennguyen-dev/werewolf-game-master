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
import { IUseGameReturn } from '@/hooks/useGame';

interface IProps {
  game: IUseGameReturn;
  onStartDayDiscussion: () => void;
}

export const MorningResultsCard: React.FC<IProps> = ({
  game,
  onStartDayDiscussion,
}) => {
  const { gameState } = game;

  // Calculate morning data from game history
  const morningData = useMemo(() => {
    if (!gameState) return null;

    // Parse actions from game history
    const parseActionsFromHistory = (history: string[]) => {
      let werewolfKills = 0;
      const witchHealed: string | null = null;
      const witchPoisoned: string | null = null;
      let bodyguardProtected = 0;
      let seerActions = 0;

      console.log('Parsing history:', history);

      // Find the most recent night start and end
      const lastNightEndIndex = history.findLastIndex((entry) =>
        entry.includes('Kết thúc đêm, chuyển sang ban ngày'),
      );

      // Find the start of the most recent night (before the end)
      const searchHistory =
        lastNightEndIndex >= 0 ? history.slice(0, lastNightEndIndex) : history;
      const nightStartIndex = searchHistory.findLastIndex(
        (entry) =>
          entry.includes('Bắt đầu đêm đầu tiên') ||
          entry.includes('🌙') ||
          entry.includes('Gán vai trò'),
      );

      // Get actions between night start and night end
      const startIndex = nightStartIndex >= 0 ? nightStartIndex : 0;
      const endIndex =
        lastNightEndIndex >= 0 ? lastNightEndIndex : history.length;
      const nightActions = history.slice(startIndex, endIndex);

      console.log('Night actions slice:', {
        startIndex,
        endIndex,
        nightActions,
      });

      // Parse each action
      nightActions.forEach((entry) => {
        if (entry.includes('Werewolf đã thực hiện hành động')) {
          const match = entry.match(/(\d+) người bị đánh dấu/);
          werewolfKills += match ? parseInt(match[1]) : 1;
        }

        if (entry.includes('Witch đã thực hiện hành động')) {
          // For now, we can't distinguish heal vs poison from history
          // This is a limitation of history-based approach
          // Could be improved by enhancing history messages
        }

        if (entry.includes('Bodyguard đã thực hiện hành động')) {
          bodyguardProtected += 1;
        }

        if (entry.includes('Seer đã thực hiện hành động')) {
          seerActions += 1;
        }
      });

      const result = {
        werewolfKills,
        witchHealed,
        witchPoisoned,
        bodyguardProtected,
        seerActions,
      };

      console.log('Parsed actions:', result);
      return result;
    };

    const actions = parseActionsFromHistory(game.gameHistory);

    // Count current dead players
    const deadPlayers = gameState.players.filter((p) => !p.isAlive);
    const alivePlayers = gameState.getLivingPlayers();
    const deadPlayerNames = deadPlayers.map((p) => p.name);

    const result = {
      werewolfKills: actions.werewolfKills,
      witchHealed: actions.witchHealed,
      witchPoisoned: actions.witchPoisoned,
      bodyguardProtected: actions.bodyguardProtected,
      deadPlayerNames,
      totalDeaths: deadPlayers.length,
      totalSurvivors: alivePlayers.length,
      totalActions:
        actions.werewolfKills +
        actions.bodyguardProtected +
        actions.seerActions,
    };

    console.log('MorningResultsCard - Parsed from history:', {
      actions,
      result,
    });
    return result;
  }, [gameState, game.gameHistory]);

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
              {morningData.deadPlayerNames.map((name, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-3 border border-red-200 rounded-lg bg-red-50"
                >
                  <Skull className="w-4 h-4 text-red-500" />
                  <span className="font-medium text-red-700">{name}</span>
                  <span className="text-sm text-muted-foreground">đã chết</span>
                </div>
              ))}
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
