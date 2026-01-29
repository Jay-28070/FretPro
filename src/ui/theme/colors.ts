/**
 * FretPro Color Theme
 * 
 * Dark-mode focused design for musicians.
 * High contrast for stage/low-light use.
 */

export const colors = {
  // Background
  background: {
    primary: '#0A0A0A',
    secondary: '#1A1A1A',
    tertiary: '#2A2A2A',
  },

  // Text
  text: {
    primary: '#FFFFFF',
    secondary: '#B0B0B0',
    tertiary: '#707070',
    disabled: '#404040',
  },

  // Accent colors
  accent: {
    primary: '#00D9FF',    // Bright cyan
    secondary: '#FF6B9D',  // Pink
    success: '#00FF88',    // Green
    warning: '#FFB800',    // Amber
    error: '#FF4757',      // Red
  },

  // Tuner-specific
  tuner: {
    sharp: '#FF6B9D',      // Pink (sharp)
    flat: '#00D9FF',       // Cyan (flat)
    inTune: '#00FF88',     // Green (perfect)
    needle: '#FFFFFF',
  },

  // UI elements
  ui: {
    border: '#333333',
    divider: '#1F1F1F',
    overlay: 'rgba(0, 0, 0, 0.8)',
    shadow: 'rgba(0, 0, 0, 0.5)',
  },

  // Metronome
  metronome: {
    accent: '#FF6B9D',
    normal: '#00D9FF',
    inactive: '#404040',
  },
} as const;

export type ColorTheme = typeof colors;
