// ============================================
// Root Layout — Tab Navigation
// ============================================

import { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useSettingsStore } from '../src/stores/settingsStore';
import { useHobbyStore } from '../src/stores/hobbyStore';
import { useGoalStore } from '../src/stores/goalStore';
import { useTheme } from '../src/hooks/useTheme';
import { useTimerStore } from '../src/stores/timerStore';

export default function RootLayout() {
  const settingsInit = useSettingsStore((s) => s.initialized);
  const hobbyInit = useHobbyStore((s) => s.initialized);
  const goalInit = useGoalStore((s) => s.initialized);
  const isDarkMode = useSettingsStore((s) => s.isDarkMode);
  const theme = useTheme();
  const timerHobbyId = useTimerStore((s) => s.hobbyId);

  useEffect(() => {
    useSettingsStore.getState().initialize();
    useHobbyStore.getState().initialize();
    useGoalStore.getState().initialize();
  }, []);

  if (!settingsInit || !hobbyInit || !goalInit) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: theme.surface,
            borderTopColor: theme.border,
            borderTopWidth: 1,
            height: 88,
            paddingBottom: 28,
            paddingTop: 8,
          },
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.textTertiary,
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="grid-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="hobbies"
          options={{
            title: 'Hobbies',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="heart-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="timer"
          options={{
            title: 'Timer',
            tabBarIcon: ({ color, size }) => (
              <View style={timerHobbyId ? styles.timerActive : undefined}>
                <Ionicons
                  name={timerHobbyId ? 'timer' : 'timer-outline'}
                  size={size + 2}
                  color={timerHobbyId ? theme.accent : color}
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="goals"
          options={{
            title: 'Goals',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="trophy-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="analytics"
          options={{
            title: 'Analytics',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="bar-chart-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="settings-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerActive: {
    backgroundColor: 'rgba(6, 214, 160, 0.15)',
    borderRadius: 20,
    padding: 4,
  },
});
