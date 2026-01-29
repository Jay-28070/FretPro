/**
 * Text-to-Speech Service
 * 
 * Handles all spoken feedback in the app.
 * Uses expo-speech for cross-platform TTS.
 * 
 * Design decisions:
 * - Queue system for managing multiple speech requests
 * - Configurable voice parameters per message
 * - Automatic cleanup and error handling
 */

import * as Speech from 'expo-speech';
import { TTSConfig, TTSQueueItem, TTSStatus } from './types';

class TTSService {
  private queue: TTSQueueItem[] = [];
  private status: TTSStatus = 'idle';
  private defaultConfig: TTSConfig = {
    language: 'en-US',
    pitch: 1.0,
    rate: 0.9,
    volume: 1.0,
  };

  /**
   * Speak text immediately, interrupting current speech if needed
   */
  async speakNow(text: string, config?: Partial<TTSConfig>): Promise<void> {
    await this.stop();
    return this.speak(text, config);
  }

  /**
   * Add text to speech queue
   */
  async speak(text: string, config?: Partial<TTSConfig>): Promise<void> {
    const finalConfig = { ...this.defaultConfig, ...config };
    
    this.status = 'speaking';
    
    try {
      await Speech.speak(text, {
        language: finalConfig.language,
        pitch: finalConfig.pitch,
        rate: finalConfig.rate,
        volume: finalConfig.volume,
        onDone: () => {
          this.status = 'idle';
          this.processQueue();
        },
        onError: (error) => {
          console.error('TTS Error:', error);
          this.status = 'error';
        },
      });
    } catch (error) {
      console.error('TTS speak error:', error);
      this.status = 'error';
      throw error;
    }
  }

  /**
   * Queue text for speaking after current speech finishes
   */
  enqueue(text: string, priority: 'high' | 'normal' | 'low' = 'normal'): void {
    const item: TTSQueueItem = {
      id: Date.now().toString(),
      text,
      priority,
    };

    if (priority === 'high') {
      this.queue.unshift(item);
    } else {
      this.queue.push(item);
    }

    if (this.status === 'idle') {
      this.processQueue();
    }
  }

  /**
   * Process next item in queue
   */
  private async processQueue(): Promise<void> {
    if (this.queue.length === 0) {
      this.status = 'idle';
      return;
    }

    const item = this.queue.shift();
    if (item) {
      await this.speak(item.text, item.config);
    }
  }

  /**
   * Stop current speech
   */
  async stop(): Promise<void> {
    await Speech.stop();
    this.status = 'idle';
  }

  /**
   * Clear queue and stop speaking
   */
  async clear(): Promise<void> {
    this.queue = [];
    await this.stop();
  }

  /**
   * Check if currently speaking
   */
  isSpeaking(): boolean {
    return this.status === 'speaking';
  }

  /**
   * Get current status
   */
  getStatus(): TTSStatus {
    return this.status;
  }

  /**
   * Update default configuration
   */
  setDefaultConfig(config: Partial<TTSConfig>): void {
    this.defaultConfig = { ...this.defaultConfig, ...config };
  }
}

// Export singleton instance
export const ttsService = new TTSService();
