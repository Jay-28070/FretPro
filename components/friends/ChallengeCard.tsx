/**
 * Challenge Card Component
 * 
 * Displays recent challenge results in horizontal scroll.
 */

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { StyleSheet, Text, View } from 'react-native';

interface ChallengeCardProps {
  opponent: string;
  yourScore: number;
  theirScore: number;
  won: boolean;
}

export function ChallengeCard({ opponent, yourScore, theirScore, won }: ChallengeCardProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.card, { 
      backgroundColor: colors.backgroundSecondary,
      borderColor: won ? colors.success : colors.error,
    }]}>
      {/* Result Badge */}
      <View style={[styles.badge, { 
        backgroundColor: won ? colors.success : colors.error,
      }]}>
        <IconSymbol 
          name={won ? 'checkmark' : 'xmark'} 
          size={16} 
          color={colors.background}
        />
      </View>

      {/* Opponent */}
      <Text style={[styles.opponent, { color: colors.text }]}>
        vs {opponent}
      </Text>

      {/* Scores */}
      <View style={styles.scores}>
        <View style={styles.scoreRow}>
          <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>You</Text>
          <Text style={[styles.scoreValue, { color: colors.text }]}>
            {yourScore.toLocaleString()}
          </Text>
        </View>
        <View style={styles.scoreRow}>
          <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>Them</Text>
          <Text style={[styles.scoreValue, { color: colors.text }]}>
            {theirScore.toLocaleString()}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 180,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  opponent: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  scores: {
    gap: 8,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 13,
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: '700',
  },
});
