/**
 * Toast Notification Component
 * 
 * Better-looking alternative to window.alert()
 */

import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useEffect, useState } from 'react';
import { Animated, Platform, StyleSheet, Text } from 'react-native';
import { IconSymbol } from './icon-symbol';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  onHide?: () => void;
}

export function Toast({ message, type = 'info', duration = 3000, onHide }: ToastProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Auto hide after duration
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        onHide?.();
      });
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const getIcon = () => {
    switch (type) {
      case 'success': return 'checkmark.circle.fill';
      case 'error': return 'xmark.circle.fill';
      case 'warning': return 'exclamationmark.triangle.fill';
      default: return 'info.circle.fill';
    }
  };

  const getColor = () => {
    switch (type) {
      case 'success': return colors.success;
      case 'error': return colors.error;
      case 'warning': return colors.warning;
      default: return colors.primary;
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.backgroundSecondary,
          borderColor: getColor(),
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-20, 0],
              }),
            },
          ],
        },
      ]}
    >
      <IconSymbol name={getIcon()} size={24} color={getColor()} />
      <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 20 : 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 9999,
  },
  message: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
});

// Toast Manager for showing toasts
let toastCallback: ((toast: { message: string; type: 'success' | 'error' | 'info' | 'warning' }) => void) | null = null;

export function setToastCallback(callback: typeof toastCallback) {
  toastCallback = callback;
}

export function showToast(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') {
  if (toastCallback) {
    toastCallback({ message, type });
  } else if (Platform.OS === 'web') {
    // Fallback to alert if toast system not initialized
    window.alert(message);
  }
}
