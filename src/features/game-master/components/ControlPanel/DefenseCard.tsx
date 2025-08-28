'use client';

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
  setSelectedPlayerIds: (playerId: string[]) => void;
}

export const DefenseCard: React.FC<IProps> = ({
  game,
  config,
  setSelectedPlayerIds,
}) => {
  const { gameState } = game;
  const playerOnTrial = gameState?.playerOnTrial;

  const handleResolveDefense = (success: boolean) => {
    game.resolveDefense(success);
    setSelectedPlayerIds([]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bào chữa</CardTitle>
        <Timer initialTime={config.timeSettings.defend} />
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-4">
        <p>Người chơi đang bào chữa:</p>
        {playerOnTrial ? (
          <div className="flex flex-col items-center space-y-2">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={`https://api.dicebear.com/8.x/adventurer/svg?seed=${playerOnTrial.name}`}
              />
              <AvatarFallback>{playerOnTrial.name[0]}</AvatarFallback>
            </Avatar>
            <span className="text-lg font-bold">{playerOnTrial.name}</span>
          </div>
        ) : (
          <div className="flex h-24 items-center justify-center">
            <p className="text-gray-500">
              Lỗi: Không có người chơi nào đang bị xử.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="grid grid-cols-2 gap-4">
        <Button
          variant="outline"
          onClick={() => handleResolveDefense(true)}
          disabled={!playerOnTrial}
        >
          Bào chữa thành công
        </Button>
        <Button
          variant="destructive"
          onClick={() => handleResolveDefense(false)}
          disabled={!playerOnTrial}
        >
          Bào chữa thất bại
        </Button>
      </CardFooter>
    </Card>
  );
};
