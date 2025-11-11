'use client';

import { useEffect, useRef, useState } from 'react';

interface SwipeState {
  isDragging: boolean;
  direction: 'left' | 'right' | null;
  distance: number;
}

interface UseSwipeProps {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number; // Minimum distance to trigger swipe
}

/**
 * Custom hook for swipe gesture detection
 */
export function useSwipe({
  onSwipeLeft,
  onSwipeRight,
  threshold = 100,
}: UseSwipeProps) {
  const [swipeState, setSwipeState] = useState<SwipeState>({
    isDragging: false,
    direction: null,
    distance: 0,
  });

  const handleDragEnd = (_event: any, info: { offset: { x: number }; velocity: { x: number } }) => {
    const { offset, velocity } = info;
    const swipeDistance = Math.abs(offset.x);
    const swipeVelocity = Math.abs(velocity.x);

    // Determine if swipe threshold met (distance OR velocity)
    if (swipeDistance > threshold || swipeVelocity > 0.5) {
      if (offset.x > 0) {
        // Swipe right
        setSwipeState({ isDragging: false, direction: 'right', distance: offset.x });
        onSwipeRight?.();
      } else {
        // Swipe left
        setSwipeState({ isDragging: false, direction: 'left', distance: Math.abs(offset.x) });
        onSwipeLeft?.();
      }
    } else {
      // Didn't meet threshold, reset
      setSwipeState({ isDragging: false, direction: null, distance: 0 });
    }
  };

  const handleDrag = (_event: any, info: { offset: { x: number } }) => {
    const distance = Math.abs(info.offset.x);
    const direction = info.offset.x > 0 ? 'right' : 'left';
    
    setSwipeState({
      isDragging: true,
      direction,
      distance,
    });
  };

  const handleDragStart = () => {
    setSwipeState({
      isDragging: true,
      direction: null,
      distance: 0,
    });
  };

  return {
    swipeState,
    handlers: {
      onDragStart: handleDragStart,
      onDrag: handleDrag,
      onDragEnd: handleDragEnd,
    },
  };
}
