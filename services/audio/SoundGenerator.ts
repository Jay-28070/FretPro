/**
 * Sound Generator Service
 * Generates metronome clicks and musical notes
 * - Web: Uses Web Audio API
 * - Mobile: Uses expo-av with Audio.Sound
 */

import { Audio } from 'expo-av';
import { Platform } from 'react-native';

class SoundGenerator {
  private audioContext: AudioContext | null = null;
  private clickSounds: { accent: Audio.Sound | null; regular: Audio.Sound | null } = {
    accent: null,
    regular: null,
  };

  constructor() {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      // @ts-ignore - Web Audio API
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } else {
      // Initialize mobile audio
      this.initializeMobileAudio();
    }
  }

  /**
   * Initialize mobile audio with expo-av
   */
  private async initializeMobileAudio(): Promise<void> {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
      });
    } catch (error) {
      console.error('Failed to initialize mobile audio:', error);
    }
  }

  /**
   * Play a metronome click sound
   * @param isAccent - Whether this is an accented beat (downbeat)
   */
  async playMetronomeClick(isAccent: boolean = false): Promise<void> {
    if (Platform.OS === 'web' && this.audioContext) {
      this.playWebClick(isAccent);
    } else {
      await this.playMobileClick(isAccent);
    }
  }

  /**
   * Play metronome click on mobile using expo-av
   * Uses local audio files for better performance
   */
  private async playMobileClick(isAccent: boolean): Promise<void> {
    try {
      // Use local audio files (WAV format in assets/sounds/)
      const soundFile = isAccent 
        ? require('@/assets/sounds/accented_click.wav')
        : require('@/assets/sounds/click.wav');
      
      const { sound } = await Audio.Sound.createAsync(
        soundFile,
        { 
          shouldPlay: true, 
          volume: isAccent ? 0.8 : 0.6,
        }
      );

      // Auto-unload after playing
      setTimeout(() => {
        sound.unloadAsync().catch(() => {});
      }, 200);
    } catch (error) {
      // Fallback to online sounds if local files not found
      console.warn('Local sound files not found, using fallback:', error);
      try {
        const soundUrl = isAccent 
          ? 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg'
          : 'https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg';
        
        const { sound } = await Audio.Sound.createAsync(
          { uri: soundUrl },
          { 
            shouldPlay: true, 
            volume: isAccent ? 0.7 : 0.4,
            rate: 2.0,
          }
        );

        setTimeout(() => {
          sound.unloadAsync().catch(() => {});
        }, 200);
      } catch (fallbackError) {
        console.log('Metronome click:', isAccent ? 'ACCENT' : 'click');
      }
    }
  }

  /**
   * Play a musical note
   * @param note - Note name (C, D, E, F, G, A, B)
   * @param octave - Octave number (default 4)
   * @param duration - Duration in seconds (default 1)
   */
  async playNote(note: string, octave: number = 4, duration: number = 1): Promise<void> {
    if (Platform.OS === 'web' && this.audioContext) {
      this.playWebNote(note, octave, duration);
    } else {
      await this.playMobileNote(note, octave, duration);
    }
  }

  /**
   * Play musical note on mobile using local audio files
   */
  private async playMobileNote(note: string, octave: number, duration: number): Promise<void> {
    try {
      // Map note names to file names (handle sharps)
      const noteFileName = note.replace('♯', 's'); // C♯ -> Cs
      const fileName = `${noteFileName}${octave}`;
      
      // Try to load local audio file
      // Files should be named like: C4.wav, Cs4.wav, D4.wav, etc.
      const noteFiles: { [key: string]: any } = {
        // Octave 3
        'C3': require('@/assets/sounds/notes/C3.wav'),
        'Cs3': require('@/assets/sounds/notes/Cs3.wav'),
        'D3': require('@/assets/sounds/notes/D3.wav'),
        'Ds3': require('@/assets/sounds/notes/Ds3.wav'),
        'E3': require('@/assets/sounds/notes/E3.wav'),
        'F3': require('@/assets/sounds/notes/F3.wav'),
        'Fs3': require('@/assets/sounds/notes/Fs3.wav'),
        'G3': require('@/assets/sounds/notes/G3.wav'),
        'Gs3': require('@/assets/sounds/notes/Gs3.wav'),
        'A3': require('@/assets/sounds/notes/A3.wav'),
        'As3': require('@/assets/sounds/notes/As3.wav'),
        'B3': require('@/assets/sounds/notes/B3.wav'),
        // Octave 4 (most common)
        'C4': require('@/assets/sounds/notes/C4.wav'),
        'Cs4': require('@/assets/sounds/notes/Cs4.wav'),
        'D4': require('@/assets/sounds/notes/D4.wav'),
        'Ds4': require('@/assets/sounds/notes/Ds4.wav'),
        'E4': require('@/assets/sounds/notes/E4.wav'),
        'F4': require('@/assets/sounds/notes/F4.wav'),
        'Fs4': require('@/assets/sounds/notes/Fs4.wav'),
        'G4': require('@/assets/sounds/notes/G4.wav'),
        'Gs4': require('@/assets/sounds/notes/Gs4.wav'),
        'A4': require('@/assets/sounds/notes/A4.wav'),
        'As4': require('@/assets/sounds/notes/As4.wav'),
        'B4': require('@/assets/sounds/notes/B4.wav'),
        // Octave 5
        'C5': require('@/assets/sounds/notes/C5.wav'),
        'Cs5': require('@/assets/sounds/notes/Cs5.wav'),
        'D5': require('@/assets/sounds/notes/D5.wav'),
        'Ds5': require('@/assets/sounds/notes/Ds5.wav'),
        'E5': require('@/assets/sounds/notes/E5.wav'),
        'F5': require('@/assets/sounds/notes/F5.wav'),
        'Fs5': require('@/assets/sounds/notes/Fs5.wav'),
        'G5': require('@/assets/sounds/notes/G5.wav'),
        'Gs5': require('@/assets/sounds/notes/Gs5.wav'),
        'A5': require('@/assets/sounds/notes/A5.wav'),
        'As5': require('@/assets/sounds/notes/As5.wav'),
        'B5': require('@/assets/sounds/notes/B5.wav'),
      };

      const soundFile = noteFiles[fileName];
      
      if (!soundFile) {
        console.warn(`Note file not found: ${fileName}.wav, using Web Audio fallback`);
        // Fallback to synthesized sound
        throw new Error('Note file not found');
      }

      const { sound } = await Audio.Sound.createAsync(
        soundFile,
        { 
          shouldPlay: true, 
          volume: 0.7,
        }
      );

      // Auto-unload after duration
      setTimeout(() => {
        sound.unloadAsync().catch(() => {});
      }, duration * 1000 + 200);
    } catch (error) {
      console.warn(`Failed to play local note file for ${note}${octave}, using fallback:`, error);
      // Fallback: Use online sound or just log
      try {
        const { sound } = await Audio.Sound.createAsync(
          { uri: 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg' },
          { shouldPlay: true, volume: 0.5 }
        );

        setTimeout(() => {
          sound.unloadAsync().catch(() => {});
        }, duration * 1000);
      } catch (fallbackError) {
        console.log(`Playing ${note}${octave} (no audio available)`);
      }
    }
  }

  /**
   * Generate metronome click using Web Audio API
   */
  private playWebClick(isAccent: boolean): void {
    if (!this.audioContext) return;

    const ctx = this.audioContext;
    const currentTime = ctx.currentTime;

    // Create oscillator for click sound
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    // Sharp, short click
    osc.frequency.value = isAccent ? 1200 : 800; // Higher pitch for accent
    gain.gain.value = isAccent ? 0.3 : 0.15; // Louder for accent

    // Very short envelope for click sound
    gain.gain.setValueAtTime(gain.gain.value, currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.03);

    osc.start(currentTime);
    osc.stop(currentTime + 0.03);
  }

  /**
   * Generate musical note using Web Audio API with harmonics for richer sound
   */
  private playWebNote(note: string, octave: number, duration: number): void {
    if (!this.audioContext) return;

    const ctx = this.audioContext;
    const currentTime = ctx.currentTime;

    // Note frequencies (A4 = 440Hz) - includes sharps
    const noteFrequencies: { [key: string]: number } = {
      'C': 261.63,
      'C♯': 277.18,
      'D': 293.66,
      'D♯': 311.13,
      'E': 329.63,
      'F': 349.23,
      'F♯': 369.99,
      'G': 392.00,
      'G♯': 415.30,
      'A': 440.00,
      'A♯': 466.16,
      'B': 493.88,
    };

    const baseFreq = noteFrequencies[note.toUpperCase()];
    if (!baseFreq) return;

    // Adjust for octave (A4 is octave 4)
    const frequency = baseFreq * Math.pow(2, octave - 4);

    // Create master gain for the entire note
    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);

    // Create multiple oscillators for harmonics (like a guitar string)
    // Fundamental + harmonics make it sound more musical
    const harmonics = [
      { freq: frequency, gain: 0.4, type: 'sine' as OscillatorType },      // Fundamental
      { freq: frequency * 2, gain: 0.2, type: 'sine' as OscillatorType },  // 2nd harmonic
      { freq: frequency * 3, gain: 0.1, type: 'sine' as OscillatorType },  // 3rd harmonic
      { freq: frequency * 4, gain: 0.05, type: 'sine' as OscillatorType }, // 4th harmonic
    ];

    harmonics.forEach(({ freq, gain: gainValue, type }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(masterGain);

      osc.type = type;
      osc.frequency.value = freq;

      // Individual harmonic gain
      gain.gain.value = gainValue;

      osc.start(currentTime);
      osc.stop(currentTime + duration);
    });

    // ADSR envelope on master gain for natural sound
    masterGain.gain.setValueAtTime(0, currentTime);
    masterGain.gain.linearRampToValueAtTime(0.5, currentTime + 0.02); // Fast attack
    masterGain.gain.linearRampToValueAtTime(0.35, currentTime + 0.1); // Decay
    masterGain.gain.setValueAtTime(0.35, currentTime + duration - 0.2); // Sustain
    masterGain.gain.linearRampToValueAtTime(0, currentTime + duration); // Release
  }

  /**
   * Clean up audio context
   */
  async cleanup(): Promise<void> {
    if (this.audioContext && this.audioContext.state !== 'closed') {
      await this.audioContext.close();
      this.audioContext = null;
    }
  }
}

export const soundGenerator = new SoundGenerator();
