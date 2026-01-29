/**
 * Practice session and command types
 */

import { GuitarString, NoteName } from './audio';

export interface PracticeCommand {
  id: string;
  note: NoteName;
  octave: number;
  string: GuitarString;
  fret: number;
  spokenText: string; // e.g., "Play G on the B string"
}

export interface PracticeResult {
  command: PracticeCommand;
  pitchCorrect: boolean;
  stringCorrect: boolean;
  timingCorrect: boolean;
  timestamp: number;
  detectedFrequency?: number;
}

export interface PracticeSession {
  id: string;
  startTime: number;
  commands: PracticeCommand[];
  results: PracticeResult[];
  isActive: boolean;
}

export type PracticeMode = 'freeplay' | 'guided' | 'timed';

export interface PracticeConfig {
  mode: PracticeMode;
  bpm?: number;
  allowedStrings?: GuitarString[];
  allowedFrets?: number[];
}
