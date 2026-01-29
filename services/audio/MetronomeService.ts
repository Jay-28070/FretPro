/**
 * Metronome Service (SCAFFOLDED - Phase 2)
 * 
 * Will provide precise timing for practice sessions.
 * Integrates with practice engine for timing validation.
 * 
 * TODO Phase 2:
 * - Implement high-precision timing
 * - Add click sound generation
 * - Support tempo changes
 * - Add visual beat indicator
 * - Implement tap tempo
 */

interface MetronomeState {
  isPlaying: boolean;
  currentBeat: number;
  bpm: number;
}

class MetronomeService {
  private state: MetronomeState = {
    isPlaying: false,
    currentBeat: 0,
    bpm: 120,
  };

  /**
   * Start metronome
   */
  async start(bpm: number = 120): Promise<void> {
    if (this.state.isPlaying) return;

    this.state.isPlaying = true;
    this.state.bpm = bpm;
    this.state.currentBeat = 0;

    // TODO Phase 2: Implement precise timing with Web Audio API or expo-av
    console.log(`[Metronome] Started at ${bpm} BPM (scaffolded)`);
  }

  /**
   * Stop metronome
   */
  async stop(): Promise<void> {
    this.state.isPlaying = false;
    console.log('[Metronome] Stopped');
  }

  /**
   * Set tempo
   */
  setTempo(bpm: number): void {
    if (bpm < 30 || bpm > 300) {
      throw new Error('BPM must be between 30 and 300');
    }
    this.state.bpm = bpm;
  }

  /**
   * Get current state
   */
  getState(): MetronomeState {
    return { ...this.state };
  }
}

export const metronomeService = new MetronomeService();
