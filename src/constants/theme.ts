export const colors = {
  background: '#FFF9F0',
  primary: '#FF6B6B',
  secondary: '#4ECDC4',
  accentPurple: '#A78BFA',
  accentYellow: '#FFE66D',
  success: '#6BCB77',
  error: '#FF9999',
  text: '#2D3748',
  textLight: '#718096',
  card: '#FFFFFF',
  border: '#E8E0D5',
  shadow: 'rgba(0,0,0,0.08)',

  // Subject colors
  counting: '#FF6B6B',
  addition: '#4ECDC4',
  subtraction: '#A78BFA',
  pronunciation: '#F6C90E',
  reading: '#45B7D1',

  // Difficulty colors
  easy: '#6BCB77',
  medium: '#FFE66D',
  hard: '#FF6B6B',
} as const;

export const fonts = {
  regular: 'Nunito_400Regular',
  bold: 'Nunito_700Bold',
  extraBold: 'Nunito_800ExtraBold',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  full: 9999,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 18,
  lg: 22,
  xl: 28,
  xxl: 40,
  display: 64,
} as const;

export const minTapSize = 56;
