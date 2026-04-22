// ============================================
// Hobbies Screen — List & Management
// ============================================

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/hooks/useTheme';
import { useHobbyStore } from '../../src/stores/hobbyStore';
import { useTimerStore } from '../../src/stores/timerStore';
import { typography } from '../../src/theme/typography';
import { spacing, borderRadius } from '../../src/theme/spacing';
import { formatDurationHuman } from '../../src/utils/time';
import { hexToRgba } from '../../src/utils/helpers';
import { HOBBY_CATEGORIES, HOBBY_COLORS, type HobbyCategory } from '../../src/types';

export default function HobbiesScreen() {
  const theme = useTheme();
  const router = useRouter();
  const allHobbies = useHobbyStore((s) => s.hobbies);
  const hobbies = allHobbies.filter((h) => !h.isArchived);
  const getHobbyTotalDuration = useHobbyStore((s) => s.getHobbyTotalDuration);
  const sessions = useHobbyStore((s) => s.sessions);
  const addHobby = useHobbyStore((s) => s.addHobby);
  const deleteHobby = useHobbyStore((s) => s.deleteHobby);
  const timerHobbyId = useTimerStore((s) => s.hobbyId);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<HobbyCategory>('custom');
  const [selectedColor, setSelectedColor] = useState(HOBBY_COLORS[0]);

  const getCategoryData = (key: HobbyCategory) =>
    HOBBY_CATEGORIES.find((c) => c.key === key);

  const handleAddHobby = () => {
    if (!newName.trim()) return;
    const cat = getCategoryData(selectedCategory);
    addHobby({
      name: newName.trim(),
      category: selectedCategory,
      color: selectedColor,
      icon: cat?.icon || 'star-outline',
      description: newDescription.trim(),
    });
    setNewName('');
    setNewDescription('');
    setSelectedCategory('custom');
    setSelectedColor(HOBBY_COLORS[0]);
    setShowAddModal(false);
  };

  const handleDeleteHobby = (id: string, name: string) => {
    Alert.alert(
      'Delete Hobby',
      `Are you sure you want to delete "${name}"? All sessions will be lost.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteHobby(id) },
      ],
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[typography.h1, { color: theme.textPrimary }]}>Hobbies</Text>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: theme.primary }]}
            onPress={() => setShowAddModal(true)}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <Text style={[typography.bodySm, { color: theme.textSecondary, marginBottom: spacing['2xl'] }]}>
          {hobbies.length} hobby{hobbies.length !== 1 ? 'ies' : 'y'} tracked
        </Text>

        {/* Hobby Cards */}
        {hobbies.map((hobby) => {
          const totalDuration = getHobbyTotalDuration(hobby.id);
          const sessionCount = sessions.filter((s) => s.hobbyId === hobby.id).length;
          const isActive = timerHobbyId === hobby.id;

          return (
            <TouchableOpacity
              key={hobby.id}
              style={[
                styles.hobbyCard,
                {
                  backgroundColor: theme.surface,
                  borderColor: isActive ? hobby.color : theme.border,
                  borderLeftWidth: 4,
                  borderLeftColor: hobby.color,
                },
              ]}
              activeOpacity={0.8}
              onPress={() => router.push(`/timer?hobbyId=${hobby.id}`)}
            >
              <View style={styles.hobbyCardHeader}>
                <View style={[styles.hobbyIconCircle, { backgroundColor: hexToRgba(hobby.color, 0.15) }]}>
                  <Ionicons name={hobby.icon as any} size={24} color={hobby.color} />
                </View>
                <View style={styles.hobbyCardInfo}>
                  <View style={styles.hobbyNameRow}>
                    <Text style={[typography.h4, { color: theme.textPrimary, flex: 1 }]} numberOfLines={1}>
                      {hobby.name}
                    </Text>
                    {isActive && (
                      <View style={[styles.liveBadge, { backgroundColor: hexToRgba(theme.accent, 0.2) }]}>
                        <View style={[styles.liveDot, { backgroundColor: theme.accent }]} />
                        <Text style={[typography.caption, { color: theme.accent, fontWeight: '700' }]}>
                          LIVE
                        </Text>
                      </View>
                    )}
                  </View>
                  {hobby.description ? (
                    <Text style={[typography.caption, { color: theme.textSecondary, marginTop: 2 }]} numberOfLines={1}>
                      {hobby.description}
                    </Text>
                  ) : null}
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteHobby(hobby.id, hobby.name)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="trash-outline" size={18} color={theme.textTertiary} />
                </TouchableOpacity>
              </View>

              <View style={[styles.hobbyStats, { borderTopColor: theme.border }]}>
                <View style={styles.hobbyStatItem}>
                  <Ionicons name="time-outline" size={14} color={theme.textTertiary} />
                  <Text style={[typography.caption, { color: theme.textSecondary, marginLeft: 4 }]}>
                    {formatDurationHuman(totalDuration)}
                  </Text>
                </View>
                <View style={styles.hobbyStatItem}>
                  <Ionicons name="flash-outline" size={14} color={theme.textTertiary} />
                  <Text style={[typography.caption, { color: theme.textSecondary, marginLeft: 4 }]}>
                    {sessionCount} session{sessionCount !== 1 ? 's' : ''}
                  </Text>
                </View>
                <View style={styles.hobbyStatItem}>
                  <Ionicons name="color-palette-outline" size={14} color={hobby.color} />
                  <Text style={[typography.caption, { color: theme.textSecondary, marginLeft: 4 }]}>
                    {getCategoryData(hobby.category)?.label}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {hobbies.length === 0 && (
          <View style={[styles.emptyState, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="heart-outline" size={48} color={theme.textTertiary} />
            <Text style={[typography.h4, { color: theme.textSecondary, marginTop: 16 }]}>
              No hobbies yet
            </Text>
            <Text style={[typography.bodySm, { color: theme.textTertiary, marginTop: 8, textAlign: 'center' }]}>
              Tap the + button to add your first hobby and start tracking!
            </Text>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Add Hobby Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[typography.h3, { color: theme.textPrimary }]}>New Hobby</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Name Input */}
            <Text style={[typography.captionMedium, { color: theme.textSecondary, marginTop: spacing.xl }]}>
              NAME
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, color: theme.textPrimary, borderColor: theme.border }]}
              placeholder="e.g., Guitar Practice"
              placeholderTextColor={theme.textTertiary}
              value={newName}
              onChangeText={setNewName}
            />

            {/* Description */}
            <Text style={[typography.captionMedium, { color: theme.textSecondary, marginTop: spacing.lg }]}>
              DESCRIPTION (OPTIONAL)
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, color: theme.textPrimary, borderColor: theme.border }]}
              placeholder="Short description..."
              placeholderTextColor={theme.textTertiary}
              value={newDescription}
              onChangeText={setNewDescription}
            />

            {/* Category Selector */}
            <Text style={[typography.captionMedium, { color: theme.textSecondary, marginTop: spacing.lg }]}>
              CATEGORY
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
              {HOBBY_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.key}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor:
                        selectedCategory === cat.key
                          ? hexToRgba(theme.primary, 0.2)
                          : theme.surface,
                      borderColor:
                        selectedCategory === cat.key ? theme.primary : theme.border,
                    },
                  ]}
                  onPress={() => setSelectedCategory(cat.key)}
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={16}
                    color={selectedCategory === cat.key ? theme.primary : theme.textSecondary}
                  />
                  <Text
                    style={[
                      typography.caption,
                      {
                        color: selectedCategory === cat.key ? theme.primary : theme.textSecondary,
                        marginLeft: 4,
                      },
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Color Selector */}
            <Text style={[typography.captionMedium, { color: theme.textSecondary, marginTop: spacing.lg }]}>
              COLOR
            </Text>
            <View style={styles.colorRow}>
              {HOBBY_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorCircle,
                    {
                      backgroundColor: color,
                      borderWidth: selectedColor === color ? 3 : 0,
                      borderColor: '#fff',
                    },
                  ]}
                  onPress={() => setSelectedColor(color)}
                />
              ))}
            </View>

            {/* Add Button */}
            <TouchableOpacity
              style={[
                styles.addHobbyBtn,
                {
                  backgroundColor: newName.trim() ? theme.primary : theme.surfaceElevated,
                },
              ]}
              onPress={handleAddHobby}
              disabled={!newName.trim()}
            >
              <Ionicons name="add" size={20} color={newName.trim() ? '#fff' : theme.textTertiary} />
              <Text
                style={[
                  typography.bodyMedium,
                  {
                    color: newName.trim() ? '#fff' : theme.textTertiary,
                    marginLeft: 8,
                  },
                ]}
              >
                Add Hobby
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
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hobbyCard: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  hobbyCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  hobbyIconCircle: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hobbyCardInfo: { flex: 1, marginLeft: spacing.md },
  hobbyNameRow: { flexDirection: 'row', alignItems: 'center' },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    marginLeft: 8,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  hobbyStats: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    gap: spacing.xl,
  },
  hobbyStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyState: {
    padding: spacing['4xl'],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: spacing['2xl'],
  },
  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
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
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    fontSize: 16,
    marginTop: spacing.sm,
  },
  categoryRow: {
    marginTop: spacing.sm,
    flexDirection: 'row',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    marginRight: spacing.sm,
    marginTop: spacing.sm,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  addHobbyBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginTop: spacing['2xl'],
  },
});
