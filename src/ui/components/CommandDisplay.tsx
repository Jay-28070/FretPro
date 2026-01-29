/**
 * Command Display Component
 * 
 * Shows the current practice command in large, readable text.
 * Designed for quick glances while playing.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PracticeCommand } from '../../types/practice';
import { colors } from '../theme/colors';

interface CommandDisplayProps {
  command: PracticeCommand | null;
  isListening?: boolean;
}

export function CommandDisplay({ command, isListening = false }: CommandDisplayProps) {
  if (!command) {
    return (
      <View style={styles.container}>
        <Text style={styles.placeholderText}>Ready to practice</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.noteContainer}>
        <Text style={styles.noteText}>{command.note}</Text>
        <Text style={styles.octaveText}>{command.octave}</Text>
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.stringText}>
          {getStringDisplayName(command.string)}
        </Text>
        <Text style={styles.fretText}>
          {command.fret === 0 ? 'Open' : `Fret ${command.fret}`}
        </Text>
      </View>

      {isListening && (
        <View style={styles.listeningIndicator}>
          <View style={styles.listeningDot} />
          <Text style={styles.listeningText}>Listening...</Text>
        </View>
      )}
    </View>
  );
}

function getStringDisplayName(string: string): string {
  const names: Record<string, string> = {
    E2: 'Low E String',
    A2: 'A String',
    D3: 'D String',
    G3: 'G String',
    B3: 'B String',
    E4: 'High E String',
  };
  return names[string] || string;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.secondary,
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    minHeight: 280,
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.ui.border,
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 24,
  },
  noteText: {
    fontSize: 96,
    fontWeight: '700',
    color: colors.accent.primary,
    letterSpacing: -2,
  },
  octaveText: {
    fontSize: 48,
    fontWeight: '600',
    color: colors.text.secondary,
    marginLeft: 8,
  },
  detailsContainer: {
    alignItems: 'center',
    gap: 8,
  },
  stringText: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text.primary,
  },
  fretText: {
    fontSize: 20,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  placeholderText: {
    fontSize: 28,
    color: colors.text.tertiary,
    fontWeight: '500',
  },
  listeningIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    gap: 8,
  },
  listeningDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.accent.error,
  },
  listeningText: {
    fontSize: 16,
    color: colors.text.secondary,
    fontWeight: '500',
  },
});
