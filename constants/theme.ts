/**
 * FretPro Theme
 * 
 * Professional, minimal design for musicians.
 * Optimized for both light and dark modes.
 */

import { Platform } from 'react-native';

// Brand colors - work in both themes
const brand = {
  primary: '#00D9FF',    // Cyan - main accent
  secondary: '#FF6B9D',  // Pink - secondary accent
  success: '#00FF88',    // Green - success states
  warning: '#FFB800',    // Amber - warnings
  error: '#FF4757',      // Red - errors
};

export const Colors = {
  light: {
    // Text
    text: '#000000',
    textSecondary: '#666666',
    textTertiary: '#999999',
    textDisabled: '#CCCCCC',
    
    // Backgrounds
    background: '#FFFFFF',
    backgroundSecondary: '#F5F5F5',
    backgroundTertiary: '#EEEEEE',
    
    // UI Elements
    border: '#E0E0E0',
    divider: '#F0F0F0',
    overlay: 'rgba(0, 0, 0, 0.5)',
    
    // Brand colors
    tint: brand.primary,
    primary: brand.primary,
    secondary: brand.secondary,
    success: brand.success,
    warning: brand.warning,
    error: brand.error,
    
    // Tab bar
    tabIconDefault: '#999999',
    tabIconSelected: brand.primary,
    tabBarBackground: '#FFFFFF',
  },
  dark: {
    // Text
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    textTertiary: '#707070',
    textDisabled: '#404040',
    
    // Backgrounds
    background: '#0A0A0A',
    backgroundSecondary: '#1A1A1A',
    backgroundTertiary: '#2A2A2A',
    
    // UI Elements
    border: '#333333',
    divider: '#1F1F1F',
    overlay: 'rgba(0, 0, 0, 0.8)',
    
    // Brand colors
    tint: brand.primary,
    primary: brand.primary,
    secondary: brand.secondary,
    success: brand.success,
    warning: brand.warning,
    error: brand.error,
    
    // Tab bar
    tabIconDefault: '#707070',
    tabIconSelected: brand.primary,
    tabBarBackground: '#0A0A0A',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
