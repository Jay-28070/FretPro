/**
 * Level Display Component
 * 
 * Shows player level, XP bar, and title
 */

import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { StyleSheet, Text, View } from 'react-native';

interface LevelDisplayProps {
  level: number;
  xp: number;
  xpToNextLevel: number;
  xpProgress: number;
  title: string;
}

export function LevelDisplay({ level, xp, xpToNextLevel, xpProgress, title }: LevelDisplayProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      {/* Level Badge */}
      <View style={[styles.levelBadge, { backgroundColor: colors.primary }]}>
        <Text style={[styles.levelNumber, { color: colors.background }]}>
          {level}
        </Text>
      </View>

      {/* Level Info */}
      <View style={styles.levelInfo}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.primary }]}>
            {title}
          </Text>
          <Text style={[styles.levelText, { color: colors.textSecondary }]}>
            Level {level}
          </Text>
        </View>

        {/* XP Bar */}
        <View style={[styles.xpBarContainer, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.xpBarFill,
              {
                backgroundColor: colors.primary,
                width: `${xpProgress}%`,
              },
            ]}
          />
        </View>

        {/* XP Text */}
        <Text style={[styles.xpText, { color: colors.textSecondary }]}>
          {xp} / {xpToNextLevel} XP
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 16,
  },
  levelBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelNumber: {
    fontSize: 28,
    fontWeight: '900',
  },
  levelInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  levelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  xpBarContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  xpBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  xpText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
