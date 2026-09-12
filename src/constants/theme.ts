/** Tokens oficiales del Design System de Yachay Quechua — Sprint 3 */
export const BrandColors = {
  brandGreen: '#4CAF50',
  brandDarkGreen: '#1A2F1A',
  brandNavy: '#1D264E',
  accentOrange: '#FF9800',
  streakFire: '#FF5722',
  bgLight: '#F9FBFA',

  // Auxiliares
  white: '#FFFFFF',
  danger: '#FF4B4B',
  dangerLight: '#FFDADC',
  success: '#58CC02',
  successLight: '#D7FFB8',
  textPrimary: '#333333',
  textSecondary: '#757575',
  border: '#E5E5E5',
} as const;

export type BrandColor = keyof typeof BrandColors;
