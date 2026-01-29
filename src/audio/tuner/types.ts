/**
 * Tuner types
 */

import { GuitarString } from '../../types/audio';

export interface TunerConfig {
  referenceFrequency: number; // A4 = 440 Hz
  toleranceCents: number;
  autoDetectString: boolean;
}

export interface TunerState {
  isActive: boolean;
  targetString: GuitarString | null;
  currentFrequency: number | null;
  centsOff: number;
  isInTune: boolean;
}
