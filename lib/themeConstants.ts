/**
 * Tech Yuva Navy-Blue Technical Design System Constants
 * Central source of truth synchronized with theme.css
 */

export const NAVY_THEME = {
  backgrounds: {
    base: '#050B18',
    elevated: '#0A1428',
    surface: '#0F1B33',
    surfaceHover: '#14264A',
    surfaceActive: '#1A3160',
    overlay: 'rgba(5, 11, 24, 0.80)',
    input: '#0B1730',
  },
  borders: {
    subtle: '#16264A',
    default: '#1E3358',
    strong: '#2C4A82',
    accent: '#1E90FF',
  },
  accent: {
    primary: '#1E90FF',
    hover: '#3AA0FF',
    active: '#1478D6',
    bright: '#38BDF8',
    deep: '#2563EB',
    soft: 'rgba(30, 144, 255, 0.12)',
    glow: 'rgba(30, 144, 255, 0.35)',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#C7D3E8',
    muted: '#9FB0CC',
    disabled: '#5B6B8A',
    onAccent: '#FFFFFF',
    link: '#38BDF8',
    linkHover: '#7DD3FC',
  },
  status: {
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#38BDF8',
  },
  heritage: {
    saffron: '#FF9933',
    green: '#00C853',
  },
  gradients: {
    hero: 'linear-gradient(135deg, #050B18 0%, #0A1428 45%, #0F2A5C 100%)',
    accent: 'linear-gradient(135deg, #1E90FF 0%, #2563EB 100%)',
    text: 'linear-gradient(90deg, #38BDF8 0%, #1E90FF 100%)',
    card: 'linear-gradient(180deg, #0F1B33 0%, #0A1428 100%)',
    glow: 'radial-gradient(circle at 50% 0%, rgba(30, 144, 255, 0.25), transparent 60%)',
  },
  shadows: {
    sm: '0 2px 8px rgba(0, 0, 0, 0.4)',
    md: '0 8px 24px rgba(0, 0, 0, 0.5)',
    card: '0 8px 30px rgba(5, 11, 24, 0.7)',
    modal: '0 24px 60px rgba(2, 6, 15, 0.85), 0 0 0 1px #1E3358',
    glow: '0 0 24px rgba(30, 144, 255, 0.25)',
    glowStrong: '0 0 40px rgba(30, 144, 255, 0.45)',
  },
  transitions: {
    fast: '0.15s ease',
    normal: '0.25s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  // Legacy aliases for backward compatibility
  colors: {
    bgDeep: '#050B18',
    bgSecondary: '#0A1428',
    surface: '#0F1B33',
    surfaceElevated: '#14264A',
    border: '#1E3358',
    borderFocus: '#1E90FF',
    primary: '#1E90FF',
    primaryHover: '#3AA0FF',
    primaryGlow: 'rgba(30, 144, 255, 0.35)',
    textPrimary: '#FFFFFF',
    textMuted: '#9FB0CC',
    textDim: '#5B6B8A',
    success: '#22C55E',
    error: '#EF4444',
    warning: '#F59E0B',
  },
};
