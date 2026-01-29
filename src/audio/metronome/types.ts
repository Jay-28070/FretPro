/**
 * Metronome types
 */

export interface MetronomeConfig {
  bpm: number;
  beatsPerMeasure: number;
  subdivision: 1 | 2 | 3 | 4; // Quarter, eighth, triplet, sixteenth
  accentFirstBeat: boolean;
  volume: number;
}

export interface MetronomeState {
  isPlaying: boolean;
  currentBeat: number;
  currentMeasure: number;
  bpm: number;
}

export type ClickSound = 'high' | 'low' | 'wood' | 'digital';
