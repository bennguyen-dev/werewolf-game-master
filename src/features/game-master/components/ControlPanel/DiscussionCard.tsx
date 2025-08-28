'use client';

import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';

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
}

export const DiscussionCard: React.FC<IProps> = ({ game, config }) => {
  const handleStartVoting = () => {
    game.startVotingPhase();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thảo luận</CardTitle>
        <Timer initialTime={config.timeSettings.discuss} />
      </CardHeader>
      <CardContent>
        <p className="text-center text-gray-500">
          Dân làng đang thảo luận, hãy chọn một người chơi để đưa ra bỏ phiếu.
        </p>
      </CardContent>
      <CardFooter>
        <Button onClick={handleStartVoting} className="w-full">
          <ArrowRight className="w-4 h-4 mr-2" />
          Bắt đầu Bỏ phiếu
        </Button>
      </CardFooter>
    </Card>
  );
};
