/**
 * Practice Screen
 * 
 * Main practice interface with TTS-driven commands.
 * Phase 1: Voice commands + simulated results
 * Phase 2: Real pitch detection
 * 
 * Pattern: Standard React component with service integration.
 */

import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { ttsService } from '@/services/audio/TTSService';
import { commandGenerator, PracticeCommand } from '@/services/practice/CommandGenerator';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PracticeScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  const [isSessionActive, setIsSessionActive] = useState(false);
  const [currentCommand, setCurrentCommand] = useState<PracticeCommand | null>(null);
  const [commandCount, setCommandCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isListening, setIsListening] = useState(false);

  const startSession = async () => {
    setIsSessionActive(true);
    setCommandCount(0);
    setCorrectCount(0);
    await issueNextCommand();
  };

  const endSession = async () => {
    setIsSessionActive(false);
    setCurrentCommand(null);
    await ttsService.stop();
  };

  const issueNextCommand = async () => {
    // Generate command
    const command = commandGenerator.generate();
    setCurrentCommand(command);
    setCommandCount(prev => prev + 1);

    // Speak command
    await ttsService.speakNow(command.spokenText);

    // Simulate listening (Phase 2 will add real pitch detection)
    setIsListening(true);
    setTimeout(() => {
      simulateResult();
    }, 2000);
  };

  const simulateResult = async () => {
    setIsListening(false);

    // Simulate random success/failure
    const isCorrect = Math.random() > 0.3;
    
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
      await ttsService.speak('Correct!');
    } else {
      await ttsService.speak('Try again');
    }

    // Next command after feedback
    setTimeout(() => {
      if (isSessionActive) {
        issueNextCommand();
      }
    }, 1500);
  };

  const accuracy = commandCount > 0 ? Math.round((correctCount / commandCount) * 100) : 0;

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.logo, { color: colors.primary }]}>FretPro</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Practice Mode
        </Text>
      </View>

      {/* Stats */}
      {isSessionActive && (
        <View style={styles.statsContainer}>
          <View style={[styles.statBox, { 
            backgroundColor: colors.backgroundSecondary,
            borderColor: colors.border,
          }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {commandCount}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Commands
            </Text>
          </View>

          <View style={[styles.statBox, { 
            backgroundColor: colors.backgroundSecondary,
            borderColor: colors.border,
          }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {accuracy}%
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Accuracy
            </Text>
          </View>

          <View style={[styles.statBox, { 
            backgroundColor: colors.backgroundSecondary,
            borderColor: colors.border,
          }]}>
            <Text style={[styles.statValue, { color: colors.success }]}>
              {correctCount}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Correct
            </Text>
          </View>
        </View>
      )}

      {/* Command Display - Only show when session is active */}
      {isSessionActive && (
        <View style={[styles.commandContainer, { 
          backgroundColor: colors.backgroundSecondary,
          borderColor: colors.border,
        }]}>
          {currentCommand ? (
            <>
              <View style={styles.noteContainer}>
                <Text style={[styles.noteText, { color: colors.primary }]}>
                  {currentCommand.note}
                </Text>
                <Text style={[styles.octaveText, { color: colors.textSecondary }]}>
                  {currentCommand.octave}
                </Text>
              </View>

              <Text style={[styles.stringText, { color: colors.text }]}>
                {getStringDisplayName(currentCommand.string)}
              </Text>

              <Text style={[styles.fretText, { color: colors.textSecondary }]}>
                {currentCommand.fret === 0 ? 'Open' : `Fret ${currentCommand.fret}`}
              </Text>

              {isListening && (
                <View style={styles.listeningIndicator}>
                  <View style={[styles.listeningDot, { backgroundColor: colors.error }]} />
                  <Text style={[styles.listeningText, { color: colors.textSecondary }]}>
                    Listening...
                  </Text>
                </View>
              )}
            </>
          ) : null}
        </View>
      )}

      {/* Controls */}
      <View style={[styles.controls, !isSessionActive && styles.controlsCentered]}>
        {!isSessionActive ? (
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={startSession}
          >
            <Text style={[styles.primaryButtonText, { color: colors.background }]}>
              Start Practice
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: colors.error }]}
            onPress={endSession}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.error }]}>
              End Session
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
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
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 32,
  },
  logo: {
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  commandContainer: {
    padding: 40,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    minHeight: 280,
    justifyContent: 'center',
    marginBottom: 24,
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  noteText: {
    fontSize: 80,
    fontWeight: '700',
    letterSpacing: -2,
  },
  octaveText: {
    fontSize: 40,
    fontWeight: '600',
    marginLeft: 8,
  },
  stringText: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
  },
  fretText: {
    fontSize: 18,
    fontWeight: '500',
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: '500',
  },
  listeningIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 8,
  },
  listeningDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  listeningText: {
    fontSize: 14,
    fontWeight: '500',
  },
  controls: {
    marginBottom: 24,
  },
  controlsCentered: {
    flex: 1,
    justifyContent: 'center',
    marginTop: 100,
  },
  primaryButton: {
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    paddingVertical: 18,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
  },
});
