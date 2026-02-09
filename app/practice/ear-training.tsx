/**
 * Ear Training Game
 * 
 * Identify notes with 3 buttons (2 wrong, 1 right).
 * Timer-based difficulty: Hard mode = less time to answer.
 * Auto-plays sounds automatically.
 */

import { IconSymbol } from '@/components/ui/icon-symbol';
import { showToast } from '@/components/ui/toast';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { soundGenerator } from '@/services/audio/SoundGenerator';
import { scoreService } from '@/services/practice/ScoreService';
import { progressionService } from '@/services/progression/ProgressionService';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type InputMode = 'buttons' | 'guitar';
type Difficulty = 'easy' | 'medium' | 'hard';

interface GameSettings {
  inputMode: InputMode;
  difficulty: Difficulty;
}

interface Question {
  target: string;
  options: [string, string, string]; // Exactly 3 options
}

const NOTES_NATURAL = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const NOTES_WITH_SHARPS = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
const NOTES_CHROMATIC = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];

export default function EarTrainingScreen() {
  const { colorScheme } = useTheme();
  const { user } = useAuth();
  const colors = Colors[colorScheme];

  const [showSettings, setShowSettings] = useState(true);
  const [settings, setSettings] = useState<GameSettings>({
    inputMode: 'buttons',
    difficulty: 'easy',
  });
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [allHighScores, setAllHighScores] = useState<Record<Difficulty, number>>({
    easy: 0,
    medium: 0,
    hard: 0,
  });

  const timeLimit = settings.difficulty === 'easy' ? 10 :
    settings.difficulty === 'medium' ? 7 : 4;

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
      const hs = await scoreService.getHighScore(user.uid, 'ear-training', diff);
      scores[diff] = hs?.score || 0;
    }

    setAllHighScores(scores);
  };

  const loadHighScore = async () => {
    if (!user) return;
    const hs = await scoreService.getHighScore(user.uid, 'ear-training', settings.difficulty);
    setHighScore(hs?.score || 0);
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const startGame = () => {
    setShowSettings(false);
    setScore(0);
    setTotalQuestions(0);
    generateQuestion();
  };

  const generateQuestion = () => {
    // Select note pool based on difficulty
    const notePool = settings.difficulty === 'easy' ? NOTES_NATURAL : NOTES_CHROMATIC;

    // Pick random target note
    const target = notePool[Math.floor(Math.random() * notePool.length)];

    // Pick 2 random wrong answers from the same pool
    const wrongOptions = notePool.filter(n => n !== target);
    const shuffled = wrongOptions.sort(() => Math.random() - 0.5);
    const wrong1 = shuffled[0];
    const wrong2 = shuffled[1];

    // Shuffle all 3 options
    const allOptions = [target, wrong1, wrong2].sort(() => Math.random() - 0.5);

    setCurrentQuestion({
      target,
      options: allOptions as [string, string, string],
    });

    // Start timer
    setTimeLeft(timeLimit);
    setTimerActive(true);

    // Auto-play the sound
    setTimeout(() => playSound(target), 500);
  };

  const playSound = (target?: string) => {
    const soundTarget = target || currentQuestion?.target;
    if (!soundTarget) return;

    setIsPlaying(true);

    // Play the actual note sound
    soundGenerator.playNote(soundTarget, 4, 1.5);

    // Reset playing state after sound duration
    setTimeout(() => setIsPlaying(false), 1500);
  };

  const handleTimeout = () => {
    if (!currentQuestion) return;

    setTimerActive(false);
    setTotalQuestions((prev) => prev + 1);
    showToast(`Time's up! It was ${currentQuestion.target}`, 'error');
    setTimeout(generateQuestion, 2000);
  };

  const handleAnswer = (answer: string) => {
    if (!currentQuestion) return;

    setTimerActive(false);
    const isCorrect = answer === currentQuestion.target;
    setTotalQuestions((prev) => prev + 1);

    if (isCorrect) {
      setScore((prev) => prev + 1);
      showToast('Correct! 🎉', 'success');
      setTimeout(generateQuestion, 1500);
    } else {
      showToast(`Incorrect. It was ${currentQuestion.target}`, 'error');
      setTimeout(generateQuestion, 2000);
    }
  };

  const startListening = () => {
    setIsListening(true);
    showToast('Listening for your guitar...', 'info');

    // Simulate detection
    setTimeout(() => {
      setIsListening(false);
      if (currentQuestion) {
        const randomAnswer = currentQuestion.options[Math.floor(Math.random() * 3)];
        handleAnswer(randomAnswer);
      }
    }, 2000);
  };

  const endGame = async () => {
    setShowSettings(true);
    setCurrentQuestion(null);
    setTimerActive(false);
    const accuracy = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

    // Save score and check for high score
    if (user && totalQuestions > 0) {
      const result = await scoreService.saveScore(
        user.uid,
        'ear-training',
        settings.difficulty,
        score,
        totalQuestions
      );

      // Award XP for the session
      const xpResult = await progressionService.awardSessionXP(
        user.uid,
        score,
        totalQuestions,
        result.isNewHighScore
      );

      // Show appropriate message
      if (result.isNewHighScore) {
        if (xpResult.leveledUp) {
          showToast(`🎉 New High Score! ${score} • Level Up! Now Level ${xpResult.newLevel} (+${xpResult.xpGained} XP)`, 'success');
        } else {
          showToast(`🎉 New High Score! ${score} (was ${result.previousBest}) • +${xpResult.xpGained} XP`, 'success');
        }
        setHighScore(score);
        loadAllHighScores(); // Refresh all scores
      } else {
        if (xpResult.leveledUp) {
          showToast(`Level Up! Now Level ${xpResult.newLevel} 🎉 • Score: ${score}/${totalQuestions} (+${xpResult.xpGained} XP)`, 'success');
        } else {
          showToast(`Session complete! Score: ${score}/${totalQuestions} (${accuracy}%) • +${xpResult.xpGained} XP`, 'success');
        }
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
          title: 'Ear Training',
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
                  <Text style={[styles.settingLabel, { color: colors.text }]}>Difficulty (Time Limit)</Text>
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
                        {diff === 'easy' && '10s • Natural notes only'}
                        {diff === 'medium' && '7s • Includes sharps (♯)'}
                        {diff === 'hard' && '4s • All chromatic notes'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Input Mode */}
              <View style={[styles.settingCard, {
                backgroundColor: colors.backgroundSecondary,
                borderColor: colors.border,
              }]}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Input Mode</Text>
                <View style={styles.optionsRow}>
                  <TouchableOpacity
                    style={[
                      styles.optionButton,
                      {
                        backgroundColor: settings.inputMode === 'buttons' ? colors.primary : colors.background,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => setSettings({ ...settings, inputMode: 'buttons' })}
                  >
                    <IconSymbol
                      name="checkmark"
                      size={24}
                      color={settings.inputMode === 'buttons' ? colors.background : colors.text}
                    />
                    <Text
                      style={[
                        styles.optionText,
                        { color: settings.inputMode === 'buttons' ? colors.background : colors.text },
                      ]}
                    >
                      Buttons
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.optionButton,
                      {
                        backgroundColor: settings.inputMode === 'guitar' ? colors.primary : colors.background,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => setSettings({ ...settings, inputMode: 'guitar' })}
                  >
                    <IconSymbol
                      name="tuningfork"
                      size={24}
                      color={settings.inputMode === 'guitar' ? colors.background : colors.text}
                    />
                    <Text
                      style={[
                        styles.optionText,
                        { color: settings.inputMode === 'guitar' ? colors.background : colors.text },
                      ]}
                    >
                      Guitar
                    </Text>
                  </TouchableOpacity>
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
                • Sound plays automatically{'\n'}
                • {settings.inputMode === 'buttons' ? 'Pick from 3 buttons (2 wrong, 1 right)' : 'Play it back on your guitar'}{'\n'}
                • {settings.difficulty === 'easy' ? 'Natural notes only (C, D, E, F, G, A, B)' : 'Includes sharps (♯) for extra challenge'}{'\n'}
                • Answer before time runs out!{'\n'}
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

            {/* Timer */}
            <View style={[styles.timerCard, {
              backgroundColor: timeLeft <= 2 ? colors.error + '20' : colors.primary + '20',
              borderColor: timeLeft <= 2 ? colors.error : colors.primary,
            }]}>
              <Text style={[styles.timerText, {
                color: timeLeft <= 2 ? colors.error : colors.primary,
              }]}>
                {timeLeft}s
              </Text>
            </View>

            {/* Question Display */}
            <View style={[styles.questionCard, {
              backgroundColor: colors.backgroundSecondary,
              borderColor: colors.border,
            }]}>
              <Text style={[styles.questionTitle, { color: colors.text }]}>
                What note is this?
              </Text>

              <TouchableOpacity
                style={[styles.playButton, {
                  backgroundColor: isPlaying ? colors.textSecondary : colors.primary,
                }]}
                onPress={() => playSound()}
                disabled={isPlaying}
              >
                <IconSymbol name="music.note" size={32} color={colors.background} />
                <Text style={[styles.playButtonText, { color: colors.background }]}>
                  {isPlaying ? 'Playing...' : 'Replay Sound'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Answer Options - 3 Buttons Only */}
            {settings.inputMode === 'buttons' ? (
              <View style={styles.answersRow}>
                {currentQuestion?.options.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[styles.answerButton, {
                      backgroundColor: colors.backgroundSecondary,
                      borderColor: colors.border,
                    }]}
                    onPress={() => handleAnswer(option)}
                  >
                    <Text style={[styles.answerText, { color: colors.text }]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.guitarInputSection}>
                <TouchableOpacity
                  style={[
                    styles.listenButton,
                    {
                      backgroundColor: isListening ? colors.error : colors.primary,
                    },
                  ]}
                  onPress={startListening}
                  disabled={isListening}
                >
                  <IconSymbol name="tuningfork" size={32} color={colors.background} />
                  <Text style={[styles.listenButtonText, { color: colors.background }]}>
                    {isListening ? 'Listening...' : 'Play on Guitar'}
                  </Text>
                </TouchableOpacity>

                <Text style={[styles.guitarHint, { color: colors.textSecondary }]}>
                  Play the note on your guitar
                </Text>
              </View>
            )}

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
  optionsRow: { flexDirection: 'column', gap: 8 },
  optionsColumn: { gap: 12 },
  optionButton: { flex: 1, paddingVertical: 12, paddingHorizontal: 8, borderRadius: 12, borderWidth: 2, alignItems: 'center', minHeight: 50 },
  optionText: { fontSize: 14, fontWeight: '600' },
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
  timerCard: { padding: 12, borderRadius: 12, borderWidth: 2, alignItems: 'center', marginBottom: 12 },
  timerText: { fontSize: 36, fontWeight: '900' },
  questionCard: { padding: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center', marginBottom: 12 },
  questionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 20, textAlign: 'center' },
  playButton: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 16, paddingHorizontal: 24, borderRadius: 12 },
  playButtonText: { fontSize: 16, fontWeight: '700' },
  answersRow: { flexDirection: 'column', gap: 8, marginBottom: 20 },
  answerButton: { flex: 1, paddingVertical: 20, paddingHorizontal: 8, borderRadius: 12, borderWidth: 2, alignItems: 'center', minHeight: 60 },
  answerText: { fontSize: 20, fontWeight: '900' },
  guitarInputSection: { alignItems: 'center', marginBottom: 20 },
  listenButton: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 16, paddingHorizontal: 24, borderRadius: 12, marginBottom: 12 },
  listenButtonText: { fontSize: 16, fontWeight: '700' },
  guitarHint: { fontSize: 14, fontWeight: '500', textAlign: 'center' },
  endButton: { paddingVertical: 18, borderRadius: 12, borderWidth: 2, alignItems: 'center' },
  endButtonText: { fontSize: 18, fontWeight: '700' },
});