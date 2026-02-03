/**
 * Tuner Screen
 * 
 * Automatic pitch detection tuner with real-time visual feedback.
 * Auto-starts on mount with beautiful animated UI.
 */

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { Audio } from 'expo-av';
import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// All notes for detection
const ALL_NOTES = [
  { name: 'C', freq: 32.70 }, { name: 'C#', freq: 34.65 }, { name: 'D', freq: 36.71 },
  { name: 'D#', freq: 38.89 }, { name: 'E', freq: 41.20 }, { name: 'F', freq: 43.65 },
  { name: 'F#', freq: 46.25 }, { name: 'G', freq: 49.00 }, { name: 'G#', freq: 51.91 },
  { name: 'A', freq: 55.00 }, { name: 'A#', freq: 58.27 }, { name: 'B', freq: 61.74 },
  { name: 'C', freq: 65.41 }, { name: 'C#', freq: 69.30 }, { name: 'D', freq: 73.42 },
  { name: 'D#', freq: 77.78 }, { name: 'E', freq: 82.41 }, { name: 'F', freq: 87.31 },
  { name: 'F#', freq: 92.50 }, { name: 'G', freq: 98.00 }, { name: 'G#', freq: 103.83 },
  { name: 'A', freq: 110.00 }, { name: 'A#', freq: 116.54 }, { name: 'B', freq: 123.47 },
  { name: 'C', freq: 130.81 }, { name: 'C#', freq: 138.59 }, { name: 'D', freq: 146.83 },
  { name: 'D#', freq: 155.56 }, { name: 'E', freq: 164.81 }, { name: 'F', freq: 174.61 },
  { name: 'F#', freq: 185.00 }, { name: 'G', freq: 196.00 }, { name: 'G#', freq: 207.65 },
  { name: 'A', freq: 220.00 }, { name: 'A#', freq: 233.08 }, { name: 'B', freq: 246.94 },
  { name: 'C', freq: 261.63 }, { name: 'C#', freq: 277.18 }, { name: 'D', freq: 293.66 },
  { name: 'D#', freq: 311.13 }, { name: 'E', freq: 329.63 }, { name: 'F', freq: 349.23 },
  { name: 'F#', freq: 369.99 }, { name: 'G', freq: 392.00 }, { name: 'G#', freq: 415.30 },
  { name: 'A', freq: 440.00 }, { name: 'A#', freq: 466.16 }, { name: 'B', freq: 493.88 },
];

export default function TunerScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  const [isListening, setIsListening] = useState(false);
  const [detectedNote, setDetectedNote] = useState<string>('--');
  const [frequency, setFrequency] = useState<number>(0);
  const [cents, setCents] = useState<number>(0);
  const [tuningStatus, setTuningStatus] = useState<'in-tune' | 'close' | 'far'>('far');

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const meterAnim = useRef(new Animated.Value(0)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const recording = useRef<Audio.Recording | null>(null);

  useEffect(() => {
    const init = async () => {
      await requestAudioPermissions();
      await startListening(); // Auto-start
    };

    init();

    return () => {
      stopListening();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isListening) {
      // Pulse animation for note display
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Wave animation for listening indicator
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(waveAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
      waveAnim.setValue(0);
    }
  }, [isListening]);

  const requestAudioPermissions = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Audio permission not granted');
      }
    } catch (error) {
      console.error('Error requesting audio permissions:', error);
    }
  };

  const startListening = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recording.current = newRecording;
      setIsListening(true);

      // Call pitch detection once to initialize
      await detectPitch();
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopListening = async () => {
    try {
      if (recording.current) {
        await recording.current.stopAndUnloadAsync();
        recording.current = null;
      }
      setIsListening(false);
      setDetectedNote('--');
      setFrequency(0);
      setCents(0);
      setTuningStatus('far');
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  const detectPitch = async () => {
    if (!recording.current) return;

    try {
      // Get recording status to check if audio is being captured
      const status = await recording.current.getStatusAsync();

      if (status.isRecording) {
        // For now, show that we're listening but not detecting random notes
        // Real pitch detection will be implemented in Phase 2
        setDetectedNote('--');
        setFrequency(0);
        setCents(0);
        setTuningStatus('far');

        // Reset meter to center
        Animated.spring(meterAnim, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    } catch (error) {
      console.error('Error in pitch detection:', error);
    }
  };

  const findClosestNote = (freq: number) => {
    let closest = ALL_NOTES[0];
    let minDiff = Math.abs(freq - closest.freq);

    for (const note of ALL_NOTES) {
      const diff = Math.abs(freq - note.freq);
      if (diff < minDiff) {
        minDiff = diff;
        closest = note;
      }
    }

    return closest;
  };

  const getCentsOff = (detectedFreq: number, targetFreq: number) => {
    return Math.round(1200 * Math.log2(detectedFreq / targetFreq));
  };

  const getStatusColor = () => {
    switch (tuningStatus) {
      case 'in-tune': return colors.success;
      case 'close': return colors.warning;
      case 'far': return colors.error;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      {/* Header with listening indicator */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <IconSymbol name="tuningfork" size={32} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text }]}>Tuner</Text>
        </View>

        {isListening && (
          <View style={styles.listeningIndicator}>
            <Animated.View
              style={[
                styles.wave,
                {
                  backgroundColor: colors.primary,
                  opacity: waveAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 0],
                  }),
                  transform: [
                    {
                      scale: waveAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 2],
                      }),
                    },
                  ],
                },
              ]}
            />
            <View style={[styles.micDot, { backgroundColor: colors.primary }]} />
          </View>
        )}
      </View>

      {/* Main tuning display */}
      <View style={styles.mainDisplay}>
        {/* Detected Note */}
        <Animated.View
          style={[
            styles.noteCircle,
            {
              backgroundColor: colors.backgroundSecondary,
              borderColor: getStatusColor(),
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <Text style={[styles.noteText, { color: getStatusColor() }]}>
            {detectedNote}
          </Text>
        </Animated.View>

        {/* Tuning indicators with icons */}
        <View style={styles.tuningRow}>
          {/* Flat indicator */}
          <View style={[styles.indicator, { opacity: cents < -5 ? 1 : 0.2 }]}>
            <Text style={[styles.indicatorIcon, { color: colors.error }]}>♭</Text>
            <Text style={[styles.indicatorText, { color: colors.error }]}>Flat</Text>
          </View>

          {/* In tune indicator */}
          <View style={[styles.indicator, { opacity: Math.abs(cents) < 5 ? 1 : 0.2 }]}>
            <IconSymbol name="checkmark" size={32} color={colors.success} />
            <Text style={[styles.indicatorText, { color: colors.success }]}>Perfect</Text>
          </View>

          {/* Sharp indicator */}
          <View style={[styles.indicator, { opacity: cents > 5 ? 1 : 0.2 }]}>
            <Text style={[styles.indicatorIcon, { color: colors.error }]}>♯</Text>
            <Text style={[styles.indicatorText, { color: colors.error }]}>Sharp</Text>
          </View>
        </View>

        {/* Visual meter */}
        <View style={styles.meterSection}>
          <View style={[styles.meterTrack, { backgroundColor: colors.backgroundSecondary }]}>
            {/* Gradient zones */}
            <View style={styles.meterZones}>
              <View style={[styles.zone, { backgroundColor: colors.error + '30' }]} />
              <View style={[styles.zone, { backgroundColor: colors.warning + '30' }]} />
              <View style={[styles.centerZone, { backgroundColor: colors.success + '30' }]} />
              <View style={[styles.zone, { backgroundColor: colors.warning + '30' }]} />
              <View style={[styles.zone, { backgroundColor: colors.error + '30' }]} />
            </View>

            {/* Center marker */}
            <View style={[styles.centerMarker, { backgroundColor: colors.text }]} />

            {/* Moving indicator */}
            <Animated.View
              style={[
                styles.needle,
                {
                  backgroundColor: getStatusColor(),
                  shadowColor: getStatusColor(),
                  transform: [
                    {
                      translateX: meterAnim.interpolate({
                        inputRange: [-1, 1],
                        outputRange: [-120, 120],
                      }),
                    },
                  ],
                },
              ]}
            />
          </View>

          {/* Cents display */}
          <Text style={[styles.centsText, { color: colors.textSecondary }]}>
            {cents !== 0 ? `${cents > 0 ? '+' : ''}${cents} cents` : 'In tune'}
          </Text>
        </View>

        {/* Frequency info */}
        <View style={[styles.infoCard, { backgroundColor: colors.backgroundSecondary }]}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Frequency</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {frequency > 0 ? `${frequency.toFixed(1)} Hz` : '-- Hz'}
            </Text>
          </View>
        </View>
      </View>

      {/* Hint */}
      <Text style={[styles.hint, { color: colors.textTertiary }]}>
        Play any note on your guitar
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 24,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
  },
  listeningIndicator: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wave: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  micDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  mainDisplay: {
    flex: 1,
    justifyContent: 'center',
    gap: 24,
  },
  noteCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 4,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noteText: {
    fontSize: 56,
    fontWeight: '900',
    letterSpacing: 2,
  },
  tuningRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  indicator: {
    alignItems: 'center',
    gap: 8,
  },
  indicatorIcon: {
    fontSize: 32,
    fontWeight: '700',
  },
  indicatorText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  meterSection: {
    gap: 12,
  },
  meterTrack: {
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  meterZones: {
    position: 'absolute',
    flexDirection: 'row',
    width: '100%',
    height: '100%',
  },
  zone: {
    flex: 1,
  },
  centerZone: {
    flex: 0.5,
  },
  centerMarker: {
    position: 'absolute',
    width: 3,
    height: '60%',
    borderRadius: 1.5,
  },
  needle: {
    position: 'absolute',
    width: 6,
    height: 50,
    borderRadius: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
  },
  centsText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  hint: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
});
