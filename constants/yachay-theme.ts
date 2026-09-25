import { Platform } from 'react-native';

export const Theme = {
  colors: {
    primaryDark: '#1E1B4B',
    primaryDarkGreen: '#009624',
    accentGreen: '#00C853',
    accentOrange: '#FF9100',
    accentGold: '#FFB300',
    accentBlue: '#00B0FF',
    accentPurple: '#7C3AED',
    fireOrange: '#FF3D00',
    secondaryGray: '#F1F5F9',
    cream: '#F8FAF9',
    textTitleGray: '#1E293B',
    textSubtitleGray: '#64748B',
    white: '#FFFFFF',
    cardBorder: '#E2E8F0',
    danger: '#FF3366',
  },
  fonts: {
    titleLarge: { fontSize: 28, lineHeight: 34 },
    titleMedium: { fontSize: 22, lineHeight: 28 },
    titleSmall: { fontSize: 18, lineHeight: 24 },
    bodyLarge: { fontSize: 16, lineHeight: 22 },
    bodyMedium: { fontSize: 14, lineHeight: 20 },
    bodySmall: { fontSize: 12, lineHeight: 16 },
    label: { fontSize: 13, lineHeight: 16 },
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 40 },
  radius: { sm: 8, md: 14, lg: 20, xl: 28, pill: 999 },
  shadow: Platform.select({
    android: { elevation: 3 },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
    },
  }),
} as const;

export const TABLET_BREAKPOINT = 768;
