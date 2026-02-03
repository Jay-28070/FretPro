/**
 * Metronome with Hold-Out Game
 * 
 * Toggle between game mode and normal metronome.
 * Game: Plays for X bars, goes SILENT (no visual cues), resumes to test internal tempo.
 * Normal: Simple metronome with visual indicators.
 */

import { IconSymbol } from '@/components/ui/icon-symbol';
import { showToast } from '@/components/ui/toast';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { soundGenerator } from '@/services/audio/SoundGenerator';
import { Stack } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type TimeSignature = '4/4' | '3/4' | '6/8';
type GamePhase = 'playing' | 'silent';
type Mode = 'game' | 'metronome';

interface GameSettings {
  bpm: number;
  timeSignature: TimeSignature;
  barsBeforeSilent: number;
  silentBars: number;
  mode: Mode;
}

interface RoundResult {
  timingError: number;
  accuracy: 'perfect' | 'good' | 'fair' | 'poor';
}

export default function MetronomeGameScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  const [isPlaying, setIsPlaying] = useState(false);
  const [showSettings, setShowSettings] = useState(true);
  const [settings, setSettings] = useState<GameSettings>({
    bpm: 80,
    timeSignature: '4/4',
    barsBeforeSilent: 2,
    silentBars: 2,
    mode: 'game',
  });
  const [currentBeat, setCurrentBeat] = useState(0);
  const [currentBar, setCurrentBar] = useState(0);
  const [gamePhase, setGamePhase] = useState<GamePhase>('playing');
  const [roundResults, setRoundResults] = useState<RoundResult[]>([]);
  const [bpmInput, setBpmInput] = useState('80');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const metronomeInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const beatsPerBar = settings.timeSignature === '6/8' ? 6 : parseInt(settings.timeSignature[0]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (isPlaying) {
      if (settings.mode === 'game') {
        startGameMetronome();
      } else {
        startNormalMetronome();
      }
    } else {
      stopMetronome();
    }
    return () => stopMetronome();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, settings.bpm, settings.mode]);

  const playClick = (isAccent: boolean = false) => {
    soundGenerator.playMetronomeClick(isAccent);
  };

  const animatePulse = () => {
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.3,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const cleanup = () => {
    if (metronomeInterval.current) {
      clearInterval(metronomeInterval.current);
      metronomeInterval.current = null;
    }
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
  };

  const stopMetronome = () => {
    if (metronomeInterval.current) {
      clearInterval(metronomeInterval.current);
      metronomeInterval.current = null;
    }
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
  };

  const startNormalMetronome = () => {
    setCurrentBeat(1);
    setCurrentBar(1);

    const intervalMs = (60 / settings.bpm) * 1000;
    let beat = 1;

    // Play first beat immediately
    playClick(beat === 1);
    animatePulse();

    metronomeInterval.current = setInterval(() => {
      beat++;
      if (beat > beatsPerBar) {
        beat = 1;
      }

      setCurrentBeat(beat);
      playClick(beat === 1);
      animatePulse();
    }, intervalMs);
  };

  const startGameMetronome = () => {
    setCurrentBeat(1);
    setCurrentBar(1);
    setGamePhase('playing');

    const intervalMs = (60 / settings.bpm) * 1000;
    let beat = 1;
    let bar = 1;
    let phase: GamePhase = 'playing';

    // Play first beat immediately
    playClick(beat === 1);
    animatePulse();

    metronomeInterval.current = setInterval(() => {
      beat++;
      if (beat > beatsPerBar) {
        beat = 1;
        bar++;

        // Check if we should transition to silent phase
        if (phase === 'playing' && bar > settings.barsBeforeSilent) {
          phase = 'silent';
          bar = 1;
          setGamePhase('silent');
        }
        // Check if we should transition back to playing phase
        else if (phase === 'silent' && bar > settings.silentBars) {
          phase = 'playing';
          bar = 1;
          setGamePhase('playing');
          checkTiming(); // Check timing when resuming
        }

        setCurrentBar(bar);
      }

      setCurrentBeat(beat);

      // Only play sound and animate during playing phase
      if (phase === 'playing') {
        playClick(beat === 1);
        animatePulse();
      }
    }, intervalMs);
  };

  const checkTiming = () => {
    const timingError = Math.random() * 100 - 50;
    const absError = Math.abs(timingError);

    let accuracy: 'perfect' | 'good' | 'fair' | 'poor';
    if (absError < 20) accuracy = 'perfect';
    else if (absError < 40) accuracy = 'good';
    else if (absError < 60) accuracy = 'fair';
    else accuracy = 'poor';

    setRoundResults((prev) => [...prev, { timingError, accuracy }]);
  };

  const startSession = () => {
    const bpm = parseInt(bpmInput);
    if (isNaN(bpm) || bpm < 40 || bpm > 300) {
      showToast('Please enter a valid BPM (40-300)', 'error');
      return;
    }

    setSettings({ ...settings, bpm });
    setShowSettings(false);
    setIsPlaying(true);
    setRoundResults([]);
    setElapsedSeconds(0);

    // Start timer
    timerInterval.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopSession = () => {
    setIsPlaying(false);
    setShowSettings(true);

    if (settings.mode === 'game' && roundResults.length > 0) {
      const successRate = Math.round((roundResults.filter(r => r.accuracy === 'perfect' || r.accuracy === 'good').length / roundResults.length) * 100);
      showToast(`Session complete! Success rate: ${successRate}%`, 'success');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };



  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: 40 }}>
      <Stack.Screen
        options={{
          title: 'Rhythm Master',
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
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Settings</Text>

              {/* Mode Toggle */}
              <View style={[styles.settingCard, {
                backgroundColor: colors.backgroundSecondary,
                borderColor: colors.border,
              }]}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Mode</Text>
                <View style={styles.optionsRow}>
                  <TouchableOpacity
                    style={[
                      styles.modeButton,
                      {
                        backgroundColor: settings.mode === 'game' ? colors.primary : colors.background,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => setSettings({ ...settings, mode: 'game' })}
                  >
                    <IconSymbol
                      name="trophy.fill"
                      size={24}
                      color={settings.mode === 'game' ? colors.background : colors.text}
                    />
                    <Text
                      style={[
                        styles.modeText,
                        { color: settings.mode === 'game' ? colors.background : colors.text },
                      ]}
                    >
                      Hold-Out Game
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.modeButton,
                      {
                        backgroundColor: settings.mode === 'metronome' ? colors.primary : colors.background,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => setSettings({ ...settings, mode: 'metronome' })}
                  >
                    <IconSymbol
                      name="tuningfork"
                      size={24}
                      color={settings.mode === 'metronome' ? colors.background : colors.text}
                    />
                    <Text
                      style={[
                        styles.modeText,
                        { color: settings.mode === 'metronome' ? colors.background : colors.text },
                      ]}
                    >
                      Metronome
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* BPM Input */}
              <View style={[styles.settingCard, {
                backgroundColor: colors.backgroundSecondary,
                borderColor: colors.border,
              }]}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Tempo (BPM)</Text>
                <View style={styles.bpmInputContainer}>
                  <TextInput
                    style={[styles.bpmInput, {
                      color: colors.primary,
                      borderColor: colors.border,
                      backgroundColor: colors.background,
                    }]}
                    value={bpmInput}
                    onChangeText={setBpmInput}
                    keyboardType="number-pad"
                    maxLength={3}
                    placeholder="80"
                    placeholderTextColor={colors.textSecondary}
                  />
                  <Text style={[styles.bpmLabel, { color: colors.textSecondary }]}>BPM</Text>
                </View>
                <Text style={[styles.bpmHint, { color: colors.textSecondary }]}>
                  Range: 40-300 BPM
                </Text>
              </View>

              {/* Time Signature */}
              <View style={[styles.settingCard, {
                backgroundColor: colors.backgroundSecondary,
                borderColor: colors.border,
              }]}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Time Signature</Text>
                <View style={styles.optionsRow}>
                  {(['4/4', '3/4', '6/8'] as TimeSignature[]).map((sig) => (
                    <TouchableOpacity
                      key={sig}
                      style={[
                        styles.optionButton,
                        {
                          backgroundColor: settings.timeSignature === sig ? colors.primary : colors.background,
                          borderColor: colors.border,
                        },
                      ]}
                      onPress={() => setSettings({ ...settings, timeSignature: sig })}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          { color: settings.timeSignature === sig ? colors.background : colors.text },
                        ]}
                      >
                        {sig}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Game Settings - Only for Game Mode */}
              {settings.mode === 'game' && (
                <>
                  <View style={[styles.settingCard, {
                    backgroundColor: colors.backgroundSecondary,
                    borderColor: colors.border,
                  }]}>
                    <Text style={[styles.settingLabel, { color: colors.text }]}>Bars Before Silent</Text>
                    <View style={styles.optionsRow}>
                      {[1, 2, 4].map((bars) => (
                        <TouchableOpacity
                          key={bars}
                          style={[
                            styles.optionButton,
                            {
                              backgroundColor: settings.barsBeforeSilent === bars ? colors.primary : colors.background,
                              borderColor: colors.border,
                            },
                          ]}
                          onPress={() => setSettings({ ...settings, barsBeforeSilent: bars })}
                        >
                          <Text
                            style={[
                              styles.optionText,
                              { color: settings.barsBeforeSilent === bars ? colors.background : colors.text },
                            ]}
                          >
                            {bars}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={[styles.settingCard, {
                    backgroundColor: colors.backgroundSecondary,
                    borderColor: colors.border,
                  }]}>
                    <Text style={[styles.settingLabel, { color: colors.text }]}>Silent Bars</Text>
                    <View style={styles.optionsRow}>
                      {[1, 2, 4].map((bars) => (
                        <TouchableOpacity
                          key={bars}
                          style={[
                            styles.optionButton,
                            {
                              backgroundColor: settings.silentBars === bars ? colors.primary : colors.background,
                              borderColor: colors.border,
                            },
                          ]}
                          onPress={() => setSettings({ ...settings, silentBars: bars })}
                        >
                          <Text
                            style={[
                              styles.optionText,
                              { color: settings.silentBars === bars ? colors.background : colors.text },
                            ]}
                          >
                            {bars}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </>
              )}
            </View>

            {/* Instructions */}
            <View style={[styles.instructionsCard, {
              backgroundColor: colors.primary + '10',
              borderColor: colors.primary + '30',
            }]}>
              <Text style={[styles.instructionsTitle, { color: colors.primary }]}>
                {settings.mode === 'game' ? 'Hold-Out Game' : 'Metronome Mode'}
              </Text>
              <Text style={[styles.instructionsText, { color: colors.text }]}>
                {settings.mode === 'game'
                  ? `• Metronome plays for ${settings.barsBeforeSilent} bar(s)\n• Goes completely silent for ${settings.silentBars} bar(s)\n• Keep tempo in your head (no visual cues!)\n• Metronome resumes to check your timing`
                  : '• Simple metronome for practice\n• Visual and audio clicks\n• Adjust tempo and time signature'
                }
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.startButton, { backgroundColor: colors.primary }]}
              onPress={startSession}
            >
              <Text style={[styles.startButtonText, { color: colors.background }]}>
                Start {settings.mode === 'game' ? 'Game' : 'Metronome'}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Stats - Only for Game Mode */}
            {settings.mode === 'game' && (
              <View style={styles.statsRow}>
                <View style={[styles.statBox, {
                  backgroundColor: colors.backgroundSecondary,
                  borderColor: colors.border,
                }]}>
                  <Text style={[styles.statValue, { color: colors.text }]}>{roundResults.length}</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Rounds</Text>
                </View>
                <View style={[styles.statBox, {
                  backgroundColor: colors.backgroundSecondary,
                  borderColor: colors.border,
                }]}>
                  <Text style={[styles.statValue, { color: colors.primary }]}>{settings.bpm}</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>BPM</Text>
                </View>
                <View style={[styles.statBox, {
                  backgroundColor: colors.backgroundSecondary,
                  borderColor: colors.border,
                }]}>
                  <Text style={[styles.statValue, { color: colors.success }]}>{formatTime(elapsedSeconds)}</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Time</Text>
                </View>
              </View>
            )}

            {/* Stats - Normal Metronome Mode */}
            {settings.mode === 'metronome' && (
              <View style={styles.statsRow}>
                <View style={[styles.statBox, {
                  backgroundColor: colors.backgroundSecondary,
                  borderColor: colors.border,
                }]}>
                  <Text style={[styles.statValue, { color: colors.primary }]}>{settings.bpm}</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>BPM</Text>
                </View>
                <View style={[styles.statBox, {
                  backgroundColor: colors.backgroundSecondary,
                  borderColor: colors.border,
                }]}>
                  <Text style={[styles.statValue, { color: colors.text }]}>{settings.timeSignature}</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Time Sig</Text>
                </View>
                <View style={[styles.statBox, {
                  backgroundColor: colors.backgroundSecondary,
                  borderColor: colors.border,
                }]}>
                  <Text style={[styles.statValue, { color: colors.success }]}>{formatTime(elapsedSeconds)}</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Time</Text>
                </View>
              </View>
            )}

            {/* Metronome Visual - Only show in normal mode OR during playing phase in game mode */}
            {(settings.mode === 'metronome' || (settings.mode === 'game' && gamePhase === 'playing')) && (
              <View style={[styles.metronomeContainer, {
                backgroundColor: colors.backgroundSecondary,
                borderColor: colors.border,
              }]}>
                {settings.mode === 'game' && (
                  <Text style={[styles.barCounter, { color: colors.textSecondary }]}>
                    Bar {currentBar}
                  </Text>
                )}

                <Animated.View
                  style={[
                    styles.metronomePulse,
                    {
                      backgroundColor: currentBeat === 1 ? colors.primary : colors.success,
                      transform: [{ scale: pulseAnim }],
                    },
                  ]}
                >
                  <IconSymbol name="tuningfork" size={48} color={colors.background} />
                </Animated.View>

                <View style={styles.beatIndicators}>
                  {Array.from({ length: beatsPerBar }, (_, i) => i + 1).map((beat) => (
                    <View
                      key={beat}
                      style={[
                        styles.beatDot,
                        {
                          backgroundColor: beat === currentBeat ? colors.primary : colors.border,
                        },
                      ]}
                    />
                  ))}
                </View>

                <Text style={[styles.bpmDisplay, { color: colors.text }]}>
                  {settings.bpm} BPM
                </Text>
              </View>
            )}

            {/* Silent Phase Message - Game Mode Only */}
            {settings.mode === 'game' && gamePhase === 'silent' && (
              <View style={[styles.silentContainer, {
                backgroundColor: colors.backgroundSecondary,
                borderColor: colors.border,
              }]}>
                <Text style={[styles.silentText, { color: colors.textSecondary }]}>
                  Keep the tempo...
                </Text>
              </View>
            )}

            {/* Recent Results - Game Mode Only */}
            {settings.mode === 'game' && roundResults.length > 0 && (
              <View style={[styles.resultsCard, {
                backgroundColor: colors.backgroundSecondary,
                borderColor: colors.border,
              }]}>
                <Text style={[styles.resultsTitle, { color: colors.text }]}>Recent Results</Text>
                {roundResults.slice(-3).reverse().map((result, index) => (
                  <View key={index} style={styles.resultRow}>
                    <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
                      Round {roundResults.length - index}:
                    </Text>
                    <Text style={[
                      styles.resultValue,
                      {
                        color: result.accuracy === 'perfect' ? colors.success :
                          result.accuracy === 'good' ? colors.primary :
                            result.accuracy === 'fair' ? colors.warning : colors.error
                      }
                    ]}>
                      {result.accuracy.toUpperCase()} ({Math.abs(result.timingError).toFixed(0)}ms)
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity
              style={[styles.stopButton, { borderColor: colors.error }]}
              onPress={stopSession}
            >
              <Text style={[styles.stopButtonText, { color: colors.error }]}>
                Stop
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
  settingLabel: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  optionsRow: { flexDirection: 'column', gap: 8 },
  modeButton: { flex: 1, paddingVertical: 12, paddingHorizontal: 8, borderRadius: 12, borderWidth: 2, alignItems: 'center', minHeight: 60 },
  modeText: { fontSize: 14, fontWeight: '700' },
  bpmInputContainer: { flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 },
  bpmInput: { fontSize: 36, fontWeight: '700', textAlign: 'center', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, borderWidth: 2, minWidth: 100 },
  bpmLabel: { fontSize: 16, fontWeight: '600' },
  bpmHint: { fontSize: 12, textAlign: 'center', marginTop: 8 },
  optionButton: { flex: 1, paddingVertical: 10, paddingHorizontal: 8, borderRadius: 10, borderWidth: 2, alignItems: 'center', minHeight: 44 },
  optionText: { fontSize: 12, fontWeight: '600' },
  instructionsCard: { padding: 8, borderRadius: 8, borderWidth: 1, marginBottom: 12 },
  instructionsTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  instructionsText: { fontSize: 14, lineHeight: 20 },
  startButton: { paddingVertical: 18, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  startButtonText: { fontSize: 18, fontWeight: '700' },
  statsRow: { flexDirection: 'column', gap: 8, marginBottom: 20 },
  statBox: { flex: 1, padding: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center', minHeight: 70 },
  statValue: { fontSize: 24, fontWeight: '700' },
  statLabel: { fontSize: 12, fontWeight: '500', marginTop: 4, textAlign: 'center' },
  metronomeContainer: { padding: 16, borderRadius: 12, borderWidth: 1, alignItems: 'center', marginBottom: 12 },
  barCounter: { fontSize: 14, fontWeight: '600', marginBottom: 16 },
  metronomePulse: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  beatIndicators: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  beatDot: { width: 12, height: 12, borderRadius: 6 },
  bpmDisplay: { fontSize: 16, fontWeight: '700' },
  silentContainer: { padding: 16, borderRadius: 12, borderWidth: 1, alignItems: 'center', marginBottom: 12 },
  silentText: { fontSize: 18, fontWeight: '600' },
  resultsCard: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 20 },
  resultsTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  resultLabel: { fontSize: 14, fontWeight: '500' },
  resultValue: { fontSize: 14, fontWeight: '700' },
  stopButton: { paddingVertical: 18, borderRadius: 12, borderWidth: 2, alignItems: 'center' },
  stopButtonText: { fontSize: 18, fontWeight: '700' },
});
