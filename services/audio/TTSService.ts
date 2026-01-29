/**
 * Text-to-Speech Service
 * 
 * Handles all spoken feedback in the app using expo-speech.
 * Manages speech queue and provides clean API for voice commands.
 * 
 * Why: Centralized TTS logic prevents conflicts and manages state.
 * Pattern: Singleton service with queue management.
 */

import * as Speech from 'expo-speech';

interface TTSConfig {
  language: string;
  pitch: number;
  rate: number;
  volume: number;
}

type TTSStatus = 'idle' | 'speaking' | 'error';

class TTSService {
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
   * Speak text
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
   * Stop current speech
   */
  async stop(): Promise<void> {
    await Speech.stop();
    this.status = 'idle';
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
