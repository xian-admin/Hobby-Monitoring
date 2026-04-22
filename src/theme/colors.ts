// ============================================
// Theme — Color Palette
// ============================================

export const colors = {
  dark: {
    background: '#0F0F1A',
    surface: '#1A1A2E',
    surfaceElevated: '#252540',
    surfaceHighlight: '#2D2D4A',
    primary: '#7C3AED',
    primaryLight: '#A78BFA',
    primaryDark: '#5B21B6',
    accent: '#06D6A0',
    accentLight: '#34EDB8',
    warning: '#FFD166',
    warningDark: '#E6B800',
    danger: '#EF476F',
    dangerLight: '#FF6B8A',
    textPrimary: '#F8F8FF',
    textSecondary: '#9CA3AF',
    textTertiary: '#6B7280',
    border: '#2D2D4A',
    borderLight: '#3D3D5A',
    overlay: 'rgba(0, 0, 0, 0.6)',
    success: '#06D6A0',
    card: '#1E1E35',
  },
  light: {
    background: '#F5F5FF',
    surface: '#FFFFFF',
    surfaceElevated: '#F0F0FA',
    surfaceHighlight: '#E8E8F5',
    primary: '#7C3AED',
    primaryLight: '#A78BFA',
    primaryDark: '#5B21B6',
    accent: '#06D6A0',
    accentLight: '#34EDB8',
    warning: '#FFD166',
    warningDark: '#E6B800',
    danger: '#EF476F',
    dangerLight: '#FF6B8A',
    textPrimary: '#1A1A2E',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    border: '#E5E7EB',
    borderLight: '#D1D5DB',
    overlay: 'rgba(0, 0, 0, 0.3)',
    success: '#06D6A0',
    card: '#FFFFFF',
  },
};

export type ThemeColors = typeof colors.dark;
