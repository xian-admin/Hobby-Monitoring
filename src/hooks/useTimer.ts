// ============================================
// Hook — useTimer
// ============================================

import { useEffect, useRef } from 'react';
import { useTimerStore } from '../stores/timerStore';

export function useTimer() {
  const store = useTimerStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (store.isRunning) {
      intervalRef.current = setInterval(() => {
        store.tick();
      }, 100); // Update every 100ms for smooth display
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [store.isRunning]);

  return store;
}
