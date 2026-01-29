/**
 * Pitch Detection types
 */

import { Note } from '../../types/audio';

export interface PitchDetectionConfig {
  sampleRate: number;
  bufferSize: number;
  minFrequency: number;
  maxFrequency: number;
  confidenceThreshold: number;
}

export interface PitchAnalysisResult {
  frequency: number | null;
  confidence: number;
  note: Note | null;
  centsOff: number; // Deviation from perfect pitch
}
