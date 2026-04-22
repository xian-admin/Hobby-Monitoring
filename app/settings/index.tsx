// ============================================
// Settings Screen
// ============================================

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/hooks/useTheme';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { useHobbyStore } from '../../src/stores/hobbyStore';
import { useGoalStore } from '../../src/stores/goalStore';
import { typography } from '../../src/theme/typography';
import { spacing, borderRadius } from '../../src/theme/spacing';
import { clearAllData } from '../../src/utils/storage';

export default function SettingsScreen() {
  const theme = useTheme();
  const isDarkMode = useSettingsStore((s) => s.isDarkMode);
  const toggleDarkMode = useSettingsStore((s) => s.toggleDarkMode);
  const notificationsEnabled = useSettingsStore((s) => s.notificationsEnabled);
  const toggleNotifications = useSettingsStore((s) => s.toggleNotifications);
  const hobbies = useHobbyStore((s) => s.hobbies);
  const sessions = useHobbyStore((s) => s.sessions);
  const goals = useGoalStore((s) => s.goals);

  const handleExportData = async () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      app: 'Hobby Monitor',
      version: '1.0.0',
      hobbies,
      sessions,
      goals,
    };

    try {
      await Share.share({
        message: JSON.stringify(exportData, null, 2),
        title: 'Hobby Monitor Data Export',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to export data.');
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your hobbies, sessions, and goals. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Everything',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            // Re-initialize with defaults
            useHobbyStore.getState().initialize();
            useGoalStore.getState().initialize();
            Alert.alert('Done', 'All data has been cleared and defaults restored.');
          },
        },
      ],
    );
  };

  const SettingRow = ({
    icon,
    iconColor,
    label,
    sublabel,
    rightElement,
    onPress,
  }: {
    icon: string;
    iconColor: string;
    label: string;
    sublabel?: string;
    rightElement?: React.ReactNode;
    onPress?: () => void;
  }) => (
    <TouchableOpacity
      style={[styles.settingRow, { borderBottomColor: theme.border }]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.settingIcon, { backgroundColor: `${iconColor}20` }]}>
        <Ionicons name={icon as any} size={20} color={iconColor} />
      </View>
      <View style={styles.settingInfo}>
        <Text style={[typography.bodyMedium, { color: theme.textPrimary }]}>{label}</Text>
        {sublabel && (
          <Text style={[typography.caption, { color: theme.textSecondary }]}>{sublabel}</Text>
        )}
      </View>
      {rightElement || (
        onPress && <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={[typography.h1, { color: theme.textPrimary, marginTop: spacing.lg }]}>
          Settings
        </Text>

        {/* Appearance */}
        <Text
          style={[
            typography.captionMedium,
            { color: theme.textSecondary, marginTop: spacing['2xl'], marginBottom: spacing.sm },
          ]}
        >
          APPEARANCE
        </Text>
        <View style={[styles.settingGroup, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <SettingRow
            icon="moon-outline"
            iconColor={theme.primary}
            label="Dark Mode"
            sublabel={isDarkMode ? 'On' : 'Off'}
            rightElement={
              <Switch
                value={isDarkMode}
                onValueChange={toggleDarkMode}
                trackColor={{ false: theme.surfaceHighlight, true: theme.primaryLight }}
                thumbColor={isDarkMode ? theme.primary : theme.textTertiary}
              />
            }
          />
        </View>

        {/* Notifications */}
        <Text
          style={[
            typography.captionMedium,
            { color: theme.textSecondary, marginTop: spacing['2xl'], marginBottom: spacing.sm },
          ]}
        >
          NOTIFICATIONS
        </Text>
        <View style={[styles.settingGroup, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <SettingRow
            icon="notifications-outline"
            iconColor={theme.accent}
            label="Reminders"
            sublabel={notificationsEnabled ? 'Enabled' : 'Disabled'}
            rightElement={
              <Switch
                value={notificationsEnabled}
                onValueChange={toggleNotifications}
                trackColor={{ false: theme.surfaceHighlight, true: theme.accentLight }}
                thumbColor={notificationsEnabled ? theme.accent : theme.textTertiary}
              />
            }
          />
        </View>

        {/* Data */}
        <Text
          style={[
            typography.captionMedium,
            { color: theme.textSecondary, marginTop: spacing['2xl'], marginBottom: spacing.sm },
          ]}
        >
          DATA
        </Text>
        <View style={[styles.settingGroup, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <SettingRow
            icon="download-outline"
            iconColor={theme.primary}
            label="Export Data"
            sublabel="Download as JSON"
            onPress={handleExportData}
          />
          <SettingRow
            icon="trash-outline"
            iconColor={theme.danger}
            label="Clear All Data"
            sublabel="Delete everything and start fresh"
            onPress={handleClearData}
          />
        </View>

        {/* Stats */}
        <Text
          style={[
            typography.captionMedium,
            { color: theme.textSecondary, marginTop: spacing['2xl'], marginBottom: spacing.sm },
          ]}
        >
          YOUR DATA
        </Text>
        <View style={[styles.settingGroup, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <SettingRow
            icon="heart-outline"
            iconColor={theme.danger}
            label={`${hobbies.length} Hobbies`}
            sublabel=""
          />
          <SettingRow
            icon="flash-outline"
            iconColor={theme.warning}
            label={`${sessions.length} Sessions`}
            sublabel=""
          />
          <SettingRow
            icon="trophy-outline"
            iconColor={theme.accent}
            label={`${goals.length} Goals`}
            sublabel=""
          />
        </View>

        {/* About */}
        <Text
          style={[
            typography.captionMedium,
            { color: theme.textSecondary, marginTop: spacing['2xl'], marginBottom: spacing.sm },
          ]}
        >
          ABOUT
        </Text>
        <View style={[styles.settingGroup, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <SettingRow
            icon="information-circle-outline"
            iconColor={theme.textSecondary}
            label="Hobby Monitor"
            sublabel="Version 1.0.0"
          />
        </View>

        <Text
          style={[
            typography.caption,
            {
              color: theme.textTertiary,
              textAlign: 'center',
              marginTop: spacing['3xl'],
              marginBottom: spacing['3xl'],
            },
          ]}
        >
          Made with 💜 for tracking your passions
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.lg },
  settingGroup: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 0.5,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
});
