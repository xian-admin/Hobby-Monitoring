// ============================================
// Goals Screen
// ============================================

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/hooks/useTheme';
import { useGoalStore } from '../../src/stores/goalStore';
import { useHobbyStore } from '../../src/stores/hobbyStore';
import { typography } from '../../src/theme/typography';
import { spacing, borderRadius } from '../../src/theme/spacing';
import { formatDurationShort } from '../../src/utils/time';
import { hexToRgba } from '../../src/utils/helpers';
import { GoalPeriod, GoalType } from '../../src/types';

export default function GoalsScreen() {
  const theme = useTheme();
  const goals = useGoalStore((s) => s.goals);
  const getAllGoalProgress = useGoalStore((s) => s.getAllGoalProgress);
  const addGoal = useGoalStore((s) => s.addGoal);
  const deleteGoal = useGoalStore((s) => s.deleteGoal);
  const toggleGoal = useGoalStore((s) => s.toggleGoal);
  const allHobbies = useHobbyStore((s) => s.hobbies);
  const hobbies = allHobbies.filter((h) => !h.isArchived);

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedHobbyId, setSelectedHobbyId] = useState<string | null>(null);
  const [goalType, setGoalType] = useState<GoalType>('duration');
  const [goalPeriod, setGoalPeriod] = useState<GoalPeriod>('daily');
  const [targetHours, setTargetHours] = useState('1');
  const [targetMinutes, setTargetMinutes] = useState('0');
  const [targetSessions, setTargetSessions] = useState('3');

  const progressList = getAllGoalProgress();
  const completedCount = progressList.filter((g) => g.status === 'completed').length;

  const handleAddGoal = () => {
    if (!selectedHobbyId) return;
    let target: number;
    if (goalType === 'duration') {
      target = parseInt(targetHours || '0') * 3600 + parseInt(targetMinutes || '0') * 60;
      if (target <= 0) return;
    } else {
      target = parseInt(targetSessions || '1');
      if (target <= 0) return;
    }

    addGoal({
      hobbyId: selectedHobbyId,
      type: goalType,
      period: goalPeriod,
      target,
      isActive: true,
    });

    setSelectedHobbyId(null);
    setGoalType('duration');
    setGoalPeriod('daily');
    setTargetHours('1');
    setTargetMinutes('0');
    setTargetSessions('3');
    setShowAddModal(false);
  };

  const handleDeleteGoal = (id: string) => {
    Alert.alert('Delete Goal', 'Remove this goal?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteGoal(id) },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[typography.h1, { color: theme.textPrimary }]}>Goals</Text>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: theme.primary }]}
            onPress={() => setShowAddModal(true)}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Summary */}
        <View style={[styles.summaryCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.summaryItem}>
            <Text style={[typography.h2, { color: theme.primary }]}>
              {progressList.length}
            </Text>
            <Text style={[typography.caption, { color: theme.textSecondary }]}>
              Active Goals
            </Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: theme.border }]} />
          <View style={styles.summaryItem}>
            <Text style={[typography.h2, { color: theme.accent }]}>
              {completedCount}
            </Text>
            <Text style={[typography.caption, { color: theme.textSecondary }]}>
              Completed
            </Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: theme.border }]} />
          <View style={styles.summaryItem}>
            <Text style={[typography.h2, { color: theme.warning }]}>
              {progressList.length - completedCount}
            </Text>
            <Text style={[typography.caption, { color: theme.textSecondary }]}>
              In Progress
            </Text>
          </View>
        </View>

        {/* Goal Cards */}
        {progressList.map((gp) => (
          <View
            key={gp.goal.id}
            style={[
              styles.goalCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                borderLeftWidth: 4,
                borderLeftColor:
                  gp.status === 'completed'
                    ? theme.accent
                    : gp.status === 'behind'
                    ? theme.danger
                    : theme.primary,
              },
            ]}
          >
            <View style={styles.goalHeader}>
              <View style={styles.goalInfo}>
                <View
                  style={[
                    styles.goalIcon,
                    { backgroundColor: hexToRgba(gp.hobby.color, 0.15) },
                  ]}
                >
                  <Ionicons name={gp.hobby.icon as any} size={20} color={gp.hobby.color} />
                </View>
                <View style={{ marginLeft: spacing.md, flex: 1 }}>
                  <Text style={[typography.bodyMedium, { color: theme.textPrimary }]}>
                    {gp.hobby.name}
                  </Text>
                  <Text style={[typography.caption, { color: theme.textSecondary }]}>
                    {gp.goal.period.charAt(0).toUpperCase() + gp.goal.period.slice(1)} •{' '}
                    {gp.goal.type === 'duration'
                      ? formatDurationShort(gp.goal.target)
                      : `${gp.goal.target} sessions`}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => handleDeleteGoal(gp.goal.id)}>
                <Ionicons name="trash-outline" size={18} color={theme.textTertiary} />
              </TouchableOpacity>
            </View>

            {/* Progress */}
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
              <Text style={[typography.bodySm, { color: theme.textSecondary }]}>
                {gp.goal.type === 'duration'
                  ? `${formatDurationShort(gp.current)} / ${formatDurationShort(gp.goal.target)}`
                  : `${gp.current} / ${gp.goal.target} sessions`}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      gp.status === 'completed'
                        ? hexToRgba(theme.accent, 0.15)
                        : gp.status === 'behind'
                        ? hexToRgba(theme.danger, 0.15)
                        : hexToRgba(theme.primary, 0.15),
                  },
                ]}
              >
                <Text
                  style={[
                    typography.captionMedium,
                    {
                      color:
                        gp.status === 'completed'
                          ? theme.accent
                          : gp.status === 'behind'
                          ? theme.danger
                          : theme.primary,
                    },
                  ]}
                >
                  {Math.round(gp.percentage)}%
                  {gp.status === 'completed' ? ' ✓' : ''}
                </Text>
              </View>
            </View>
          </View>
        ))}

        {progressList.length === 0 && (
          <View style={[styles.emptyState, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="trophy-outline" size={48} color={theme.textTertiary} />
            <Text style={[typography.h4, { color: theme.textSecondary, marginTop: 16 }]}>
              No goals set
            </Text>
            <Text style={[typography.bodySm, { color: theme.textTertiary, marginTop: 8, textAlign: 'center' }]}>
              Set time targets for your hobbies to stay motivated!
            </Text>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Add Goal Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[typography.h3, { color: theme.textPrimary }]}>New Goal</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Hobby Selector */}
            <Text style={[typography.captionMedium, { color: theme.textSecondary, marginTop: spacing.xl }]}>
              HOBBY
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: spacing.sm }}>
              {hobbies.map((hobby) => (
                <TouchableOpacity
                  key={hobby.id}
                  style={[
                    styles.chipSmall,
                    {
                      backgroundColor:
                        selectedHobbyId === hobby.id
                          ? hexToRgba(hobby.color, 0.2)
                          : theme.surface,
                      borderColor: selectedHobbyId === hobby.id ? hobby.color : theme.border,
                    },
                  ]}
                  onPress={() => setSelectedHobbyId(hobby.id)}
                >
                  <Text
                    style={[
                      typography.bodySm,
                      {
                        color: selectedHobbyId === hobby.id ? theme.textPrimary : theme.textSecondary,
                      },
                    ]}
                  >
                    {hobby.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Goal Type */}
            <Text style={[typography.captionMedium, { color: theme.textSecondary, marginTop: spacing.lg }]}>
              TYPE
            </Text>
            <View style={styles.chipRow}>
              {(['duration', 'sessions'] as GoalType[]).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.chipSmall,
                    {
                      backgroundColor:
                        goalType === type ? hexToRgba(theme.primary, 0.2) : theme.surface,
                      borderColor: goalType === type ? theme.primary : theme.border,
                    },
                  ]}
                  onPress={() => setGoalType(type)}
                >
                  <Text
                    style={[
                      typography.bodySm,
                      { color: goalType === type ? theme.primary : theme.textSecondary },
                    ]}
                  >
                    {type === 'duration' ? '⏱ Duration' : '⚡ Sessions'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Period */}
            <Text style={[typography.captionMedium, { color: theme.textSecondary, marginTop: spacing.lg }]}>
              PERIOD
            </Text>
            <View style={styles.chipRow}>
              {(['daily', 'weekly', 'monthly'] as GoalPeriod[]).map((period) => (
                <TouchableOpacity
                  key={period}
                  style={[
                    styles.chipSmall,
                    {
                      backgroundColor:
                        goalPeriod === period ? hexToRgba(theme.primary, 0.2) : theme.surface,
                      borderColor: goalPeriod === period ? theme.primary : theme.border,
                    },
                  ]}
                  onPress={() => setGoalPeriod(period)}
                >
                  <Text
                    style={[
                      typography.bodySm,
                      { color: goalPeriod === period ? theme.primary : theme.textSecondary },
                    ]}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Target */}
            <Text style={[typography.captionMedium, { color: theme.textSecondary, marginTop: spacing.lg }]}>
              TARGET
            </Text>
            {goalType === 'duration' ? (
              <View style={styles.durationRow}>
                <View style={styles.durationField}>
                  <TextInput
                    style={[styles.numInput, { backgroundColor: theme.surface, color: theme.textPrimary, borderColor: theme.border }]}
                    keyboardType="number-pad"
                    value={targetHours}
                    onChangeText={setTargetHours}
                    maxLength={2}
                  />
                  <Text style={[typography.caption, { color: theme.textSecondary }]}>hours</Text>
                </View>
                <Text style={[typography.h3, { color: theme.textTertiary }]}>:</Text>
                <View style={styles.durationField}>
                  <TextInput
                    style={[styles.numInput, { backgroundColor: theme.surface, color: theme.textPrimary, borderColor: theme.border }]}
                    keyboardType="number-pad"
                    value={targetMinutes}
                    onChangeText={setTargetMinutes}
                    maxLength={2}
                  />
                  <Text style={[typography.caption, { color: theme.textSecondary }]}>min</Text>
                </View>
              </View>
            ) : (
              <TextInput
                style={[
                  styles.numInputWide,
                  { backgroundColor: theme.surface, color: theme.textPrimary, borderColor: theme.border },
                ]}
                keyboardType="number-pad"
                value={targetSessions}
                onChangeText={setTargetSessions}
                maxLength={3}
                placeholder="Number of sessions"
                placeholderTextColor={theme.textTertiary}
              />
            )}

            <TouchableOpacity
              style={[
                styles.submitBtn,
                { backgroundColor: selectedHobbyId ? theme.primary : theme.surfaceElevated },
              ]}
              onPress={handleAddGoal}
              disabled={!selectedHobbyId}
            >
              <Text
                style={[
                  typography.bodyMedium,
                  { color: selectedHobbyId ? '#fff' : theme.textTertiary },
                ]}
              >
                Create Goal
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.lg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCard: {
    flexDirection: 'row',
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing['2xl'],
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryDivider: { width: 1, marginVertical: spacing.sm },
  goalCard: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  goalInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  goalIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBarBg: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  emptyState: {
    padding: spacing['4xl'],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalContent: {
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    padding: spacing['2xl'],
    paddingBottom: spacing['5xl'],
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  chipSmall: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    marginRight: spacing.sm,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  durationField: { alignItems: 'center' },
  numInput: {
    width: 72,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  numInputWide: {
    fontSize: 18,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginTop: spacing.sm,
  },
  submitBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginTop: spacing['2xl'],
  },
});
