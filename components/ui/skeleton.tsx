/**
 * Skeleton Loading Component
 * 
 * Animated placeholder for loading states
 */

import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 20, borderRadius = 8, style }: SkeletonProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.border,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function ProfileSkeleton() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Header Skeleton */}
        <View style={styles.header}>
          <Skeleton width={80} height={80} borderRadius={40} />
          <View style={styles.headerInfo}>
            <Skeleton width={150} height={24} style={{ marginBottom: 8 }} />
            <Skeleton width={100} height={16} />
          </View>
        </View>

        {/* Navigation Cards Skeleton */}
        <View style={styles.section}>
          {[1, 2, 3, 4].map((i) => (
            <View
              key={i}
              style={[
                styles.card,
                {
                  backgroundColor: colors.backgroundSecondary,
                  borderColor: colors.border,
                },
              ]}
            >
              <Skeleton width={40} height={40} borderRadius={20} />
              <View style={styles.cardContent}>
                <Skeleton width={120} height={18} style={{ marginBottom: 6 }} />
                <Skeleton width={180} height={14} />
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {},
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    gap: 16,
  },
  headerInfo: {
    flex: 1,
  },
  section: {
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 16,
  },
  cardContent: {
    flex: 1,
  },
});
