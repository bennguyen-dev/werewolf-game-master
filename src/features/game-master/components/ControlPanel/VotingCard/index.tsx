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

interface IProps {
  game: IUseGameReturn;
  selectedPlayerIds: string[];
  onSubmitVote: (playerId: string | null) => void;
  config: IGameConfig;
}

export const VotingCard: React.FC<IProps> = ({
  game,
  selectedPlayerIds,
  onSubmitVote,
  config,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(config.timeSettings.vote);
  const { gameState } = game;

  const player = gameState?.getPlayerById(selectedPlayerIds[0]);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleConfirmVote = () => {
    onSubmitVote(selectedPlayerIds[0]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bỏ Phiếu</CardTitle>
        <CardDescription>Thời gian còn lại: {timeLeft} giây</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-4">
        <p>Người chơi bị đưa ra xét xử:</p>
        {player ? (
          <div className="flex flex-col items-center space-y-2">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={`https://api.dicebear.com/8.x/adventurer/svg?seed=${player.name}`}
              />
              <AvatarFallback>{player.name[0]}</AvatarFallback>
            </Avatar>
            <span className="text-lg font-bold">{player.name}</span>
          </div>
        ) : (
          <div className="flex h-24 items-center justify-center">
            <p className="text-gray-500">Chưa chọn người chơi nào</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => onSubmitVote(null)}>
          Bỏ qua (Không ai bị loại)
        </Button>
        <Button onClick={handleConfirmVote} disabled={!player || timeLeft <= 0}>
          Xác nhận loại bỏ
        </Button>
      </CardFooter>
    </Card>
  );
};
