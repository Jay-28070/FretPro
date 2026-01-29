/**
 * Practice Engine
 * 
 * Orchestrates the core practice loop:
 * 1. Generate command
 * 2. Speak instruction
 * 3. Listen for user input
 * 4. Validate result
 * 5. Provide feedback
 * 
 * This is the central coordinator that ties together:
 * - TTS Service
 * - Pitch Detection Service
 * - Command Generator
 * - Metronome (future)
 */

import { pitchDetectionService } from '../audio/pitchDetection/PitchDetectionService';
import { ttsService } from '../audio/tts/TTSService';
import {
    PracticeCommand,
    PracticeConfig,
    PracticeResult,
    PracticeSession
} from '../types/practice';
import { commandGenerator } from './CommandGenerator';

type PracticeEngineListener = (event: PracticeEngineEvent) => void;

interface PracticeEngineEvent {
  type: 'command_issued' | 'listening_started' | 'result_ready' | 'session_ended';
  data?: any;
}

class PracticeEngine {
  private session: PracticeSession | null = null;
  private currentCommand: PracticeCommand | null = null;
  private config: PracticeConfig = {
    mode: 'guided',
  };
  private listeners: PracticeEngineListener[] = [];

  /**
   * Start a new practice session
   */
  async startSession(config?: Partial<PracticeConfig>): Promise<void> {
    if (this.session?.isActive) {
      throw new Error('Session already active');
    }

    this.config = { ...this.config, ...config };

    this.session = {
      id: `session_${Date.now()}`,
      startTime: Date.now(),
      commands: [],
      results: [],
      isActive: true,
    };

    // Initialize audio services
    await pitchDetectionService.initialize();

    console.log('[PracticeEngine] Session started', this.session.id);

    // Issue first command
    await this.nextCommand();
  }

  /**
   * End current practice session
   */
  async endSession(): Promise<void> {
    if (!this.session) return;

    this.session.isActive = false;
    await pitchDetectionService.stopListening();
    await ttsService.clear();

    this.emit({ type: 'session_ended', data: this.session });
    
    console.log('[PracticeEngine] Session ended', {
      duration: Date.now() - this.session.startTime,
      commandsIssued: this.session.commands.length,
      resultsRecorded: this.session.results.length,
    });

    this.session = null;
    this.currentCommand = null;
  }

  /**
   * Generate and speak next command
   */
  async nextCommand(): Promise<void> {
    if (!this.session?.isActive) {
      throw new Error('No active session');
    }

    // Generate command
    this.currentCommand = commandGenerator.generate(this.config);
    this.session.commands.push(this.currentCommand);

    // Speak instruction
    await ttsService.speakNow(this.currentCommand.spokenText);

    this.emit({ type: 'command_issued', data: this.currentCommand });

    console.log('[PracticeEngine] Command issued:', this.currentCommand.spokenText);

    // Start listening after speech completes
    setTimeout(() => {
      this.startListening();
    }, 500);
  }

  /**
   * Start listening for user input
   */
  private async startListening(): Promise<void> {
    if (!this.currentCommand) return;

    this.emit({ type: 'listening_started' });
    
    await pitchDetectionService.startListening();

    console.log('[PracticeEngine] Listening for input...');

    // TODO Phase 2: Implement actual pitch detection
    // For now, simulate with timeout
    setTimeout(() => {
      this.simulateResult();
    }, 2000);
  }

  /**
   * TEMPORARY: Simulate a result for testing
   * Will be replaced with real pitch detection in Phase 2
   */
  private async simulateResult(): Promise<void> {
    if (!this.currentCommand || !this.session) return;

    // Simulate random success/failure
    const pitchCorrect = Math.random() > 0.3;
    
    const result: PracticeResult = {
      command: this.currentCommand,
      pitchCorrect,
      stringCorrect: true, // Assumed for MVP
      timingCorrect: true, // Future metronome integration
      timestamp: Date.now(),
    };

    this.session.results.push(result);

    await pitchDetectionService.stopListening();

    // Provide feedback
    const feedback = pitchCorrect ? 'Correct!' : 'Try again';
    await ttsService.speak(feedback);

    this.emit({ type: 'result_ready', data: result });

    console.log('[PracticeEngine] Result:', result);

    // Move to next command after feedback
    setTimeout(() => {
      if (this.session?.isActive) {
        this.nextCommand();
      }
    }, 1500);
  }

  /**
   * Get current session
   */
  getSession(): PracticeSession | null {
    return this.session;
  }

  /**
   * Get current command
   */
  getCurrentCommand(): PracticeCommand | null {
    return this.currentCommand;
  }

  /**
   * Subscribe to practice engine events
   */
  subscribe(listener: PracticeEngineListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Emit event to all listeners
   */
  private emit(event: PracticeEngineEvent): void {
    this.listeners.forEach(listener => listener(event));
  }
}

export const practiceEngine = new PracticeEngine();
