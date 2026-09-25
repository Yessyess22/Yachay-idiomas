/** Tokens oficiales del Design System de Yachay Quechua — Paleta Wiphala Neón */
export const BrandColors = {
  brandGreen: '#00C853',
  brandDarkGreen: '#009624',
  brandNavy: '#1E1B4B',
  accentOrange: '#FF9100',
  accentGold: '#FFB300',
  accentBlue: '#00B0FF',
  accentPurple: '#7C3AED',
  streakFire: '#FF3D00',
  bgLight: '#F8FAF9',

  // Auxiliares
  white: '#FFFFFF',
  danger: '#FF3366',
  dangerLight: '#FFE4EC',
  success: '#00C853',
  successLight: '#E8F8F0',
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  border: '#E2E8F0',
} as const;

export type BrandColor = keyof typeof BrandColors;
