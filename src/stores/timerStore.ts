// ============================================
// Timer Store (Zustand)
// ============================================

import { create } from 'zustand';
import { useHobbyStore } from './hobbyStore';

interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  hobbyId: string | null;
  startTime: number | null;
  elapsed: number; // in seconds
  pauseOffset: number; // accumulated pause time

  // Actions
  startTimer: (hobbyId: string) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
  tick: () => void;
}

export const useTimerStore = create<TimerState>((set, get) => ({
  isRunning: false,
  isPaused: false,
  hobbyId: null,
  startTime: null,
  elapsed: 0,
  pauseOffset: 0,

  startTimer: (hobbyId) => {
    set({
      isRunning: true,
      isPaused: false,
      hobbyId,
      startTime: Date.now(),
      elapsed: 0,
      pauseOffset: 0,
    });
  },

  pauseTimer: () => {
    set({
      isPaused: true,
      isRunning: false,
    });
  },

  resumeTimer: () => {
    const { elapsed } = get();
    set({
      isPaused: false,
      isRunning: true,
      startTime: Date.now(),
      pauseOffset: elapsed,
    });
  },

  stopTimer: () => {
    const state = get();
    if (state.hobbyId && state.elapsed > 0) {
      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - state.elapsed * 1000);

      useHobbyStore.getState().addSession({
        hobbyId: state.hobbyId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: Math.floor(state.elapsed),
        notes: '',
        isManual: false,
      });
    }

    set({
      isRunning: false,
      isPaused: false,
      hobbyId: null,
      startTime: null,
      elapsed: 0,
      pauseOffset: 0,
    });
  },

  resetTimer: () => {
    set({
      isRunning: false,
      isPaused: false,
      hobbyId: null,
      startTime: null,
      elapsed: 0,
      pauseOffset: 0,
    });
  },

  tick: () => {
    const state = get();
    if (state.isRunning && state.startTime) {
      const now = Date.now();
      const newElapsed = state.pauseOffset + (now - state.startTime) / 1000;
      set({ elapsed: newElapsed });
    }
  },
}));
