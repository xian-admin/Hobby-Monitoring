// ============================================
// Utility — Storage Helpers (AsyncStorage)
// ============================================

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  HOBBIES: '@hobby_monitor/hobbies',
  SESSIONS: '@hobby_monitor/sessions',
  GOALS: '@hobby_monitor/goals',
  SETTINGS: '@hobby_monitor/settings',
  TIMER: '@hobby_monitor/timer',
};

export async function loadData<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
    return null;
  } catch (error) {
    console.error(`Error loading ${key}:`, error);
    return null;
  }
}

export async function saveData<T>(key: string, data: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key}:`, error);
  }
}

export async function clearData(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error clearing ${key}:`, error);
  }
}

export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
  } catch (error) {
    console.error('Error clearing all data:', error);
  }
}

export { STORAGE_KEYS };
