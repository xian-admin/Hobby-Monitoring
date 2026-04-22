// ============================================
// Analytics Screen
// ============================================

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Rect, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../../src/hooks/useTheme';
import { useHobbyStore } from '../../src/stores/hobbyStore';
import { typography } from '../../src/theme/typography';
import { spacing, borderRadius } from '../../src/theme/spacing';
import { formatDurationHuman, formatDurationShort, getLastNDays, isSameDay } from '../../src/utils/time';
import { hexToRgba } from '../../src/utils/helpers';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - spacing.lg * 2;

type Period = '7d' | '30d' | 'all';

export default function AnalyticsScreen() {
  const theme = useTheme();
  const allHobbies = useHobbyStore((s) => s.hobbies);
  const hobbies = allHobbies.filter((h) => !h.isArchived);
  const sessions = useHobbyStore((s) => s.sessions);
  const [period, setPeriod] = useState<Period>('7d');

  // Filter sessions by period
  const filteredSessions = useMemo(() => {
    if (period === 'all') return sessions;
    const days = period === '7d' ? 7 : 30;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    cutoff.setHours(0, 0, 0, 0);
    return sessions.filter((s) => new Date(s.startTime) >= cutoff);
  }, [sessions, period]);

  // Total stats
  const totalDuration = filteredSessions.reduce((sum, s) => sum + s.duration, 0);
  const totalSessions = filteredSessions.length;
  const avgSessionDuration = totalSessions > 0 ? totalDuration / totalSessions : 0;

  // Per-hobby breakdown
  const hobbyBreakdown = useMemo(() => {
    return hobbies
      .map((hobby) => {
        const hSessions = filteredSessions.filter((s) => s.hobbyId === hobby.id);
        const duration = hSessions.reduce((sum, s) => sum + s.duration, 0);
        return { hobby, duration, sessionCount: hSessions.length };
      })
      .sort((a, b) => b.duration - a.duration);
  }, [hobbies, filteredSessions]);

  // Daily data for bar chart (last 7 days)
  const dailyData = useMemo(() => {
    const days = getLastNDays(7);
    return days.map((dateStr) => {
      const daySessions = sessions.filter((s) => {
        const sDate = new Date(s.startTime).toISOString().split('T')[0];
        return sDate === dateStr;
      });
      const total = daySessions.reduce((sum, s) => sum + s.duration, 0);
      const dayName = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });
      return { date: dateStr, dayName, total };
    });
  }, [sessions]);

  const maxDaily = Math.max(...dailyData.map((d) => d.total), 1);

  // Streak calendar data (last 30 days for heatmap)
  const heatmapData = useMemo(() => {
    const days = getLastNDays(35);
    return days.map((dateStr) => {
      const daySessions = sessions.filter((s) => {
        const sDate = new Date(s.startTime).toISOString().split('T')[0];
        return sDate === dateStr;
      });
      const total = daySessions.reduce((sum, s) => sum + s.duration, 0);
      return { date: dateStr, total };
    });
  }, [sessions]);

  const maxHeatmap = Math.max(...heatmapData.map((d) => d.total), 1);

  // Longest session
  const longestSession = filteredSessions.length > 0
    ? Math.max(...filteredSessions.map((s) => s.duration))
    : 0;

  // Donut chart data
  const donutTotal = hobbyBreakdown.reduce((sum, hb) => sum + hb.duration, 0) || 1;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={[typography.h1, { color: theme.textPrimary, marginTop: spacing.lg }]}>
          Analytics
        </Text>

        {/* Period Selector */}
        <View style={styles.periodRow}>
          {(['7d', '30d', 'all'] as Period[]).map((p) => (
            <TouchableOpacity
              key={p}
              style={[
                styles.periodBtn,
                {
                  backgroundColor: period === p ? theme.primary : theme.surface,
                  borderColor: period === p ? theme.primary : theme.border,
                },
              ]}
              onPress={() => setPeriod(p)}
            >
              <Text
                style={[
                  typography.bodySmMedium,
                  { color: period === p ? '#fff' : theme.textSecondary },
                ]}
              >
                {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : 'All Time'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Overview Stats */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="time-outline" size={22} color={theme.primary} />
            <Text style={[typography.h3, { color: theme.textPrimary, marginTop: 6 }]}>
              {formatDurationHuman(totalDuration)}
            </Text>
            <Text style={[typography.caption, { color: theme.textSecondary }]}>Total Time</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="flash-outline" size={22} color={theme.accent} />
            <Text style={[typography.h3, { color: theme.textPrimary, marginTop: 6 }]}>
              {totalSessions}
            </Text>
            <Text style={[typography.caption, { color: theme.textSecondary }]}>Sessions</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="speedometer-outline" size={22} color={theme.warning} />
            <Text style={[typography.h3, { color: theme.textPrimary, marginTop: 6 }]}>
              {formatDurationShort(avgSessionDuration)}
            </Text>
            <Text style={[typography.caption, { color: theme.textSecondary }]}>Avg Session</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="ribbon-outline" size={22} color={theme.danger} />
            <Text style={[typography.h3, { color: theme.textPrimary, marginTop: 6 }]}>
              {formatDurationShort(longestSession)}
            </Text>
            <Text style={[typography.caption, { color: theme.textSecondary }]}>Longest</Text>
          </View>
        </View>

        {/* Weekly Bar Chart */}
        <Text style={[typography.h4, { color: theme.textPrimary, marginTop: spacing['2xl'] }]}>
          Last 7 Days
        </Text>
        <View style={[styles.chartCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Svg width={CHART_WIDTH - 32} height={160}>
            {dailyData.map((day, i) => {
              const barWidth = (CHART_WIDTH - 32 - 48) / 7 - 8;
              const barHeight = maxDaily > 0 ? (day.total / maxDaily) * 120 : 0;
              const x = 24 + i * (barWidth + 8);
              const isToday = i === 6;

              return (
                <React.Fragment key={day.date}>
                  <Rect
                    x={x}
                    y={130 - barHeight}
                    width={barWidth}
                    height={Math.max(barHeight, 2)}
                    rx={4}
                    fill={isToday ? theme.primary : hexToRgba(theme.primary, 0.4)}
                  />
                  <SvgText
                    x={x + barWidth / 2}
                    y={150}
                    textAnchor="middle"
                    fontSize={10}
                    fill={isToday ? theme.textPrimary : theme.textTertiary}
                    fontWeight={isToday ? '600' : '400'}
                  >
                    {day.dayName}
                  </SvgText>
                  {barHeight > 20 && (
                    <SvgText
                      x={x + barWidth / 2}
                      y={125 - barHeight}
                      textAnchor="middle"
                      fontSize={9}
                      fill={theme.textSecondary}
                    >
                      {formatDurationShort(day.total)}
                    </SvgText>
                  )}
                </React.Fragment>
              );
            })}
          </Svg>
        </View>

        {/* Activity Heatmap */}
        <Text style={[typography.h4, { color: theme.textPrimary, marginTop: spacing['2xl'] }]}>
          Activity Heatmap
        </Text>
        <View style={[styles.chartCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.heatmapGrid}>
            {heatmapData.map((day) => {
              const intensity = day.total > 0 ? Math.min(day.total / maxHeatmap, 1) : 0;
              const bg =
                intensity === 0
                  ? theme.surfaceHighlight
                  : hexToRgba(theme.accent, 0.2 + intensity * 0.8);

              return (
                <View
                  key={day.date}
                  style={[
                    styles.heatmapCell,
                    { backgroundColor: bg },
                  ]}
                />
              );
            })}
          </View>
          <View style={styles.heatmapLegend}>
            <Text style={[typography.caption, { color: theme.textTertiary }]}>Less</Text>
            {[0, 0.25, 0.5, 0.75, 1].map((v) => (
              <View
                key={v}
                style={[
                  styles.heatmapLegendCell,
                  {
                    backgroundColor:
                      v === 0
                        ? theme.surfaceHighlight
                        : hexToRgba(theme.accent, 0.2 + v * 0.8),
                  },
                ]}
              />
            ))}
            <Text style={[typography.caption, { color: theme.textTertiary }]}>More</Text>
          </View>
        </View>

        {/* Hobby Breakdown */}
        <Text style={[typography.h4, { color: theme.textPrimary, marginTop: spacing['2xl'] }]}>
          Time Distribution
        </Text>
        {hobbyBreakdown.map((hb) => {
          const percentage = (hb.duration / donutTotal) * 100;
          return (
            <View
              key={hb.hobby.id}
              style={[
                styles.breakdownCard,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <View style={styles.breakdownHeader}>
                <View
                  style={[
                    styles.breakdownDot,
                    { backgroundColor: hb.hobby.color },
                  ]}
                />
                <Text
                  style={[
                    typography.bodyMedium,
                    { color: theme.textPrimary, flex: 1, marginLeft: spacing.sm },
                  ]}
                >
                  {hb.hobby.name}
                </Text>
                <Text style={[typography.bodySmMedium, { color: hb.hobby.color }]}>
                  {formatDurationHuman(hb.duration)}
                </Text>
              </View>
              <View style={[styles.breakdownBar, { backgroundColor: theme.surfaceHighlight }]}>
                <View
                  style={[
                    styles.breakdownBarFill,
                    {
                      width: `${percentage}%`,
                      backgroundColor: hb.hobby.color,
                    },
                  ]}
                />
              </View>
              <View style={styles.breakdownFooter}>
                <Text style={[typography.caption, { color: theme.textTertiary }]}>
                  {hb.sessionCount} session{hb.sessionCount !== 1 ? 's' : ''}
                </Text>
                <Text style={[typography.caption, { color: theme.textTertiary }]}>
                  {Math.round(percentage)}%
                </Text>
              </View>
            </View>
          );
        })}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.lg },
  periodRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statCard: {
    width: (SCREEN_WIDTH - spacing.lg * 2 - spacing.md) / 2 - 1,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  chartCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginTop: spacing.md,
    alignItems: 'center',
  },
  heatmapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    justifyContent: 'center',
  },
  heatmapCell: {
    width: 18,
    height: 18,
    borderRadius: 4,
  },
  heatmapLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.md,
  },
  heatmapLegendCell: {
    width: 14,
    height: 14,
    borderRadius: 3,
  },
  breakdownCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginTop: spacing.md,
  },
  breakdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  breakdownDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  breakdownBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  breakdownBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  breakdownFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
});
