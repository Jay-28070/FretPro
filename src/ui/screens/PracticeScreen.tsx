/**
 * Practice Screen
 * 
 * Main interface for guided practice sessions.
 * Displays current command and provides session controls.
 * 
 * Architecture:
 * - Subscribes to PracticeEngine events
 * - Manages UI state separately from practice logic
 * - Handles user interactions (start/stop/pause)
 */

import React, { useEffect, useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { practiceEngine } from '../../practice/PracticeEngine';
import { PracticeCommand, PracticeResult } from '../../types/practice';
import { AccuracyMeter } from '../components/AccuracyMeter';
import { CommandDisplay } from '../components/CommandDisplay';
import { TunerDisplay } from '../components/TunerDisplay';
import { colors } from '../theme/colors';

type SessionState = 'idle' | 'active' | 'listening';

export default function PracticeScreen() {
  const [sessionState, setSessionState] = useState<SessionState>('idle');
  const [currentCommand, setCurrentCommand] = useState<PracticeCommand | null>(null);
  const [lastResult, setLastResult] = useState<PracticeResult | null>(null);
  const [commandCount, setCommandCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => {
    // Subscribe to practice engine events
    const unsubscribe = practiceEngine.subscribe((event) => {
      switch (event.type) {
        case 'command_issued':
          setCurrentCommand(event.data);
          setCommandCount(prev => prev + 1);
          setSessionState('active');
          break;

        case 'listening_started':
          setSessionState('listening');
          break;

        case 'result_ready':
          setLastResult(event.data);
          if (event.data.pitchCorrect) {
            setCorrectCount(prev => prev + 1);
          }
          setSessionState('active');
          break;

        case 'session_ended':
          setSessionState('idle');
          showSessionSummary(event.data);
          break;
      }
    });

    return () => unsubscribe();
  }, []);

  async function handleStartSession() {
    try {
      setCommandCount(0);
      setCorrectCount(0);
      setLastResult(null);
      await practiceEngine.startSession({
        mode: 'guided',
      });
    } catch (error) {
      console.error('Failed to start session:', error);
      Alert.alert('Error', 'Failed to start practice session');
    }
  }

  async function handleEndSession() {
    try {
      await practiceEngine.endSession();
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  }

  function showSessionSummary(session: any) {
    const accuracy = session.results.length > 0
      ? Math.round((correctCount / session.results.length) * 100)
      : 0;

    Alert.alert(
      'Session Complete',
      `Commands: ${session.commands.length}\nAccuracy: ${accuracy}%`,
      [{ text: 'OK' }]
    );
  }

  const accuracy = commandCount > 0
    ? Math.round((correctCount / commandCount) * 100)
    : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>FretPro</Text>
          <Text style={styles.subtitle}>Guitar Practice Companion</Text>
        </View>

        {/* Stats */}
        {sessionState !== 'idle' && (
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{commandCount}</Text>
              <Text style={styles.statLabel}>Commands</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, styles.statValueAccent]}>
                {accuracy}%
              </Text>
              <Text style={styles.statLabel}>Accuracy</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{correctCount}</Text>
              <Text style={styles.statLabel}>Correct</Text>
            </View>
          </View>
        )}

        {/* Command Display */}
        <View style={styles.commandSection}>
          <CommandDisplay
            command={currentCommand}
            isListening={sessionState === 'listening'}
          />
        </View>

        {/* Feedback */}
        {lastResult && (
          <View style={styles.feedbackContainer}>
            <Text style={[
              styles.feedbackText,
              lastResult.pitchCorrect ? styles.feedbackSuccess : styles.feedbackError
            ]}>
              {lastResult.pitchCorrect ? '✓ Correct!' : '✗ Try again'}
            </Text>
          </View>
        )}

        {/* Controls */}
        <View style={styles.controlsContainer}>
          {sessionState === 'idle' ? (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleStartSession}
            >
              <Text style={styles.primaryButtonText}>Start Practice</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleEndSession}
            >
              <Text style={styles.secondaryButtonText}>End Session</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Placeholder sections */}
        <View style={styles.placeholderSection}>
          <AccuracyMeter />
        </View>

        <View style={styles.placeholderSection}>
          <TunerDisplay />
        </View>

        {/* Phase info */}
        <View style={styles.phaseInfo}>
          <Text style={styles.phaseText}>
            Phase 1: TTS + Command System ✓
          </Text>
          <Text style={styles.phaseSubtext}>
            Pitch detection, tuner, and metronome coming in Phase 2
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  title: {
    fontSize: 40,
    fontWeight: '800',
    color: colors.accent.primary,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: 4,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.ui.border,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text.primary,
  },
  statValueAccent: {
    color: colors.accent.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 4,
    fontWeight: '500',
  },
  commandSection: {
    marginBottom: 24,
  },
  feedbackContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  feedbackText: {
    fontSize: 24,
    fontWeight: '700',
  },
  feedbackSuccess: {
    color: colors.accent.success,
  },
  feedbackError: {
    color: colors.accent.error,
  },
  controlsContainer: {
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: colors.accent.primary,
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    shadowColor: colors.accent.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.background.primary,
  },
  secondaryButton: {
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.accent.error,
  },
  secondaryButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.accent.error,
  },
  placeholderSection: {
    marginBottom: 24,
  },
  phaseInfo: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.ui.border,
  },
  phaseText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent.success,
    marginBottom: 4,
  },
  phaseSubtext: {
    fontSize: 12,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});
