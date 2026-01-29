/**
 * Tuner Screen
 * 
 * Dedicated guitar tuner interface.
 * Separated from practice mode for focused tuning sessions.
 * 
 * Phase 2: Will implement real pitch detection and visual feedback.
 */

import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const GUITAR_STRINGS = ['E', 'A', 'D', 'G', 'B', 'E'] as const;

export default function TunerScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Tuner</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Tap a string to tune
        </Text>
      </View>

      {/* String Selector */}
      <View style={styles.stringSelector}>
        {GUITAR_STRINGS.map((string, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.stringButton, { 
              backgroundColor: colors.backgroundSecondary,
              borderColor: colors.border,
            }]}
          >
            <Text style={[styles.stringLabel, { color: colors.textSecondary }]}>
              {index === 0 ? 'Low' : index === 5 ? 'High' : ''}
            </Text>
            <Text style={[styles.stringNote, { color: colors.text }]}>
              {string}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tuning Meter Placeholder */}
      <View style={[styles.meterContainer, { 
        backgroundColor: colors.backgroundSecondary,
        borderColor: colors.border,
      }]}>
        <View style={styles.placeholder}>
          <Text style={[styles.placeholderText, { color: colors.textTertiary }]}>
            Tuning Meter
          </Text>
          <Text style={[styles.placeholderSubtext, { color: colors.textDisabled }]}>
            Coming in Phase 2
          </Text>
        </View>
      </View>

      {/* Frequency Display */}
      <View style={[styles.frequencyDisplay, { 
        backgroundColor: colors.backgroundSecondary,
        borderColor: colors.border,
      }]}>
        <Text style={[styles.frequencyLabel, { color: colors.textSecondary }]}>
          Frequency
        </Text>
        <Text style={[styles.frequencyValue, { color: colors.text }]}>
          -- Hz
        </Text>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={[styles.infoText, { color: colors.textTertiary }]}>
          Phase 2 will add real-time pitch detection
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  stringSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    gap: 8,
  },
  stringButton: {
    flex: 1,
    paddingVertical: 20,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    gap: 4,
  },
  stringLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  stringNote: {
    fontSize: 24,
    fontWeight: '700',
  },
  meterContainer: {
    height: 200,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    alignItems: 'center',
    gap: 8,
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: '600',
  },
  placeholderSubtext: {
    fontSize: 14,
  },
  frequencyDisplay: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 24,
  },
  frequencyLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  frequencyValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  info: {
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
