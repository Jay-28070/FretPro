/**
 * Note Recognition Game (TTS)
 * 
 * App calls out a note name using text-to-speech.
 * User plays it on their guitar and app detects if correct.
 */

import { showToast } from '@/components/ui/toast';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { pitchDetectionService } from '@/services/audio/PitchDetectionService';
import { ttsService } from '@/services/audio/TTSService';
import { scoreService } from '@/services/practice/ScoreService';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Difficulty = 'easy' | 'medium' | 'hard';

interface GameSettings {
  difficulty: Difficulty;
}

interface NotePosition {
  note: string;
  string: string;
  frequency: number;
}

// Guitar string notes with their frequencies (standard tuning)
// E string (1st/high E): E4 = 329.63 Hz
// B string (2nd): B3 = 246.94 Hz
// G string (3rd): G3 = 196.00 Hz
// D string (4th): D3 = 146.83 Hz
// A string (5th): A2 = 110.00 Hz
// E string (6th/low E): E2 = 82.41 Hz

const EASY_POSITIONS: NotePosition[] = [
  // Open strings
  { note: 'E', string: 'high E string', frequency: 329.63 },
  { note: 'B', string: 'B string', frequency: 246.94 },
  { note: 'G', string: 'G string', frequency: 196.00 },
  { note: 'D', string: 'D string', frequency: 146.83 },
  { note: 'A', string: 'A string', frequency: 110.00 },
  { note: 'E', string: 'low E string', frequency: 82.41 },

  // First fret
  { note: 'F', string: 'high E string', frequency: 349.23 },
  { note: 'C', string: 'B string', frequency: 261.63 },
  { note: 'F', string: 'low E string', frequency: 87.31 },

  // Second fret
  { note: 'G', string: 'high E string', frequency: 392.00 },
  { note: 'D', string: 'B string', frequency: 293.66 },
  { note: 'A', string: 'G string', frequency: 220.00 },
  { note: 'E', string: 'D string', frequency: 164.81 },

  // Third fret
  { note: 'G', string: 'high E string', frequency: 415.30 },
  { note: 'D', string: 'B string', frequency: 311.13 },
  { note: 'A', string: 'G string', frequency: 233.08 },
  { note: 'F', string: 'D string', frequency: 174.61 },
  { note: 'C', string: 'A string', frequency: 130.81 },
  { note: 'G', string: 'low E string', frequency: 98.00 },

  // Fourth fret
  { note: 'A', string: 'high E string', frequency: 440.00 },
  { note: 'E', string: 'B string', frequency: 329.63 },
  { note: 'B', string: 'G string', frequency: 246.94 },
  { note: 'G', string: 'D string', frequency: 196.00 },
  { note: 'D', string: 'A string', frequency: 146.83 },

  // Fifth fret
  { note: 'A', string: 'high E string', frequency: 466.16 },
  { note: 'F', string: 'B string', frequency: 349.23 },
  { note: 'C', string: 'G string', frequency: 261.63 },
  { note: 'A', string: 'D string', frequency: 220.00 },
  { note: 'E', string: 'A string', frequency: 164.81 },
  { note: 'A', string: 'low E string', frequency: 110.00 },
];

const MEDIUM_POSITIONS: NotePosition[] = [
  ...EASY_POSITIONS,
  // Add sharps across the fretboard
  { note: 'F♯', string: 'high E string', frequency: 369.99 },
  { note: 'G♯', string: 'high E string', frequency: 415.30 },
  { note: 'A♯', string: 'high E string', frequency: 466.16 },
  { note: 'C♯', string: 'B string', frequency: 277.18 },
  { note: 'D♯', string: 'B string', frequency: 311.13 },
  { note: 'F♯', string: 'B string', frequency: 369.99 },
  { note: 'G♯', string: 'G string', frequency: 207.65 },
  { note: 'A♯', string: 'G string', frequency: 233.08 },
  { note: 'C♯', string: 'G string', frequency: 277.18 },
  { note: 'D♯', string: 'D string', frequency: 155.56 },
  { note: 'F♯', string: 'D string', frequency: 185.00 },
  { note: 'G♯', string: 'D string', frequency: 207.65 },
  { note: 'A♯', string: 'A string', frequency: 116.54 },
  { note: 'C♯', string: 'A string', frequency: 138.59 },
  { note: 'D♯', string: 'A string', frequency: 155.56 },
  { note: 'F♯', string: 'low E string', frequency: 92.50 },
  { note: 'G♯', string: 'low E string', frequency: 103.83 },
  { note: 'A♯', string: 'low E string', frequency: 116.54 },
];

const HARD_POSITIONS: NotePosition[] = [
  ...MEDIUM_POSITIONS,
  // Higher frets and more complex positions
  { note: 'B', string: 'high E string', frequency: 493.88 },
  { note: 'C', string: 'high E string', frequency: 523.25 },
  { note: 'C♯', string: 'high E string', frequency: 554.37 },
  { note: 'D', string: 'high E string', frequency: 587.33 },
  { note: 'G', string: 'B string', frequency: 392.00 },
  { note: 'G♯', string: 'B string', frequency: 415.30 },
  { note: 'A', string: 'B string', frequency: 440.00 },
  { note: 'D', string: 'G string', frequency: 293.66 },
  { note: 'D♯', string: 'G string', frequency: 311.13 },
  { note: 'E', string: 'G string', frequency: 329.63 },
  { note: 'F', string: 'G string', frequency: 349.23 },
  { note: 'A♯', string: 'D string', frequency: 233.08 },
  { note: 'B', string: 'D string', frequency: 246.94 },
  { note: 'C', string: 'D string', frequency: 261.63 },
  { note: 'F', string: 'A string', frequency: 174.61 },
  { note: 'F♯', string: 'A string', frequency: 185.00 },
  { note: 'G', string: 'A string', frequency: 196.00 },
  { note: 'B', string: 'low E string', frequency: 123.47 },
  { note: 'C', string: 'low E string', frequency: 130.81 },
  { note: 'C♯', string: 'low E string', frequency: 138.59 },
  { note: 'D', string: 'low E string', frequency: 146.83 },
];

export default function NoteRecognitionScreen() {
  const { colorScheme } = useTheme();
  const { user } = useAuth();
  const colors = Colors[colorScheme];

  const [showSettings, setShowSettings] = useState(true);
  const [settings, setSettings] = useState<GameSettings>({
    difficulty: 'easy',
  });
  const [currentPosition, setCurrentPosition] = useState<NotePosition | null>(null);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [allHighScores, setAllHighScores] = useState<Record<Difficulty, number>>({
    easy: 0,
    medium: 0,
    hard: 0,
  });

  const timeLimit = settings.difficulty === 'easy' ? 15 :
    settings.difficulty === 'medium' ? 10 : 7;

  useEffect(() => {
    loadAllHighScores();
  }, [user]);

  useEffect(() => {
    loadHighScore();
  }, [settings.difficulty, user]);

  const loadAllHighScores = async () => {
    if (!user) return;
    const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];
    const scores: Record<Difficulty, number> = { easy: 0, medium: 0, hard: 0 };

    for (const diff of difficulties) {
      const hs = await scoreService.getHighScore(user.uid, 'note-recognition', diff);
      scores[diff] = hs?.score || 0;
    }

    setAllHighScores(scores);
  };

  const loadHighScore = async () => {
    if (!user) return;
    const hs = await scoreService.getHighScore(user.uid, 'note-recognition', settings.difficulty);
    setHighScore(hs?.score || 0);
  };

  const startGame = () => {
    setShowSettings(false);
    setScore(0);
    setTotalQuestions(0);
    generateQuestion();
  };

  useEffect(() => {
    // Start listening automatically when game is active
    if (!showSettings && currentPosition) {
      startListening();
    }

    return () => {
      stopListening();
    };
  }, [showSettings, currentPosition]);

  const startListening = async () => {
    try {
      // Initialize pitch detection service
      await pitchDetectionService.initialize();

      // Add callback for pitch detection results
      pitchDetectionService.addCallback(handlePitchDetection);

      // Start listening
      await pitchDetectionService.startListening();
      setIsListening(true);
    } catch (error) {
      console.error('Failed to start listening:', error);
    }
  };

  const stopListening = async () => {
    try {
      // Remove callback and stop listening
      pitchDetectionService.removeCallback(handlePitchDetection);
      await pitchDetectionService.stopListening();
      setIsListening(false);
    } catch (error) {
      console.error('Failed to stop listening:', error);
    }
  };

  const handlePitchDetection = (result: { frequency: number | null; confidence: number }) => {
    if (!currentPosition || !showSettings === false) return;

    if (result.frequency && result.confidence > 0.6) {
      // Check if detected frequency matches target (within 10 Hz tolerance)
      const tolerance = 10; // Hz
      const isCorrect = Math.abs(result.frequency - currentPosition.frequency) < tolerance;

      if (isCorrect) {
        handleAnswer(true, result.frequency);
      }
      // Don't auto-fail on wrong frequency - let user keep trying
    }
  };

  const generateQuestion = async () => {
    // Stop listening while speaking
    stopListening();

    // Select position pool based on difficulty
    const positionPool = settings.difficulty === 'easy' ? EASY_POSITIONS :
      settings.difficulty === 'medium' ? MEDIUM_POSITIONS :
        HARD_POSITIONS;

    // Pick random target position
    const target = positionPool[Math.floor(Math.random() * positionPool.length)];
    setCurrentPosition(target);

    // Convert note for speech (replace ♯ with "sharp")
    const spokenNote = target.note.replace('♯', ' sharp');

    // Speak the note and string
    await ttsService.speak(`Play ${spokenNote} on the ${target.string}`);

    // Start listening after speaking
    setTimeout(() => {
      if (!showSettings) {
        startListening();
        simulatePitchDetection(target);
      }
    }, 500);
  };

  const simulatePitchDetection = (target: NotePosition) => {
    // Simulate continuous pitch detection
    // In Phase 2, this will be real-time monitoring
    setTimeout(() => {
      if (!showSettings && currentPosition === target) {
        // Simulate detected frequency
        const detectedFreq = target.frequency + (Math.random() * 10 - 5);
        const tolerance = 5; // Hz
        const isCorrect = Math.abs(detectedFreq - target.frequency) < tolerance;

        handleAnswer(isCorrect, detectedFreq);
      }
    }, 3000);
  };

  const replayNote = async () => {
    if (!currentPosition) return;

    stopListening();
    await ttsService.speak(`Play ${currentPosition.note} on the ${currentPosition.string}`);

    setTimeout(() => {
      if (!showSettings) {
        startListening();
      }
    }, 500);
  };

  const handleAnswer = (isCorrect: boolean, detectedFreq?: number) => {
    if (!currentPosition) return;

    setTotalQuestions((prev) => prev + 1);

    if (isCorrect) {
      setScore((prev) => prev + 1);
      showToast('Perfect! 🎸', 'success');
      setTimeout(generateQuestion, 1500);
    } else {
      const freqInfo = detectedFreq ? ` (${detectedFreq.toFixed(1)} Hz vs ${currentPosition.frequency.toFixed(1)} Hz)` : '';
      showToast(`Not quite. Try ${currentPosition.note} on ${currentPosition.string}${freqInfo}`, 'error');
      setTimeout(generateQuestion, 2500);
    }
  };

  const endGame = async () => {
    setShowSettings(true);
    setCurrentPosition(null);
    const accuracy = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

    // Save score and check for high score
    if (user && totalQuestions > 0) {
      const result = await scoreService.saveScore(
        user.uid,
        'note-recognition',
        settings.difficulty,
        score,
        totalQuestions
      );

      if (result.isNewHighScore) {
        showToast(`🎉 New High Score! ${score} (was ${result.previousBest})`, 'success');
        setHighScore(score);
        loadAllHighScores(); // Refresh all scores
      } else {
        showToast(`Session complete! Score: ${score}/${totalQuestions} (${accuracy}%) • Best: ${highScore}`, 'success');
      }
    } else {
      showToast(`Session complete! Score: ${score}/${totalQuestions} (${accuracy}%)`, 'success');
    }
  };

  const accuracy = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: 40 }}>
      <Stack.Screen
        options={{
          title: 'Note Recognition',
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />

      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
      >
        {showSettings ? (
          <>
            <View style={styles.settingsSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Game Settings</Text>

              {/* Difficulty */}
              <View style={[styles.settingCard, {
                backgroundColor: colors.backgroundSecondary,
                borderColor: colors.border,
              }]}>
                <View style={styles.highScoreHeader}>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>Difficulty</Text>
                  {highScore > 0 && (
                    <View style={[styles.highScoreBadge, { backgroundColor: colors.primary + '20' }]}>
                      <Text style={[styles.highScoreText, { color: colors.primary }]}>
                        Best: {highScore}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.optionsColumn}>
                  {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => (
                    <TouchableOpacity
                      key={diff}
                      style={[
                        styles.difficultyButton,
                        {
                          backgroundColor: settings.difficulty === diff ? colors.primary : colors.background,
                          borderColor: colors.border,
                        },
                      ]}
                      onPress={() => setSettings({ ...settings, difficulty: diff })}
                    >
                      <Text
                        style={[
                          styles.difficultyText,
                          { color: settings.difficulty === diff ? colors.background : colors.text },
                        ]}
                      >
                        {diff.charAt(0).toUpperCase() + diff.slice(1)}
                      </Text>
                      <Text
                        style={[
                          styles.difficultyDesc,
                          { color: settings.difficulty === diff ? colors.background : colors.textSecondary },
                        ]}
                      >
                        {diff === 'easy' && '15s • Open strings & low frets'}
                        {diff === 'medium' && '10s • More positions + sharps'}
                        {diff === 'hard' && '7s • All fretboard positions'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Instructions */}
            <View style={[styles.instructionsCard, {
              backgroundColor: colors.primary + '10',
              borderColor: colors.primary + '30',
            }]}>
              <Text style={[styles.instructionsTitle, { color: colors.primary }]}>How to Play</Text>
              <Text style={[styles.instructionsText, { color: colors.text }]}>
                • App calls out "Note on String"{'\n'}
                • Play that exact position on guitar{'\n'}
                • App checks pitch to verify correct string{'\n'}
                • Get instant feedback
              </Text>
            </View>

            {/* High Scores Summary */}
            {user && (
              <View style={[styles.highScoresCard, {
                backgroundColor: colors.backgroundSecondary,
                borderColor: colors.border,
              }]}>
                <Text style={[styles.highScoresTitle, { color: colors.text }]}>Your High Scores</Text>
                <View style={styles.highScoresGrid}>
                  {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => {
                    const score = allHighScores[diff] || 0;
                    return (
                      <View key={diff} style={[styles.highScoreItem, {
                        backgroundColor: settings.difficulty === diff ? colors.primary + '10' : colors.background,
                        borderColor: settings.difficulty === diff ? colors.primary : colors.border,
                      }]}>
                        <Text style={[styles.highScoreDiff, {
                          color: settings.difficulty === diff ? colors.primary : colors.textSecondary
                        }]}>
                          {diff.charAt(0).toUpperCase() + diff.slice(1)}
                        </Text>
                        <Text style={[styles.highScoreValue, {
                          color: score > 0 ? colors.primary : colors.textTertiary
                        }]}>
                          {score > 0 ? score : '—'}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            <TouchableOpacity
              style={[styles.startButton, { backgroundColor: colors.primary }]}
              onPress={startGame}
            >
              <Text style={[styles.startButtonText, { color: colors.background }]}>
                Start Training
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Stats */}
            <View style={styles.statsRow}>
              <View style={[styles.statBox, {
                backgroundColor: colors.backgroundSecondary,
                borderColor: colors.border,
              }]}>
                <Text style={[styles.statValue, { color: colors.text }]}>{totalQuestions}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Questions</Text>
              </View>
              <View style={[styles.statBox, {
                backgroundColor: colors.backgroundSecondary,
                borderColor: colors.border,
              }]}>
                <Text style={[styles.statValue, { color: colors.success }]}>{accuracy}%</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Accuracy</Text>
              </View>
              <View style={[styles.statBox, {
                backgroundColor: colors.backgroundSecondary,
                borderColor: colors.border,
              }]}>
                <Text style={[styles.statValue, { color: colors.primary }]}>{score}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Score</Text>
              </View>
            </View>

            {/* Visual Display - Note and String */}
            <View style={[styles.displayCard, {
              backgroundColor: colors.backgroundSecondary,
              borderColor: colors.border,
            }]}>
              <Text style={[styles.displayLabel, { color: colors.textSecondary }]}>
                Play this note:
              </Text>
              <Text style={[styles.displayNote, { color: colors.primary }]}>
                {currentPosition?.note.replace('♯', '#') || '—'}
              </Text>
              <Text style={[styles.displayString, { color: colors.text }]}>
                on {currentPosition?.string || '—'}
              </Text>

              {isListening && (
                <View style={styles.listeningIndicator}>
                  <View style={[styles.listeningDot, { backgroundColor: colors.error }]} />
                  <Text style={[styles.listeningText, { color: colors.error }]}>
                    Listening...
                  </Text>
                </View>
              )}

              <Text style={[styles.displayLabel, { color: colors.textSecondary, fontSize: 12, marginTop: 8 }]}>
                (Pitch detection simulated - Phase 2 will use real mic)
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.endButton, { borderColor: colors.error }]}
              onPress={endGame}
            >
              <Text style={[styles.endButtonText, { color: colors.error }]}>
                End Session
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 12, paddingBottom: 30 },
  settingsSection: { marginBottom: 20 },
  sectionTitle: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  settingCard: { padding: 8, borderRadius: 8, borderWidth: 1, marginBottom: 12 },
  highScoreHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  highScoreBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  highScoreText: { fontSize: 12, fontWeight: '700' },
  settingLabel: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  optionsColumn: { gap: 12 },
  difficultyButton: { paddingVertical: 16, paddingHorizontal: 20, borderRadius: 12, borderWidth: 2, marginBottom: 8 },
  difficultyText: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  difficultyDesc: { fontSize: 12, fontWeight: '500' },
  instructionsCard: { padding: 8, borderRadius: 8, borderWidth: 1, marginBottom: 12 },
  instructionsTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  instructionsText: { fontSize: 14, lineHeight: 20 },
  highScoresCard: { padding: 8, borderRadius: 8, borderWidth: 1, marginBottom: 12 },
  highScoresTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  highScoresGrid: { flexDirection: 'column', gap: 8 },
  highScoreItem: { flex: 1, padding: 12, borderRadius: 12, borderWidth: 2, alignItems: 'center', minHeight: 60 },
  highScoreDiff: { fontSize: 10, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase' },
  highScoreValue: { fontSize: 20, fontWeight: '900' },
  startButton: { paddingVertical: 18, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  startButtonText: { fontSize: 18, fontWeight: '700' },
  statsRow: { flexDirection: 'column', gap: 8, marginBottom: 20 },
  statBox: { flex: 1, padding: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center', minHeight: 70 },
  statValue: { fontSize: 24, fontWeight: '700' },
  statLabel: { fontSize: 12, fontWeight: '500', marginTop: 4, textAlign: 'center' },
  displayCard: { padding: 16, borderRadius: 16, borderWidth: 1, alignItems: 'center', marginBottom: 12, gap: 6 },
  displayLabel: { fontSize: 16, fontWeight: '600' },
  displayNote: { fontSize: 64, fontWeight: '900', letterSpacing: 2 },
  displayString: { fontSize: 20, fontWeight: '600' },
  listeningIndicator: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16 },
  listeningDot: { width: 12, height: 12, borderRadius: 6 },
  listeningText: { fontSize: 14, fontWeight: '700' },
  endButton: { paddingVertical: 18, borderRadius: 12, borderWidth: 2, alignItems: 'center' },
  endButtonText: { fontSize: 18, fontWeight: '700' },
});
