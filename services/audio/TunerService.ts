/**
 * Tuner Service (SCAFFOLDED - Phase 2)
 * 
 * Will provide guitar tuning functionality.
 * Listens to played strings and provides visual/audio feedback.
 * 
 * TODO Phase 2:
 * - Integrate with PitchDetectionService
 * - Implement string detection logic
 * - Add visual tuning meter
 * - Support alternate tunings
 */

type GuitarString = 'E2' | 'A2' | 'D3' | 'G3' | 'B3' | 'E4';

interface TunerState {
  isActive: boolean;
  targetString: GuitarString | null;
  currentFrequency: number | null;
  centsOff: number;
  isInTune: boolean;
}

class TunerService {
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
    
    // TODO Phase 2: Start pitch detection
    console.log('[Tuner] Started', targetString ? `for ${targetString}` : '(auto-detect)');
  }

  /**
   * Stop tuner mode
   */
  async stop(): Promise<void> {
    this.state.isActive = false;
    this.state.currentFrequency = null;
    
    // TODO Phase 2: Stop pitch detection
    console.log('[Tuner] Stopped');
  }

  /**
   * Get current tuner state
   */
  getState(): TunerState {
    return { ...this.state };
  }
}

export const tunerService = new TunerService();
