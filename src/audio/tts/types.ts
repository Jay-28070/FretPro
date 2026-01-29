/**
 * Text-to-Speech specific types
 */

export interface TTSConfig {
  language: string;
  pitch: number;
  rate: number;
  volume: number;
}

export interface TTSQueueItem {
  id: string;
  text: string;
  priority: 'high' | 'normal' | 'low';
  config?: Partial<TTSConfig>;
}

export type TTSStatus = 'idle' | 'speaking' | 'paused' | 'error';
