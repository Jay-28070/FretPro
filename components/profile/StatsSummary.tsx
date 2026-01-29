/**
 * Stats Summary Component
 * 
 * Displays practice statistics in a clean grid layout.
 */

import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { StyleSheet, Text, View } from 'react-native';

interface StatsSummaryProps {
  totalNotesCorrect: number;
  averageAccuracy: number;
  weakestString: string;
}

export function StatsSummary({ totalNotesCorrect, averageAccuracy, weakestString }: StatsSummaryProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Practice Summary</Text>
      
      <View style={styles.statsGrid}>
        {/* Total Notes Correct */}
        <View style={[styles.statCard, { 
          backgroundColor: colors.backgroundSecondary,
          borderColor: colors.border,
        }]}>
          <Text style={[styles.statValue, { color: colors.success }]}>
            {totalNotesCorrect.toLocaleString()}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Notes Correct
          </Text>
        </View>

        {/* Average Accuracy */}
        <View style={[styles.statCard, { 
          backgroundColor: colors.backgroundSecondary,
          borderColor: colors.border,
        }]}>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {averageAccuracy}%
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Avg Accuracy
          </Text>
        </View>

        {/* Weakest String */}
        <View style={[styles.statCard, { 
          backgroundColor: colors.backgroundSecondary,
          borderColor: colors.border,
        }]}>
          <Text style={[styles.statValue, { color: colors.warning }]}>
            {weakestString}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Weakest String
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
});
