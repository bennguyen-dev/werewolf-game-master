'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React, { FC } from 'react';

import { IPlayerSeatProps, PlayerSeat } from '@/components/PlayerSeat';

interface IProps extends IPlayerSeatProps {
  id: string;
}

export const SortablePlayerSeat: FC<IProps> = ({ id, ...rest }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
    gridColumn: 'span 1',
    gridRow: 'span 1',
  };

  return (
    <div
      className={isDragging ? 'cursor-grabbing' : 'cursor-grab'}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <PlayerSeat {...rest} />
    </div>
  );
};
