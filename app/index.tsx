// ============================================
// Dashboard Screen (Home)
// ============================================

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../src/hooks/useTheme';
import { useHobbyStore } from '../src/stores/hobbyStore';
import { useGoalStore } from '../src/stores/goalStore';
import { useTimerStore } from '../src/stores/timerStore';
import { typography } from '../src/theme/typography';
import { spacing, borderRadius, shadows } from '../src/theme/spacing';
import { formatDurationHuman, formatDurationShort } from '../src/utils/time';
import { hexToRgba } from '../src/utils/helpers';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const theme = useTheme();
  const router = useRouter();
  const allHobbies = useHobbyStore((s) => s.hobbies);
  const hobbies = allHobbies.filter((h) => !h.isArchived);
  const getTodaySessions = useHobbyStore((s) => s.getTodaySessions);
  const getTotalDurationToday = useHobbyStore((s) => s.getTotalDurationToday);
  const sessions = useHobbyStore((s) => s.sessions);
  const allGoalProgress = useGoalStore((s) => s.getAllGoalProgress);
  const timerHobbyId = useTimerStore((s) => s.hobbyId);

  const todaySessions = getTodaySessions();
  const totalToday = getTotalDurationToday();
  const hobbiesTrackedToday = new Set(todaySessions.map((s) => s.hobbyId)).size;
  const goalProgress = allGoalProgress();

  const completedGoals = goalProgress.filter((g) => g.status === 'completed').length;
  const totalGoals = goalProgress.length;

  // Get time per hobby today
  const hobbyTimeToday = hobbies.map((hobby) => {
    const hobSessions = todaySessions.filter((s) => s.hobbyId === hobby.id);
    const duration = hobSessions.reduce((sum, s) => sum + s.duration, 0);
    return { hobby, duration, sessionCount: hobSessions.length };
  }).sort((a, b) => b.duration - a.duration);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[typography.caption, { color: theme.textSecondary }]}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </Text>
            <Text style={[typography.h1, { color: theme.textPrimary, marginTop: 4 }]}>
              Dashboard
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.settingsBtn, { backgroundColor: theme.surfaceElevated }]}
            onPress={() => router.push('/settings')}
          >
            <Ionicons name="settings-outline" size={22} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Stats Cards Row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.statIcon, { backgroundColor: hexToRgba(theme.primary, 0.15) }]}>
              <Ionicons name="time-outline" size={20} color={theme.primary} />
            </View>
            <Text style={[typography.h3, { color: theme.textPrimary, marginTop: 8 }]}>
              {formatDurationHuman(totalToday)}
            </Text>
            <Text style={[typography.caption, { color: theme.textSecondary }]}>
              Today
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.statIcon, { backgroundColor: hexToRgba(theme.accent, 0.15) }]}>
              <Ionicons name="flash-outline" size={20} color={theme.accent} />
            </View>
            <Text style={[typography.h3, { color: theme.textPrimary, marginTop: 8 }]}>
              {todaySessions.length}
            </Text>
            <Text style={[typography.caption, { color: theme.textSecondary }]}>
              Sessions
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.statIcon, { backgroundColor: hexToRgba(theme.warning, 0.15) }]}>
              <Ionicons name="trophy-outline" size={20} color={theme.warning} />
            </View>
            <Text style={[typography.h3, { color: theme.textPrimary, marginTop: 8 }]}>
              {completedGoals}/{totalGoals}
            </Text>
            <Text style={[typography.caption, { color: theme.textSecondary }]}>
              Goals
            </Text>
          </View>
        </View>

        {/* Quick Start Timer */}
        <View style={styles.sectionHeader}>
          <Text style={[typography.h4, { color: theme.textPrimary }]}>
            Quick Start
          </Text>
          <TouchableOpacity onPress={() => router.push('/hobbies')}>
            <Text style={[typography.bodySmMedium, { color: theme.primary }]}>
              View All
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickStartRow}
        >
          {hobbies.map((hobby) => {
            const isActive = timerHobbyId === hobby.id;
            return (
              <TouchableOpacity
                key={hobby.id}
                style={[
                  styles.quickStartCard,
                  {
                    backgroundColor: isActive
                      ? hexToRgba(hobby.color, 0.2)
                      : theme.surface,
                    borderColor: isActive ? hobby.color : theme.border,
                  },
                ]}
                onPress={() => router.push(`/timer?hobbyId=${hobby.id}`)}
                activeOpacity={0.8}
              >
                <View style={[styles.hobbyIcon, { backgroundColor: hexToRgba(hobby.color, 0.2) }]}>
                  <Ionicons name={hobby.icon as any} size={24} color={hobby.color} />
                </View>
                <Text
                  style={[typography.bodySmMedium, { color: theme.textPrimary, marginTop: 8 }]}
                  numberOfLines={1}
                >
                  {hobby.name}
                </Text>
                {isActive && (
                  <View style={[styles.activeBadge, { backgroundColor: theme.accent }]}>
                    <Text style={[typography.caption, { color: '#fff', fontWeight: '700' }]}>
                      ACTIVE
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Goal Progress */}
        {goalProgress.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={[typography.h4, { color: theme.textPrimary }]}>
                Goal Progress
              </Text>
              <TouchableOpacity onPress={() => router.push('/goals')}>
                <Text style={[typography.bodySmMedium, { color: theme.primary }]}>
                  See All
                </Text>
              </TouchableOpacity>
            </View>

            {goalProgress.slice(0, 3).map((gp) => (
              <View
                key={gp.goal.id}
                style={[styles.goalCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
              >
                <View style={styles.goalHeader}>
                  <View style={styles.goalInfo}>
                    <View style={[styles.goalDot, { backgroundColor: gp.hobby.color }]} />
                    <Text style={[typography.bodySmMedium, { color: theme.textPrimary }]}>
                      {gp.hobby.name}
                    </Text>
                  </View>
                  <Text
                    style={[
                      typography.captionMedium,
                      {
                        color:
                          gp.status === 'completed'
                            ? theme.accent
                            : gp.status === 'behind'
                            ? theme.danger
                            : theme.warning,
                      },
                    ]}
                  >
                    {gp.status === 'completed'
                      ? '✅ Done'
                      : gp.status === 'behind'
                      ? '⚠️ Behind'
                      : '🔄 On Track'}
                  </Text>
                </View>

                {/* Progress Bar */}
                <View style={[styles.progressBarBg, { backgroundColor: theme.surfaceHighlight }]}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${Math.min(gp.percentage, 100)}%`,
                        backgroundColor:
                          gp.status === 'completed'
                            ? theme.accent
                            : gp.status === 'behind'
                            ? theme.danger
                            : theme.primary,
                      },
                    ]}
                  />
                </View>

                <View style={styles.goalFooter}>
                  <Text style={[typography.caption, { color: theme.textSecondary }]}>
                    {gp.goal.type === 'duration'
                      ? `${formatDurationShort(gp.current)} / ${formatDurationShort(gp.goal.target)}`
                      : `${gp.current} / ${gp.goal.target} sessions`}
                  </Text>
                  <Text style={[typography.captionMedium, { color: theme.textSecondary }]}>
                    {Math.round(gp.percentage)}%
                  </Text>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Today's Activity */}
        <View style={styles.sectionHeader}>
          <Text style={[typography.h4, { color: theme.textPrimary }]}>
            Today's Activity
          </Text>
        </View>

        {hobbyTimeToday.length > 0 ? (
          hobbyTimeToday
            .filter((ht) => ht.duration > 0)
            .map((ht) => (
              <TouchableOpacity
                key={ht.hobby.id}
                style={[styles.activityCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                activeOpacity={0.7}
                onPress={() => router.push(`/timer?hobbyId=${ht.hobby.id}`)}
              >
                <View style={[styles.activityIcon, { backgroundColor: hexToRgba(ht.hobby.color, 0.15) }]}>
                  <Ionicons name={ht.hobby.icon as any} size={22} color={ht.hobby.color} />
                </View>
                <View style={styles.activityInfo}>
                  <Text style={[typography.bodyMedium, { color: theme.textPrimary }]}>
                    {ht.hobby.name}
                  </Text>
                  <Text style={[typography.caption, { color: theme.textSecondary }]}>
                    {ht.sessionCount} session{ht.sessionCount !== 1 ? 's' : ''}
                  </Text>
                </View>
                <Text style={[typography.h4, { color: ht.hobby.color }]}>
                  {formatDurationHuman(ht.duration)}
                </Text>
              </TouchableOpacity>
            ))
        ) : (
          <View style={[styles.emptyCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="sunny-outline" size={40} color={theme.textTertiary} />
            <Text style={[typography.bodyMedium, { color: theme.textSecondary, marginTop: 12 }]}>
              No activity today yet
            </Text>
            <Text style={[typography.bodySm, { color: theme.textTertiary, marginTop: 4 }]}>
              Tap a hobby above to start tracking!
            </Text>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: spacing.lg,
    marginBottom: spacing['2xl'],
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing['2xl'],
  },
  statCard: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  quickStartRow: {
    gap: spacing.md,
    paddingRight: spacing.lg,
  },
  quickStartCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    width: 120,
  },
  hobbyIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeBadge: {
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  goalCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  goalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  goalDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  activityIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  emptyCard: {
    padding: spacing['3xl'],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
