/**
 * Tuner Service (SCAFFOLDED)
 * 
 * Provides guitar tuning functionality.
 * Listens to played strings and provides visual/audio feedback.
 * 
 * TODO Phase 2:
 * - Integrate with PitchDetectionService
 * - Implement string detection logic
 * - Add visual tuning meter
 * - Add audio feedback (beep when in tune)
 * - Support alternate tunings (Drop D, DADGAD, etc.)
 */

import { GuitarString } from '../../types/audio';
import { GUITAR_STRINGS, calculateCents, isInTune } from '../pitchDetection/noteMapping';
import { TunerConfig, TunerState } from './types';

class TunerService {
  private config: TunerConfig = {
    referenceFrequency: 440,
    toleranceCents: 5,
    autoDetectString: true,
  };

  private state: TunerState = {
    isActive: false,
    targetString: null,
    currentFrequency: null,
    centsOff: 0,
    isInTune: false,
  };

  /**
   * Start tuner mode
   */
  async start(targetString?: GuitarString): Promise<void> {
    this.state.isActive = true;
    this.state.targetString = targetString || null;
    
    // TODO: Start pitch detection
    // TODO: Begin continuous frequency monitoring
    console.log('[Tuner] Started', targetString ? `for ${targetString}` : '(auto-detect)');
  }

  /**
   * Stop tuner mode
   */
  async stop(): Promise<void> {
    this.state.isActive = false;
    this.state.currentFrequency = null;
    
    // TODO: Stop pitch detection
    console.log('[Tuner] Stopped');
  }

  /**
   * Process detected frequency
   */
  processFrequency(frequency: number): TunerState {
    this.state.currentFrequency = frequency;

    // Auto-detect closest string if not specified
    if (!this.state.targetString && this.config.autoDetectString) {
      this.state.targetString = this.detectClosestString(frequency);
    }

    // Calculate tuning accuracy
    if (this.state.targetString) {
      const targetFreq = GUITAR_STRINGS[this.state.targetString];
      this.state.centsOff = calculateCents(frequency, targetFreq);
      this.state.isInTune = isInTune(frequency, targetFreq, this.config.toleranceCents);
    }

    return { ...this.state };
  }

  /**
   * Detect which string is being played based on frequency
   */
  private detectClosestString(frequency: number): GuitarString {
    let closestString: GuitarString = 'E2';
    let minDiff = Infinity;

    for (const [string, freq] of Object.entries(GUITAR_STRINGS)) {
      const diff = Math.abs(frequency - freq);
      if (diff < minDiff) {
        minDiff = diff;
        closestString = string as GuitarString;
      }
    }

    return closestString;
  }

  /**
   * Get current tuner state
   */
  getState(): TunerState {
    return { ...this.state };
  }

  /**
   * Update configuration
   */
  setConfig(config: Partial<TunerConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

export const tunerService = new TunerService();
