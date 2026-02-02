/**
 * Sound Generator Service
 * Generates metronome clicks and musical notes using Web Audio API
 */

import { Platform } from 'react-native';

class SoundGenerator {
  private audioContext: AudioContext | null = null;

  constructor() {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      // @ts-ignore - Web Audio API
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
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
      // For native, we'll use a simple beep for now
      // Phase 2: Add actual audio files
      console.log(isAccent ? 'CLICK!' : 'click');
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
      // For native, we'll use a simple beep for now
      // Phase 2: Add actual audio files
      console.log(`Playing ${note}${octave}`);
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
