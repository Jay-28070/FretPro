/**
 * Metronome Service (SCAFFOLDED)
 * 
 * Provides precise timing for practice sessions.
 * Will integrate with practice engine for timing validation.
 * 
 * TODO Phase 2:
 * - Implement high-precision timing (Web Audio API / expo-av)
 * - Add click sound generation
 * - Support tempo changes
 * - Add visual beat indicator
 * - Implement tap tempo
 * - Add polyrhythm support
 */

import { ClickSound, MetronomeConfig, MetronomeState } from './types';

class MetronomeService {
  private config: MetronomeConfig = {
    bpm: 120,
    beatsPerMeasure: 4,
    subdivision: 1,
    accentFirstBeat: true,
    volume: 0.8,
  };

  private state: MetronomeState = {
    isPlaying: false,
    currentBeat: 0,
    currentMeasure: 0,
    bpm: 120,
  };

  private intervalId: NodeJS.Timeout | null = null;
  private clickSound: ClickSound = 'digital';

  /**
   * Start metronome
   */
  async start(): Promise<void> {
    if (this.state.isPlaying) return;

    this.state.isPlaying = true;
    this.state.currentBeat = 0;
    this.state.currentMeasure = 0;

    // TODO: Use Web Audio API for precise timing
    // TODO: Load click sound samples
    // TODO: Implement scheduling ahead for accuracy
    
    const intervalMs = (60 / this.config.bpm) * 1000;
    
    this.intervalId = setInterval(() => {
      this.tick();
    }, intervalMs);

    console.log(`[Metronome] Started at ${this.config.bpm} BPM`);
  }

  /**
   * Stop metronome
   */
  async stop(): Promise<void> {
    if (!this.state.isPlaying) return;

    this.state.isPlaying = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    console.log('[Metronome] Stopped');
  }

  /**
   * Process each beat
   */
  private tick(): void {
    this.state.currentBeat++;
    
    if (this.state.currentBeat > this.config.beatsPerMeasure) {
      this.state.currentBeat = 1;
      this.state.currentMeasure++;
    }

    // TODO: Play click sound
    // TODO: Emit beat event for UI updates
    const isAccent = this.state.currentBeat === 1 && this.config.accentFirstBeat;
    console.log(`[Metronome] Beat ${this.state.currentBeat}${isAccent ? ' (accent)' : ''}`);
  }

  /**
   * Set tempo
   */
  setTempo(bpm: number): void {
    if (bpm < 30 || bpm > 300) {
      throw new Error('BPM must be between 30 and 300');
    }

    this.config.bpm = bpm;
    this.state.bpm = bpm;

    // Restart if playing to apply new tempo
    if (this.state.isPlaying) {
      this.stop();
      this.start();
    }
  }

  /**
   * Get current state
   */
  getState(): MetronomeState {
    return { ...this.state };
  }

  /**
   * Update configuration
   */
  setConfig(config: Partial<MetronomeConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Set click sound type
   */
  setClickSound(sound: ClickSound): void {
    this.clickSound = sound;
    // TODO: Load appropriate sound sample
  }
}

export const metronomeService = new MetronomeService();
