// ============================================
// Hobby Monitoring App — Type Definitions
// ============================================

export type HobbyCategory =
  | 'sports'
  | 'music'
  | 'art'
  | 'reading'
  | 'coding'
  | 'gaming'
  | 'fitness'
  | 'cooking'
  | 'photography'
  | 'custom';

export interface Hobby {
  id: string;
  name: string;
  category: HobbyCategory;
  color: string;
  icon: string;
  description: string;
  createdAt: string; // ISO date
  isArchived: boolean;
}

export interface Session {
  id: string;
  hobbyId: string;
  startTime: string; // ISO date
  endTime: string; // ISO date
  duration: number; // in seconds
  notes: string;
  isManual: boolean; // manual entry vs timer
}

export type GoalPeriod = 'daily' | 'weekly' | 'monthly';
export type GoalType = 'duration' | 'sessions' | 'streak';

export interface Goal {
  id: string;
  hobbyId: string;
  type: GoalType;
  period: GoalPeriod;
  target: number; // seconds for duration, count for sessions/streak
  isActive: boolean;
  createdAt: string;
}

export interface GoalProgress {
  goal: Goal;
  hobby: Hobby;
  current: number;
  percentage: number;
  status: 'on_track' | 'behind' | 'completed' | 'missed';
}

export interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  hobbyId: string | null;
  startTime: number | null;
  elapsed: number; // in seconds
  pausedAt: number | null;
}

export interface DailyStats {
  date: string;
  totalDuration: number;
  sessionCount: number;
  hobbiesTracked: number;
}

export interface HobbyStats {
  hobbyId: string;
  totalDuration: number;
  sessionCount: number;
  averageSessionDuration: number;
  longestSession: number;
  currentStreak: number;
  longestStreak: number;
  lastSessionDate: string | null;
}

export const HOBBY_CATEGORIES: { key: HobbyCategory; label: string; icon: string }[] = [
  { key: 'sports', label: 'Sports', icon: 'basketball-outline' },
  { key: 'music', label: 'Music', icon: 'musical-notes-outline' },
  { key: 'art', label: 'Art', icon: 'color-palette-outline' },
  { key: 'reading', label: 'Reading', icon: 'book-outline' },
  { key: 'coding', label: 'Coding', icon: 'code-slash-outline' },
  { key: 'gaming', label: 'Gaming', icon: 'game-controller-outline' },
  { key: 'fitness', label: 'Fitness', icon: 'barbell-outline' },
  { key: 'cooking', label: 'Cooking', icon: 'restaurant-outline' },
  { key: 'photography', label: 'Photography', icon: 'camera-outline' },
  { key: 'custom', label: 'Custom', icon: 'star-outline' },
];

export const HOBBY_COLORS = [
  '#7C3AED', // Violet
  '#06D6A0', // Emerald
  '#FFD166', // Amber
  '#EF476F', // Rose
  '#118AB2', // Cyan
  '#F77F00', // Orange
  '#E63946', // Red
  '#2EC4B6', // Teal
  '#9B5DE5', // Purple
  '#F15BB5', // Pink
  '#00BBF9', // Sky
  '#00F5D4', // Mint
];
