/**
 * Tuner Service (Phase 2 Implementation)
 * 
 * Provides guitar tuning functionality.
 * Listens to played strings and provides visual/audio feedback.
 */

import { pitchDetectionService } from './PitchDetectionService';

type GuitarString = 'E2' | 'A2' | 'D3' | 'G3' | 'B3' | 'E4';

interface TunerState {
  isActive: boolean;
  targetString: GuitarString | null;
  currentFrequency: number | null;
  centsOff: number;
  isInTune: boolean;
  confidence: number;
}

interface StringInfo {
  frequency: number;
  name: string;
}

// Standard guitar tuning frequencies
const GUITAR_STRINGS: Record<GuitarString, StringInfo> = {
  'E2': { frequency: 82.41, name: 'Low E' },
  'A2': { frequency: 110.00, name: 'A' },
  'D3': { frequency: 146.83, name: 'D' },
  'G3': { frequency: 196.00, name: 'G' },
  'B3': { frequency: 246.94, name: 'B' },
  'E4': { frequency: 329.63, name: 'High E' },
};

class TunerService {
  private state: TunerState = {
    isActive: false,
    targetString: null,
    currentFrequency: null,
    centsOff: 0,
    isInTune: false,
    confidence: 0,
  };

  private callbacks: Set<(state: TunerState) => void> = new Set();

  /**
   * Start tuner mode
   */
  async start(targetString?: GuitarString): Promise<void> {
    try {
      // Initialize pitch detection if needed
      await pitchDetectionService.initialize();

      this.state.isActive = true;
      this.state.targetString = targetString || null;

      // Add our callback to pitch detection
      pitchDetectionService.addCallback(this.handlePitchDetection);

      // Start listening
      await pitchDetectionService.startListening();

      console.log('[Tuner] Started', targetString ? `for ${targetString}` : '(auto-detect)');
      this.notifyCallbacks();
    } catch (error) {
      console.error('[Tuner] Failed to start:', error);
      throw error;
    }
  }

  /**
   * Stop tuner mode
   */
  async stop(): Promise<void> {
    try {
      this.state.isActive = false;
      this.state.currentFrequency = null;
      this.state.centsOff = 0;
      this.state.isInTune = false;
      this.state.confidence = 0;

      // Remove our callback and stop listening
      pitchDetectionService.removeCallback(this.handlePitchDetection);
      await pitchDetectionService.stopListening();

      console.log('[Tuner] Stopped');
      this.notifyCallbacks();
    } catch (error) {
      console.error('[Tuner] Error stopping:', error);
    }
  }

  /**
   * Get current tuner state
   */
  getState(): TunerState {
    return { ...this.state };
  }

  /**
   * Add callback for state changes
   */
  addCallback(callback: (state: TunerState) => void): void {
    this.callbacks.add(callback);
  }

  /**
   * Remove callback
   */
  removeCallback(callback: (state: TunerState) => void): void {
    this.callbacks.delete(callback);
  }

  /**
   * Handle pitch detection results
   */
  private handlePitchDetection = (result: { frequency: number | null; confidence: number }) => {
    if (!this.state.isActive) return;

    this.state.currentFrequency = result.frequency;
    this.state.confidence = result.confidence;

    if (result.frequency && result.confidence > 0.5) {
      // Find the closest string or use target string
      const targetFreq = this.state.targetString
        ? GUITAR_STRINGS[this.state.targetString].frequency
        : this.findClosestString(result.frequency).frequency;

      // Calculate cents off
      this.state.centsOff = this.calculateCentsOff(result.frequency, targetFreq);

      // Check if in tune (within ±10 cents)
      this.state.isInTune = Math.abs(this.state.centsOff) <= 10;

      // Auto-detect string if not specified
      if (!this.state.targetString) {
        const closest = this.findClosestString(result.frequency);
        if (Math.abs(this.calculateCentsOff(result.frequency, closest.frequency)) <= 50) {
          // Only auto-detect if within 50 cents
          this.state.targetString = closest.string;
        }
      }
    } else {
      // No reliable frequency detected
      this.state.centsOff = 0;
      this.state.isInTune = false;
    }

    this.notifyCallbacks();
  };

  /**
   * Find the closest guitar string to a frequency
   */
  private findClosestString(frequency: number): { string: GuitarString; frequency: number } {
    let closest = { string: 'E2' as GuitarString, frequency: GUITAR_STRINGS.E2.frequency };
    let minDiff = Math.abs(frequency - closest.frequency);

    for (const [stringName, info] of Object.entries(GUITAR_STRINGS)) {
      const diff = Math.abs(frequency - info.frequency);
      if (diff < minDiff) {
        minDiff = diff;
        closest = { string: stringName as GuitarString, frequency: info.frequency };
      }
    }

    return closest;
  }

  /**
   * Calculate cents difference between two frequencies
   */
  private calculateCentsOff(actualFreq: number, targetFreq: number): number {
    return Math.round(1200 * Math.log2(actualFreq / targetFreq));
  }

  /**
   * Notify all callbacks of state change
   */
  private notifyCallbacks(): void {
    this.callbacks.forEach(callback => {
      try {
        callback(this.getState());
      } catch (error) {
        console.error('[Tuner] Callback error:', error);
      }
    });
  }

  /**
   * Get string info by name
   */
  getStringInfo(stringName: GuitarString): StringInfo {
    return GUITAR_STRINGS[stringName];
  }

  /**
   * Get all available strings
   */
  getAllStrings(): Array<{ key: GuitarString; info: StringInfo }> {
    return Object.entries(GUITAR_STRINGS).map(([key, info]) => ({
      key: key as GuitarString,
      info,
    }));
  }
}

export const tunerService = new TunerService();
