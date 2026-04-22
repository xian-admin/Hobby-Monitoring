// ============================================
// Hook — useTheme
// ============================================

import { colors, type ThemeColors } from '../theme/colors';
import { useSettingsStore } from '../stores/settingsStore';

export function useTheme(): ThemeColors {
  const isDarkMode = useSettingsStore((s) => s.isDarkMode);
  return isDarkMode ? colors.dark : colors.light;
}
