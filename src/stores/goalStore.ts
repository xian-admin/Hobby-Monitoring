// ============================================
// Goal Store (Zustand)
// ============================================

import { create } from 'zustand';
import { Goal, GoalProgress } from '../types';
import { loadData, saveData, STORAGE_KEYS } from '../utils/storage';
import { generateId } from '../utils/helpers';
import { getStartOfDay, getStartOfWeek, getStartOfMonth } from '../utils/time';
import { useHobbyStore } from './hobbyStore';

interface GoalState {
  goals: Goal[];
  initialized: boolean;

  // Actions
  initialize: () => Promise<void>;
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  toggleGoal: (id: string) => void;
  getGoalsByHobby: (hobbyId: string) => Goal[];
  getGoalProgress: (goalId: string) => GoalProgress | null;
  getAllGoalProgress: () => GoalProgress[];
}

export const useGoalStore = create<GoalState>((set, get) => ({
  goals: [],
  initialized: false,

  initialize: async () => {
    const saved = await loadData<Goal[]>(STORAGE_KEYS.GOALS);
    if (saved) {
      set({ goals: saved, initialized: true });
    } else {
      // Default goals for demo hobbies
      const defaultGoals: Goal[] = [
        {
          id: 'goal-1',
          hobbyId: 'demo-1',
          type: 'duration',
          period: 'daily',
          target: 3600, // 1 hour
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'goal-2',
          hobbyId: 'demo-2',
          type: 'duration',
          period: 'weekly',
          target: 18000, // 5 hours
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'goal-3',
          hobbyId: 'demo-3',
          type: 'sessions',
          period: 'weekly',
          target: 4, // 4 sessions
          isActive: true,
          createdAt: new Date().toISOString(),
        },
      ];
      set({ goals: defaultGoals, initialized: true });
      saveData(STORAGE_KEYS.GOALS, defaultGoals);
    }
  },

  addGoal: (goalData) => {
    const newGoal: Goal = {
      ...goalData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    const goals = [...get().goals, newGoal];
    set({ goals });
    saveData(STORAGE_KEYS.GOALS, goals);
  },

  updateGoal: (id, updates) => {
    const goals = get().goals.map((g) =>
      g.id === id ? { ...g, ...updates } : g,
    );
    set({ goals });
    saveData(STORAGE_KEYS.GOALS, goals);
  },

  deleteGoal: (id) => {
    const goals = get().goals.filter((g) => g.id !== id);
    set({ goals });
    saveData(STORAGE_KEYS.GOALS, goals);
  },

  toggleGoal: (id) => {
    const goals = get().goals.map((g) =>
      g.id === id ? { ...g, isActive: !g.isActive } : g,
    );
    set({ goals });
    saveData(STORAGE_KEYS.GOALS, goals);
  },

  getGoalsByHobby: (hobbyId) => {
    return get().goals.filter((g) => g.hobbyId === hobbyId);
  },

  getGoalProgress: (goalId) => {
    const goal = get().goals.find((g) => g.id === goalId);
    if (!goal) return null;

    const hobby = useHobbyStore
      .getState()
      .hobbies.find((h) => h.id === goal.hobbyId);
    if (!hobby) return null;

    const sessions = useHobbyStore.getState().sessions;
    let startDate: string;

    switch (goal.period) {
      case 'daily':
        startDate = getStartOfDay();
        break;
      case 'weekly':
        startDate = getStartOfWeek();
        break;
      case 'monthly':
        startDate = getStartOfMonth();
        break;
    }

    const relevantSessions = sessions.filter(
      (s) => s.hobbyId === goal.hobbyId && s.startTime >= startDate,
    );

    let current: number;
    if (goal.type === 'duration') {
      current = relevantSessions.reduce((sum, s) => sum + s.duration, 0);
    } else if (goal.type === 'sessions') {
      current = relevantSessions.length;
    } else {
      // streak — count consecutive days
      current = 0; // simplified
    }

    const percentage = Math.min((current / goal.target) * 100, 100);

    let status: GoalProgress['status'];
    if (percentage >= 100) {
      status = 'completed';
    } else if (percentage >= 50) {
      status = 'on_track';
    } else {
      status = 'behind';
    }

    return { goal, hobby, current, percentage, status };
  },

  getAllGoalProgress: () => {
    const goals = get().goals.filter((g) => g.isActive);
    return goals
      .map((g) => get().getGoalProgress(g.id))
      .filter((p): p is GoalProgress => p !== null);
  },
}));
