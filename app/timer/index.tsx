// ============================================
// Timer Screen
// ============================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../src/hooks/useTheme';
import { useTimer } from '../../src/hooks/useTimer';
import { useHobbyStore } from '../../src/stores/hobbyStore';
import { typography } from '../../src/theme/typography';
import { spacing, borderRadius } from '../../src/theme/spacing';
import { formatDuration, formatDurationHuman, formatDate } from '../../src/utils/time';
import { hexToRgba } from '../../src/utils/helpers';

export default function TimerScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ hobbyId?: string }>();
  const timer = useTimer();
  const allHobbies = useHobbyStore((s) => s.hobbies);
  const hobbies = allHobbies.filter((h) => !h.isArchived);
  const sessions = useHobbyStore((s) => s.sessions);
  const addSession = useHobbyStore((s) => s.addSession);
  const [selectedHobbyId, setSelectedHobbyId] = useState<string | null>(
    params.hobbyId || null,
  );

  // Manual entry modal state
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualHours, setManualHours] = useState('0');
  const [manualMinutes, setManualMinutes] = useState('30');
  const [manualNotes, setManualNotes] = useState('');

  const activeHobby = hobbies.find((h) => h.id === (timer.hobbyId || selectedHobbyId));
  const currentHobbyId = timer.hobbyId || selectedHobbyId;

  // Recent sessions for current hobby
  const recentSessions = currentHobbyId
    ? sessions
        .filter((s) => s.hobbyId === currentHobbyId)
        .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
        .slice(0, 5)
    : [];

  useEffect(() => {
    if (params.hobbyId) {
      setSelectedHobbyId(params.hobbyId);
    }
  }, [params.hobbyId]);

  const handleStart = () => {
    if (!selectedHobbyId) {
      Alert.alert('Select a Hobby', 'Choose a hobby to start tracking.');
      return;
    }
    timer.startTimer(selectedHobbyId);
  };

  const handleStop = () => {
    Alert.alert('Stop Timer', 'Save this session?', [
      {
        text: 'Discard',
        style: 'destructive',
        onPress: () => timer.resetTimer(),
      },
      {
        text: 'Save',
        onPress: () => timer.stopTimer(),
      },
    ]);
  };

  const handleManualEntry = () => {
    if (!currentHobbyId) return;
    const durationSecs =
      parseInt(manualHours || '0') * 3600 + parseInt(manualMinutes || '0') * 60;
    if (durationSecs <= 0) return;

    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - durationSecs * 1000);

    addSession({
      hobbyId: currentHobbyId,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration: durationSecs,
      notes: manualNotes.trim(),
      isManual: true,
    });

    setManualHours('0');
    setManualMinutes('30');
    setManualNotes('');
    setShowManualModal(false);
  };

  const hobbyColor = activeHobby?.color || theme.primary;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <Text style={[typography.h1, { color: theme.textPrimary, marginTop: spacing.lg }]}>
          Timer
        </Text>

        {/* Hobby Selector */}
        {!timer.isRunning && !timer.isPaused && (
          <>
            <Text
              style={[
                typography.captionMedium,
                { color: theme.textSecondary, marginTop: spacing['2xl'] },
              ]}
            >
              SELECT HOBBY
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginTop: spacing.md }}
              contentContainerStyle={{ gap: spacing.sm }}
            >
              {hobbies.map((hobby) => (
                <TouchableOpacity
                  key={hobby.id}
                  style={[
                    styles.hobbyChip,
                    {
                      backgroundColor:
                        selectedHobbyId === hobby.id
                          ? hexToRgba(hobby.color, 0.2)
                          : theme.surface,
                      borderColor:
                        selectedHobbyId === hobby.id ? hobby.color : theme.border,
                    },
                  ]}
                  onPress={() => setSelectedHobbyId(hobby.id)}
                >
                  <Ionicons name={hobby.icon as any} size={18} color={hobby.color} />
                  <Text
                    style={[
                      typography.bodySmMedium,
                      {
                        color:
                          selectedHobbyId === hobby.id
                            ? theme.textPrimary
                            : theme.textSecondary,
                        marginLeft: 6,
                      },
                    ]}
                  >
                    {hobby.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* Timer Display */}
        <View style={styles.timerSection}>
          {/* Active hobby label */}
          {activeHobby && (
            <View style={styles.activeHobbyLabel}>
              <Ionicons name={activeHobby.icon as any} size={20} color={hobbyColor} />
              <Text style={[typography.bodyMedium, { color: hobbyColor, marginLeft: 8 }]}>
                {activeHobby.name}
              </Text>
            </View>
          )}

          {/* Timer Ring */}
          <View
            style={[
              styles.timerRing,
              {
                borderColor: timer.isRunning
                  ? hobbyColor
                  : timer.isPaused
                  ? theme.warning
                  : theme.border,
                backgroundColor: timer.isRunning
                  ? hexToRgba(hobbyColor, 0.05)
                  : theme.surface,
              },
            ]}
          >
            <Text
              style={[
                typography.timer,
                {
                  color: timer.isRunning
                    ? theme.textPrimary
                    : timer.isPaused
                    ? theme.warning
                    : theme.textTertiary,
                },
              ]}
            >
              {formatDuration(timer.elapsed)}
            </Text>
            {timer.isRunning && (
              <View style={styles.timerIndicator}>
                <View style={[styles.pulseDot, { backgroundColor: hobbyColor }]} />
                <Text style={[typography.caption, { color: theme.accent, marginLeft: 6 }]}>
                  Recording
                </Text>
              </View>
            )}
            {timer.isPaused && (
              <Text style={[typography.caption, { color: theme.warning, marginTop: 8 }]}>
                Paused
              </Text>
            )}
          </View>

          {/* Control Buttons */}
          <View style={styles.controlRow}>
            {!timer.isRunning && !timer.isPaused ? (
              // Start button
              <TouchableOpacity
                style={[
                  styles.mainBtn,
                  {
                    backgroundColor: selectedHobbyId ? hobbyColor : theme.surfaceElevated,
                  },
                ]}
                onPress={handleStart}
                disabled={!selectedHobbyId}
              >
                <Ionicons
                  name="play"
                  size={32}
                  color={selectedHobbyId ? '#fff' : theme.textTertiary}
                />
              </TouchableOpacity>
            ) : (
              <>
                {/* Stop button */}
                <TouchableOpacity
                  style={[styles.sideBtn, { backgroundColor: hexToRgba(theme.danger, 0.15) }]}
                  onPress={handleStop}
                >
                  <Ionicons name="stop" size={24} color={theme.danger} />
                </TouchableOpacity>

                {/* Pause / Resume */}
                <TouchableOpacity
                  style={[
                    styles.mainBtn,
                    {
                      backgroundColor: timer.isPaused ? hobbyColor : theme.warning,
                    },
                  ]}
                  onPress={timer.isPaused ? timer.resumeTimer : timer.pauseTimer}
                >
                  <Ionicons
                    name={timer.isPaused ? 'play' : 'pause'}
                    size={32}
                    color="#fff"
                  />
                </TouchableOpacity>

                {/* Reset */}
                <TouchableOpacity
                  style={[styles.sideBtn, { backgroundColor: theme.surfaceElevated }]}
                  onPress={timer.resetTimer}
                >
                  <Ionicons name="refresh" size={24} color={theme.textSecondary} />
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Manual Entry Button */}
          {!timer.isRunning && !timer.isPaused && currentHobbyId && (
            <TouchableOpacity
              style={[styles.manualBtn, { borderColor: theme.border }]}
              onPress={() => setShowManualModal(true)}
            >
              <Ionicons name="create-outline" size={18} color={theme.textSecondary} />
              <Text style={[typography.bodySm, { color: theme.textSecondary, marginLeft: 8 }]}>
                Add Manual Entry
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Recent Sessions */}
        {recentSessions.length > 0 && (
          <>
            <Text
              style={[
                typography.h4,
                { color: theme.textPrimary, marginTop: spacing['2xl'] },
              ]}
            >
              Recent Sessions
            </Text>
            {recentSessions.map((session) => (
              <View
                key={session.id}
                style={[
                  styles.sessionCard,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
              >
                <View style={styles.sessionInfo}>
                  <Text style={[typography.bodySmMedium, { color: theme.textPrimary }]}>
                    {formatDurationHuman(session.duration)}
                  </Text>
                  <Text style={[typography.caption, { color: theme.textSecondary }]}>
                    {formatDate(session.startTime)}
                    {session.isManual ? ' • Manual' : ''}
                  </Text>
                </View>
                {session.notes ? (
                  <Text
                    style={[typography.caption, { color: theme.textTertiary }]}
                    numberOfLines={1}
                  >
                    {session.notes}
                  </Text>
                ) : null}
              </View>
            ))}
          </>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Manual Entry Modal */}
      <Modal visible={showManualModal} animationType="slide" transparent>
        <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[typography.h3, { color: theme.textPrimary }]}>
                Manual Entry
              </Text>
              <TouchableOpacity onPress={() => setShowManualModal(false)}>
                <Ionicons name="close" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text
              style={[
                typography.captionMedium,
                { color: theme.textSecondary, marginTop: spacing.xl },
              ]}
            >
              DURATION
            </Text>
            <View style={styles.durationInputRow}>
              <View style={styles.durationField}>
                <TextInput
                  style={[
                    styles.durationInput,
                    { backgroundColor: theme.surface, color: theme.textPrimary, borderColor: theme.border },
                  ]}
                  keyboardType="number-pad"
                  value={manualHours}
                  onChangeText={setManualHours}
                  maxLength={2}
                />
                <Text style={[typography.caption, { color: theme.textSecondary }]}>hours</Text>
              </View>
              <Text style={[typography.h3, { color: theme.textTertiary }]}>:</Text>
              <View style={styles.durationField}>
                <TextInput
                  style={[
                    styles.durationInput,
                    { backgroundColor: theme.surface, color: theme.textPrimary, borderColor: theme.border },
                  ]}
                  keyboardType="number-pad"
                  value={manualMinutes}
                  onChangeText={setManualMinutes}
                  maxLength={2}
                />
                <Text style={[typography.caption, { color: theme.textSecondary }]}>min</Text>
              </View>
            </View>

            <Text
              style={[
                typography.captionMedium,
                { color: theme.textSecondary, marginTop: spacing.lg },
              ]}
            >
              NOTES (OPTIONAL)
            </Text>
            <TextInput
              style={[
                styles.notesInput,
                { backgroundColor: theme.surface, color: theme.textPrimary, borderColor: theme.border },
              ]}
              placeholder="What did you work on?"
              placeholderTextColor={theme.textTertiary}
              value={manualNotes}
              onChangeText={setManualNotes}
              multiline
            />

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: hobbyColor }]}
              onPress={handleManualEntry}
            >
              <Ionicons name="checkmark" size={20} color="#fff" />
              <Text style={[typography.bodyMedium, { color: '#fff', marginLeft: 8 }]}>
                Save Session
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
  hobbyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  timerSection: {
    alignItems: 'center',
    marginTop: spacing['3xl'],
  },
  activeHobbyLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  timerRing: {
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  timerIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
  },
  mainBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sideBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  manualBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    marginTop: spacing['2xl'],
  },
  sessionCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginTop: spacing.md,
  },
  sessionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  durationInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  durationField: { alignItems: 'center' },
  durationInput: {
    width: 80,
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '600',
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    fontSize: 16,
    marginTop: spacing.sm,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginTop: spacing['2xl'],
  },
});
