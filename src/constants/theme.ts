/** Tokens oficiales del Design System de Yachay Quechua — Sprint 3 */
export const BrandColors = {
  brandGreen: '#1B8B8C',
  brandDarkGreen: '#0E4D55',
  brandNavy: '#1D264E',
  accentOrange: '#FF9800',
  streakFire: '#FF5722',
  bgLight: '#F9FBFA',

  // Auxiliares
  white: '#FFFFFF',
  danger: '#FF4B4B',
  dangerLight: '#FFDADC',
  success: '#1B8B8C',
  successLight: '#E0F2F1',
  textPrimary: '#333333',
  textSecondary: '#757575',
  border: '#E5E5E5',
} as const;

export type BrandColor = keyof typeof BrandColors;
