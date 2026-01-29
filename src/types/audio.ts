/**
 * Core audio types used across all audio modules
 */

export type NoteName = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';

export type GuitarString = 'E2' | 'A2' | 'D3' | 'G3' | 'B3' | 'E4';

export interface Note {
  name: NoteName;
  octave: number;
  frequency: number;
}

export interface DetectedPitch {
  frequency: number;
  confidence: number; // 0-1
  timestamp: number;
}

export interface TuningResult {
  targetNote: Note;
  detectedFrequency: number;
  centsOff: number; // Negative = flat, positive = sharp
  isInTune: boolean;
}

export interface AudioPermissions {
  microphone: boolean;
  granted: boolean;
}
