'use client';

import { History } from 'lucide-react';
import React from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface IProps {
  gameHistory: string[];
}

export const HistoryCard: React.FC<IProps> = ({ gameHistory }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5" />
          Lịch sử Game
        </CardTitle>
        <CardDescription>Các sự kiện và hành động trong game</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {gameHistory.length > 0 ? (
            gameHistory.map((event, index) => (
              <div
                key={index}
                className="text-sm p-2 bg-muted rounded text-muted-foreground border-l-2 border-primary/20"
              >
                {event}
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Chưa có sự kiện nào
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
