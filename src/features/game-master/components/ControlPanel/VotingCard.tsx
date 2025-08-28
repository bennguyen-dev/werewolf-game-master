'use client';

import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { IGameConfig } from '@/features/setup';
import { IUseGameReturn } from '@/hooks/useGame';

// Timer sub-component (reused from DayPhaseControlCard)
const Timer: React.FC<{ initialTime: number }> = ({ initialTime }) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const isOvertime = timeLeft < 0;
  const displayTime = isOvertime ? `+${Math.abs(timeLeft)}` : timeLeft;
  const timeColor = isOvertime ? 'text-red-500 font-bold' : '';

  return (
    <CardDescription className={timeColor}>
      Thời gian: {displayTime} giây
    </CardDescription>
  );
};

interface IProps {
  game: IUseGameReturn;
  config: IGameConfig;
  selectedPlayerIds: string[];
}

export const VotingCard: React.FC<IProps> = ({
  game,
  config,
  selectedPlayerIds,
}) => {
  const { gameState } = game;

  const selectedPlayer =
    selectedPlayerIds.length > 0
      ? gameState?.getPlayerById(selectedPlayerIds[0])
      : null;

  const handleStartDefense = () => {
    if (selectedPlayer) {
      game.startDefensePhase(selectedPlayer.id);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bỏ phiếu</CardTitle>
        <Timer initialTime={config.timeSettings.vote} />
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-4">
        <p>Người chơi bị đưa ra xét xử:</p>
        {selectedPlayer ? (
          <div className="flex flex-col items-center space-y-2">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={`https://api.dicebear.com/8.x/adventurer/svg?seed=${selectedPlayer.name}`}
              />
              <AvatarFallback>{selectedPlayer.name[0]}</AvatarFallback>
            </Avatar>
            <span className="text-lg font-bold">{selectedPlayer.name}</span>
          </div>
        ) : (
          <div className="flex h-24 items-center justify-center">
            <p className="text-gray-500">Chưa chọn người chơi nào</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleStartDefense}
          disabled={!selectedPlayer}
          className="w-full"
        >
          <ArrowRight className="w-4 h-4 mr-2" />
          Bắt đầu Bào chữa
        </Button>
      </CardFooter>
    </Card>
  );
};
