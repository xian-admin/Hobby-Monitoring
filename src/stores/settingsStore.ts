// ============================================
// Settings Store (Zustand)
// ============================================

import { create } from 'zustand';
import { loadData, saveData, STORAGE_KEYS } from '../utils/storage';

interface SettingsState {
  isDarkMode: boolean;
  notificationsEnabled: boolean;
  reminderTime: string; // HH:MM format
  initialized: boolean;

  // Actions
  initialize: () => Promise<void>;
  toggleDarkMode: () => void;
  toggleNotifications: () => void;
  setReminderTime: (time: string) => void;
}

interface PersistedSettings {
  isDarkMode: boolean;
  notificationsEnabled: boolean;
  reminderTime: string;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  isDarkMode: true,
  notificationsEnabled: true,
  reminderTime: '09:00',
  initialized: false,

  initialize: async () => {
    const saved = await loadData<PersistedSettings>(STORAGE_KEYS.SETTINGS);
    if (saved) {
      set({ ...saved, initialized: true });
    } else {
      set({ initialized: true });
    }
  },

  toggleDarkMode: () => {
    const newVal = !get().isDarkMode;
    set({ isDarkMode: newVal });
    const { notificationsEnabled, reminderTime } = get();
    saveData(STORAGE_KEYS.SETTINGS, {
      isDarkMode: newVal,
      notificationsEnabled,
      reminderTime,
    });
  },

  toggleNotifications: () => {
    const newVal = !get().notificationsEnabled;
    set({ notificationsEnabled: newVal });
    const { isDarkMode, reminderTime } = get();
    saveData(STORAGE_KEYS.SETTINGS, {
      isDarkMode,
      notificationsEnabled: newVal,
      reminderTime,
    });
  },

  setReminderTime: (time: string) => {
    set({ reminderTime: time });
    const { isDarkMode, notificationsEnabled } = get();
    saveData(STORAGE_KEYS.SETTINGS, {
      isDarkMode,
      notificationsEnabled,
      reminderTime: time,
    });
  },
}));
