/**
 * Tuner Display Component (PLACEHOLDER)
 * 
 * Visual tuner interface showing string selection and tuning status.
 * 
 * TODO Phase 2:
 * - Implement string selector
 * - Add animated tuning needle
 * - Show frequency readout
 * - Add auto-detect mode toggle
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GuitarString } from '../../types/audio';
import { colors } from '../theme/colors';

interface TunerDisplayProps {
  targetString?: GuitarString;
  onStringSelect?: (string: GuitarString) => void;
}

const STRINGS: GuitarString[] = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'];

export function TunerDisplay({ targetString, onStringSelect }: TunerDisplayProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tuner</Text>

      <View style={styles.stringSelector}>
        {STRINGS.map((string) => (
          <TouchableOpacity
            key={string}
            style={[
              styles.stringButton,
              targetString === string && styles.stringButtonActive,
            ]}
            onPress={() => onStringSelect?.(string)}
          >
            <Text style={[
              styles.stringButtonText,
              targetString === string && styles.stringButtonTextActive,
            ]}>
              {string}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.tunerMeter}>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            Tuner visualization
          </Text>
          <Text style={styles.placeholderSubtext}>
            Coming in Phase 2
          </Text>
        </View>
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
  stringSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 8,
  },
  stringButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: colors.background.tertiary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.ui.border,
    alignItems: 'center',
  },
  stringButtonActive: {
    backgroundColor: colors.accent.primary,
    borderColor: colors.accent.primary,
  },
  stringButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  stringButtonTextActive: {
    color: colors.background.primary,
  },
  tunerMeter: {
    height: 150,
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
});
