/**
 * Native Pitch Detection Implementation
 * 
 * This file will be used when you eject and implement native audio.
 * For now, it uses the same metering-based approach as the main service.
 * 
 * TO IMPLEMENT NATIVE AUDIO (after ejecting):
 * 1. Install: npm install react-native-audio-toolkit
 * 2. Replace the metering approach with FFT-based pitch detection
 * 3. Use the native audio buffer for autocorrelation
 */

import { Audio } from 'expo-av';

interface PitchAnalysisResult {
  frequency: number | null;
  confidence: number;
  timestamp: number;
}

type PitchCallback = (result: PitchAnalysisResult) => void;

class NativePitchDetectionService {
  private isInitialized = false;
  private isListening = false;
  private callbacks: Set<PitchCallback> = new Set();
  private recording: Audio.Recording | null = null;
  private meteringSamples: number[] = [];
  private lastMeteringTime = 0;

  /**
   * Initialize native audio
   */
  async initialize(): Promise<void> {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Microphone permission not granted');
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
      });

      console.log('[NativePitchDetection] Initialized (metering mode)');
      console.log('[NativePitchDetection] TODO: Implement FFT-based detection after ejecting');
      this.isInitialized = true;
    } catch (error) {
      console.error('[NativePitchDetection] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Start listening
   */
  async startListening(): Promise<void> {
    if (!this.isInitialized || this.isListening) return;

    try {
      this.recording = new Audio.Recording();

      const recordingOptions = {
        isMeteringEnabled: true,
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      };

      await this.recording.prepareToRecordAsync(recordingOptions);
      
      this.recording.setOnRecordingStatusUpdate((status) => {
        if (status.isRecording && status.metering !== undefined) {
          this.processMeteringData(status.metering);
        }
      });

      this.recording.setProgressUpdateInterval(100);
      await this.recording.startAsync();

      this.isListening = true;
      console.log('[NativePitchDetection] Started listening (metering mode)');
    } catch (error) {
      console.error('[NativePitchDetection] Failed to start:', error);
      throw error;
    }
  }

  /**
   * Stop listening
   */
  async stopListening(): Promise<void> {
    if (!this.isListening) return;

    try {
      if (this.recording) {
        await this.recording.stopAndUnloadAsync();
        this.recording = null;
      }
      this.meteringSamples = [];
      this.isListening = false;
      console.log('[NativePitchDetection] Stopped listening');
    } catch (error) {
      console.error('[NativePitchDetection] Error stopping:', error);
    }
  }

  addCallback(callback: PitchCallback): void {
    this.callbacks.add(callback);
  }

  removeCallback(callback: PitchCallback): void {
    this.callbacks.delete(callback);
  }

  getIsListening(): boolean {
    return this.isListening;
  }

  /**
   * Process metering data (temporary implementation)
   * TODO: Replace with FFT-based pitch detection after ejecting
   */
  private processMeteringData(metering: number): void {
    const now = Date.now();
    
    this.meteringSamples.push(metering);
    
    if (this.meteringSamples.length > 50) {
      this.meteringSamples.shift();
    }

    if (now - this.lastMeteringTime >= 100) {
      this.lastMeteringTime = now;
      
      // For now, return no detection (metering can't detect pitch)
      const result: PitchAnalysisResult = {
        frequency: null,
        confidence: 0,
        timestamp: Date.now(),
      };
      
      this.notifyCallbacks(result);
    }
  }

  private notifyCallbacks(result: PitchAnalysisResult): void {
    this.callbacks.forEach(callback => {
      try {
        callback(result);
      } catch (error) {
        console.error('[NativePitchDetection] Callback error:', error);
      }
    });
  }
}

export const nativePitchDetectionService = new NativePitchDetectionService();
