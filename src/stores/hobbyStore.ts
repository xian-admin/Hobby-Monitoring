// ============================================
// Hobby Store (Zustand)
// ============================================

import { create } from 'zustand';
import { Hobby, Session, HOBBY_COLORS } from '../types';
import { loadData, saveData, STORAGE_KEYS } from '../utils/storage';
import { generateId } from '../utils/helpers';

interface HobbyState {
  hobbies: Hobby[];
  sessions: Session[];
  initialized: boolean;

  // Actions
  initialize: () => Promise<void>;
  addHobby: (hobby: Omit<Hobby, 'id' | 'createdAt' | 'isArchived'>) => void;
  updateHobby: (id: string, updates: Partial<Hobby>) => void;
  deleteHobby: (id: string) => void;
  archiveHobby: (id: string) => void;

  // Sessions
  addSession: (session: Omit<Session, 'id'>) => void;
  deleteSession: (id: string) => void;
  getSessionsByHobby: (hobbyId: string) => Session[];
  getSessionsInRange: (startDate: string, endDate: string) => Session[];
  getTodaySessions: () => Session[];
  getTotalDurationToday: () => number;
  getHobbyTotalDuration: (hobbyId: string) => number;
}

const DEFAULT_HOBBIES: Hobby[] = [
  {
    id: 'demo-1',
    name: 'Phone Usage',
    category: 'custom',
    color: HOBBY_COLORS[6], // Red
    icon: 'phone-portrait-outline',
    description: 'Screen time monitoring',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    isArchived: false,
  },
  {
    id: 'demo-2',
    name: 'Drinking',
    category: 'custom',
    color: HOBBY_COLORS[4], // Cyan/Blue
    icon: 'wine-outline',
    description: 'Alcohol consumption tracking',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    isArchived: false,
  },
];

function generateDemoSessions(): Session[] {
  const sessions: Session[] = [];
  const hobbies = ['demo-1', 'demo-2'];
  const durations = [1800, 2400, 3600, 1200, 2700, 900, 4500];

  for (let day = 6; day >= 0; day--) {
    const numSessions = Math.floor(Math.random() * 3) + 1;
    for (let j = 0; j < numSessions; j++) {
      const hobbyId = hobbies[j % hobbies.length];
      const duration = durations[Math.floor(Math.random() * durations.length)];
      const d = new Date();
      d.setDate(d.getDate() - day);
      d.setHours(9 + j * 3, Math.floor(Math.random() * 60), 0, 0);
      const endTime = new Date(d.getTime() + duration * 1000);

      sessions.push({
        id: `demo-s-${day}-${j}`,
        hobbyId,
        startTime: d.toISOString(),
        endTime: endTime.toISOString(),
        duration,
        notes: '',
        isManual: false,
      });
    }
  }

  return sessions;
}

export const useHobbyStore = create<HobbyState>((set, get) => ({
  hobbies: [],
  sessions: [],
  initialized: false,

  initialize: async () => {
    const savedHobbies = await loadData<Hobby[]>(STORAGE_KEYS.HOBBIES);
    const savedSessions = await loadData<Session[]>(STORAGE_KEYS.SESSIONS);

    if (savedHobbies && savedHobbies.length > 0) {
      set({
        hobbies: savedHobbies,
        sessions: savedSessions || [],
        initialized: true,
      });
    } else {
      // Load demo data for first-time users
      const demoSessions = generateDemoSessions();
      set({
        hobbies: DEFAULT_HOBBIES,
        sessions: demoSessions,
        initialized: true,
      });
      saveData(STORAGE_KEYS.HOBBIES, DEFAULT_HOBBIES);
      saveData(STORAGE_KEYS.SESSIONS, demoSessions);
    }
  },

  addHobby: (hobbyData) => {
    const newHobby: Hobby = {
      ...hobbyData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      isArchived: false,
    };
    const hobbies = [...get().hobbies, newHobby];
    set({ hobbies });
    saveData(STORAGE_KEYS.HOBBIES, hobbies);
  },

  updateHobby: (id, updates) => {
    const hobbies = get().hobbies.map((h) =>
      h.id === id ? { ...h, ...updates } : h,
    );
    set({ hobbies });
    saveData(STORAGE_KEYS.HOBBIES, hobbies);
  },

  deleteHobby: (id) => {
    const hobbies = get().hobbies.filter((h) => h.id !== id);
    const sessions = get().sessions.filter((s) => s.hobbyId !== id);
    set({ hobbies, sessions });
    saveData(STORAGE_KEYS.HOBBIES, hobbies);
    saveData(STORAGE_KEYS.SESSIONS, sessions);
  },

  archiveHobby: (id) => {
    const hobbies = get().hobbies.map((h) =>
      h.id === id ? { ...h, isArchived: !h.isArchived } : h,
    );
    set({ hobbies });
    saveData(STORAGE_KEYS.HOBBIES, hobbies);
  },

  addSession: (sessionData) => {
    const newSession: Session = {
      ...sessionData,
      id: generateId(),
    };
    const sessions = [...get().sessions, newSession];
    set({ sessions });
    saveData(STORAGE_KEYS.SESSIONS, sessions);
  },

  deleteSession: (id) => {
    const sessions = get().sessions.filter((s) => s.id !== id);
    set({ sessions });
    saveData(STORAGE_KEYS.SESSIONS, sessions);
  },

  getSessionsByHobby: (hobbyId) => {
    return get().sessions.filter((s) => s.hobbyId === hobbyId);
  },

  getSessionsInRange: (startDate, endDate) => {
    return get().sessions.filter((s) => {
      return s.startTime >= startDate && s.startTime <= endDate;
    });
  },

  getTodaySessions: () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString();
    return get().sessions.filter((s) => s.startTime >= todayStr);
  },

  getTotalDurationToday: () => {
    return get()
      .getTodaySessions()
      .reduce((sum, s) => sum + s.duration, 0);
  },

  getHobbyTotalDuration: (hobbyId) => {
    return get()
      .sessions.filter((s) => s.hobbyId === hobbyId)
      .reduce((sum, s) => sum + s.duration, 0);
  },
}));
