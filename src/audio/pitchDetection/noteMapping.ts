/**
 * Note Mapping Utilities
 * 
 * Converts between frequencies, note names, and MIDI numbers.
 * Uses equal temperament tuning (A4 = 440 Hz).
 */

import { Note, NoteName } from '../../types/audio';

const NOTE_NAMES: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// A4 = 440 Hz (standard tuning reference)
const A4_FREQUENCY = 440;
const A4_MIDI = 69;

/**
 * Convert frequency to MIDI note number
 */
export function frequencyToMidi(frequency: number): number {
  return 12 * Math.log2(frequency / A4_FREQUENCY) + A4_MIDI;
}

/**
 * Convert MIDI note number to frequency
 */
export function midiToFrequency(midi: number): number {
  return A4_FREQUENCY * Math.pow(2, (midi - A4_MIDI) / 12);
}

/**
 * Convert frequency to nearest note
 */
export function frequencyToNote(frequency: number): Note {
  const midi = Math.round(frequencyToMidi(frequency));
  const noteIndex = midi % 12;
  const octave = Math.floor(midi / 12) - 1;
  
  return {
    name: NOTE_NAMES[noteIndex],
    octave,
    frequency: midiToFrequency(midi),
  };
}

/**
 * Calculate cents deviation from target frequency
 * Positive = sharp, Negative = flat
 */
export function calculateCents(detectedFreq: number, targetFreq: number): number {
  return 1200 * Math.log2(detectedFreq / targetFreq);
}

/**
 * Check if frequency is within tolerance (in cents)
 */
export function isInTune(detectedFreq: number, targetFreq: number, toleranceCents: number = 10): boolean {
  const cents = Math.abs(calculateCents(detectedFreq, targetFreq));
  return cents <= toleranceCents;
}

/**
 * Get note name with octave (e.g., "A4", "C#3")
 */
export function getNoteName(note: Note): string {
  return `${note.name}${note.octave}`;
}

/**
 * Standard guitar string frequencies (standard tuning)
 */
export const GUITAR_STRINGS = {
  E2: 82.41,
  A2: 110.00,
  D3: 146.83,
  G3: 196.00,
  B3: 246.94,
  E4: 329.63,
} as const;
