/**
 * Tuner Screen (Phase 2 Implementation)
 * 
 * Automatic pitch detection tuner with real-time visual feedback.
 * Auto-starts on mount with beautiful animated UI.
 */

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { tunerService } from '@/services/audio/TunerService';
import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

  useEffect(() => {
    const init = async () => {
      try {
        console.log('[Tuner] Initializing...');
        
        // Add callback to receive tuner updates
        tunerService.addCallback(handleTunerUpdate);

        // Start tuner (auto-detect mode)
        console.log('[Tuner] Starting tuner service...');
        await tunerService.start();
        console.log('[Tuner] Tuner service started successfully');
        setIsListening(true);
      } catch (error) {
        console.error('[Tuner] Failed to start tuner:', error);
        alert(`Tuner error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    init();

    return () => {
      // Cleanup
      console.log('[Tuner] Cleaning up...');
      tunerService.removeCallback(handleTunerUpdate);
      tunerService.stop();
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

  const handleTunerUpdate = (state: any) => {
    setFrequency(state.currentFrequency || 0);
    setCents(state.centsOff);

    // Only show note if we have a frequency and good confidence
    if (state.currentFrequency && state.confidence > 0.4) {
      // Always auto-detect from frequency (don't rely on targetString)
      const closestNote = findClosestNote(state.currentFrequency);
      setDetectedNote(`${closestNote.name}${closestNote.octave}`);
      
      // Update tuning status
      if (state.isInTune) {
        setTuningStatus('in-tune');
      } else if (Math.abs(state.centsOff) <= 25) {
        setTuningStatus('close');
      } else {
        setTuningStatus('far');
      }
    } else {
      // No signal - reset display
      setDetectedNote('--');
      setTuningStatus('far');
    }

    // Animate meter needle
    const meterPosition = Math.max(-1, Math.min(1, state.centsOff / 50)); // ±50 cents = full scale
    Animated.spring(meterAnim, {
      toValue: meterPosition,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  // All notes for detection with octaves (extended range for low notes)
  const ALL_NOTES = [
    // Octave 0 (very low - for bass instruments)
    { name: 'C', octave: 0, freq: 16.35 }, { name: 'C#', octave: 0, freq: 17.32 }, { name: 'D', octave: 0, freq: 18.35 },
    { name: 'D#', octave: 0, freq: 19.45 }, { name: 'E', octave: 0, freq: 20.60 }, { name: 'F', octave: 0, freq: 21.83 },
    { name: 'F#', octave: 0, freq: 23.12 }, { name: 'G', octave: 0, freq: 24.50 }, { name: 'G#', octave: 0, freq: 25.96 },
    { name: 'A', octave: 0, freq: 27.50 }, { name: 'A#', octave: 0, freq: 29.14 }, { name: 'B', octave: 0, freq: 30.87 },
    // Octave 1
    { name: 'C', octave: 1, freq: 32.70 }, { name: 'C#', octave: 1, freq: 34.65 }, { name: 'D', octave: 1, freq: 36.71 },
    { name: 'D#', octave: 1, freq: 38.89 }, { name: 'E', octave: 1, freq: 41.20 }, { name: 'F', octave: 1, freq: 43.65 },
    { name: 'F#', octave: 1, freq: 46.25 }, { name: 'G', octave: 1, freq: 49.00 }, { name: 'G#', octave: 1, freq: 51.91 },
    { name: 'A', octave: 1, freq: 55.00 }, { name: 'A#', octave: 1, freq: 58.27 }, { name: 'B', octave: 1, freq: 61.74 },
    // Octave 2 (standard guitar range)
    { name: 'C', octave: 2, freq: 65.41 }, { name: 'C#', octave: 2, freq: 69.30 }, { name: 'D', octave: 2, freq: 73.42 },
    { name: 'D#', octave: 2, freq: 77.78 }, { name: 'E', octave: 2, freq: 82.41 }, { name: 'F', octave: 2, freq: 87.31 },
    { name: 'F#', octave: 2, freq: 92.50 }, { name: 'G', octave: 2, freq: 98.00 }, { name: 'G#', octave: 2, freq: 103.83 },
    { name: 'A', octave: 2, freq: 110.00 }, { name: 'A#', octave: 2, freq: 116.54 }, { name: 'B', octave: 2, freq: 123.47 },
    // Octave 3
    { name: 'C', octave: 3, freq: 130.81 }, { name: 'C#', octave: 3, freq: 138.59 }, { name: 'D', octave: 3, freq: 146.83 },
    { name: 'D#', octave: 3, freq: 155.56 }, { name: 'E', octave: 3, freq: 164.81 }, { name: 'F', octave: 3, freq: 174.61 },
    { name: 'F#', octave: 3, freq: 185.00 }, { name: 'G', octave: 3, freq: 196.00 }, { name: 'G#', octave: 3, freq: 207.65 },
    { name: 'A', octave: 3, freq: 220.00 }, { name: 'A#', octave: 3, freq: 233.08 }, { name: 'B', octave: 3, freq: 246.94 },
    // Octave 4
    { name: 'C', octave: 4, freq: 261.63 }, { name: 'C#', octave: 4, freq: 277.18 }, { name: 'D', octave: 4, freq: 293.66 },
    { name: 'D#', octave: 4, freq: 311.13 }, { name: 'E', octave: 4, freq: 329.63 }, { name: 'F', octave: 4, freq: 349.23 },
    { name: 'F#', octave: 4, freq: 369.99 }, { name: 'G', octave: 4, freq: 392.00 }, { name: 'G#', octave: 4, freq: 415.30 },
    { name: 'A', octave: 4, freq: 440.00 }, { name: 'A#', octave: 4, freq: 466.16 }, { name: 'B', octave: 4, freq: 493.88 },
    // Octave 5 (high notes)
    { name: 'C', octave: 5, freq: 523.25 }, { name: 'C#', octave: 5, freq: 554.37 }, { name: 'D', octave: 5, freq: 587.33 },
    { name: 'D#', octave: 5, freq: 622.25 }, { name: 'E', octave: 5, freq: 659.25 }, { name: 'F', octave: 5, freq: 698.46 },
    { name: 'F#', octave: 5, freq: 739.99 }, { name: 'G', octave: 5, freq: 783.99 }, { name: 'G#', octave: 5, freq: 830.61 },
    { name: 'A', octave: 5, freq: 880.00 }, { name: 'A#', octave: 5, freq: 932.33 }, { name: 'B', octave: 5, freq: 987.77 },
  ];

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
          {detectedNote === '--' ? (
            <Text style={[styles.noteText, { color: getStatusColor() }]}>
              {detectedNote}
            </Text>
          ) : (
            <View style={styles.noteContainer}>
              <Text style={[styles.noteText, { color: getStatusColor() }]}>
                {detectedNote.replace(/\d+$/, '')}
              </Text>
              <Text style={[styles.octaveText, { color: getStatusColor() }]}>
                {detectedNote.match(/\d+$/)?.[0] || ''}
              </Text>
            </View>
          )}
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
        Play any note on your guitar • Real-time detection
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
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  noteText: {
    fontSize: 56,
    fontWeight: '900',
    letterSpacing: 2,
  },
  octaveText: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 8,
    marginLeft: 2,
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
