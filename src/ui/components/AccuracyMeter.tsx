/**
 * Accuracy Meter Component (PLACEHOLDER)
 * 
 * Will display pitch accuracy in real-time.
 * Shows cents deviation from target note.
 * 
 * TODO Phase 2:
 * - Implement animated needle
 * - Add color gradient (red → yellow → green)
 * - Show frequency readout
 * - Add historical accuracy graph
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

interface AccuracyMeterProps {
  centsOff?: number;
  isInTune?: boolean;
}

export function AccuracyMeter({ centsOff = 0, isInTune = false }: AccuracyMeterProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pitch Accuracy</Text>
      
      <View style={styles.meterContainer}>
        {/* TODO: Implement visual meter */}
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            Meter visualization
          </Text>
          <Text style={styles.placeholderSubtext}>
            Coming in Phase 2
          </Text>
        </View>
      </View>

      <View style={styles.readout}>
        <Text style={styles.centsText}>
          {centsOff > 0 ? '+' : ''}{centsOff.toFixed(0)} cents
        </Text>
        <Text style={[
          styles.statusText,
          isInTune && styles.statusTextInTune
        ]}>
          {isInTune ? '✓ In Tune' : 'Adjust tuning'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.ui.border,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  meterContainer: {
    height: 120,
    marginBottom: 16,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.ui.border,
    borderRadius: 12,
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 14,
    color: colors.text.tertiary,
    fontWeight: '500',
  },
  placeholderSubtext: {
    fontSize: 12,
    color: colors.text.disabled,
    marginTop: 4,
  },
  readout: {
    alignItems: 'center',
    gap: 4,
  },
  centsText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  statusTextInTune: {
    color: colors.accent.success,
  },
});
