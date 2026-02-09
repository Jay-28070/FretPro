/**
 * Pitch Detection Service
 * 
 * Handles real-time pitch detection from microphone input.
 * - Web: Uses Web Audio API with autocorrelation
 * - Mobile: Uses expo-audio with audio buffer processing
 */

import { Platform } from 'react-native';

// Conditional imports for mobile audio
let AudioRecording: any;
let requestRecordingPermissionsAsync: any;

if (Platform.OS !== 'web') {
  try {
    const expoAudio = require('expo-audio');
    AudioRecording = expoAudio.AudioRecording;
    requestRecordingPermissionsAsync = expoAudio.requestRecordingPermissionsAsync;
  } catch (e) {
    console.warn('[PitchDetection] expo-audio not available');
  }
}

interface PitchAnalysisResult {
  frequency: number | null;
  confidence: number;
  timestamp: number;
}

type PitchCallback = (result: PitchAnalysisResult) => void;

class PitchDetectionService {
  private isInitialized = false;
  private isListening = false;
  private callbacks: Set<PitchCallback> = new Set();
  private analysisInterval: ReturnType<typeof setInterval> | null = null;

  // Web Audio API properties
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private dataArray: Float32Array | null = null;

  // Mobile recording properties (expo-audio)
  private audioRecording: any = null; // expo-audio Recording instance
  private recordingInterval: ReturnType<typeof setInterval> | null = null;
  private audioChunks: Float32Array[] = [];
  private isProcessing = false;

  /**
   * Initialize pitch detection engine
   */
  async initialize(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // Web: Use Web Audio API
        await this.initializeWebAudio();
      } else {
        // Mobile: Use expo-av
        await this.initializeNativeAudio();
      }

      console.log('[PitchDetection] Service initialized successfully');
      this.isInitialized = true;
    } catch (error) {
      console.error('[PitchDetection] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Initialize Web Audio API for browser
   */
  private async initializeWebAudio(): Promise<void> {
    try {
      if (typeof window === 'undefined' || !window.AudioContext) {
        throw new Error('Web Audio API not supported');
      }

      console.log('[PitchDetection] Requesting microphone access...');

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      console.log('[PitchDetection] Microphone access granted');

      // Create audio context
      this.audioContext = new AudioContext({ sampleRate: 44100 });
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 8192; // Increased from 4096 for better low-frequency resolution
      this.analyser.smoothingTimeConstant = 0.85; // Slightly more smoothing for stability

      // Connect microphone
      this.microphone = this.audioContext.createMediaStreamSource(stream);
      this.microphone.connect(this.analyser);

      // Create data array for frequency analysis
      this.dataArray = new Float32Array(this.analyser.fftSize);

      console.log('[PitchDetection] Web Audio initialized with FFT size:', this.analyser.fftSize);
    } catch (error) {
      console.error('[PitchDetection] Web Audio initialization failed:', error);
      throw new Error(`Microphone access denied or not available: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Initialize native audio (expo-audio)
   */
  private async initializeNativeAudio(): Promise<void> {
    try {
      if (!requestRecordingPermissionsAsync) {
        throw new Error('expo-audio not available');
      }

      // Request microphone permissions
      const { status } = await requestRecordingPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Microphone permission not granted');
      }

      console.log('[PitchDetection] Native audio initialized with expo-audio');
    } catch (error) {
      console.error('[PitchDetection] Native audio initialization failed:', error);
      throw error;
    }
  }

  /**
   * Start listening for pitch
   */
  async startListening(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('PitchDetectionService not initialized');
    }

    if (this.isListening) {
      return; // Already listening
    }

    this.isListening = true;

    if (Platform.OS === 'web') {
      // Start analysis loop for web
      this.startWebAnalysisLoop();
    } else {
      // Start recording for mobile
      await this.startMobileRecording();
    }

    console.log('[PitchDetection] Started listening');
  }

  /**
   * Start mobile recording with expo-audio
   */
  private async startMobileRecording(): Promise<void> {
    try {
      if (!AudioRecording) {
        throw new Error('expo-audio not available');
      }

      const recordingOptions = {
        android: {
          extension: '.wav',
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.wav',
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      };

      // Create recording instance
      this.audioRecording = new AudioRecording(recordingOptions);
      
      // Start recording
      await this.audioRecording.startAsync();

      console.log('[PitchDetection] Mobile recording started with expo-audio');

      // Start processing loop - analyze audio every 100ms
      this.recordingInterval = setInterval(async () => {
        if (!this.isProcessing && this.audioRecording) {
          await this.processAudioChunk();
        }
      }, 100);

    } catch (error) {
      console.error('[PitchDetection] Failed to start mobile recording:', error);
      throw error;
    }
  }

  /**
   * Process audio chunk from recording
   */
  private async processAudioChunk(): Promise<void> {
    if (this.isProcessing || !this.audioRecording) return;

    this.isProcessing = true;

    try {
      // Get current recording status
      const status = await this.audioRecording.getStatusAsync();
      
      if (!status.isRecording) {
        this.isProcessing = false;
        return;
      }

      // For expo-audio, we need to stop, get the URI, process it, and restart
      // This is a limitation - we'll use a different approach with continuous recording
      
      // Alternative: Use Web Audio API approach adapted for mobile
      // Since expo-audio doesn't provide direct buffer access in real-time,
      // we'll use a workaround with short recording segments
      
      // Stop current recording
      await this.audioRecording.stopAsync();
      
      // Get the recording URI
      const uri = this.audioRecording.getURI();
      
      if (uri) {
        // Process the audio file
        await this.processAudioFile(uri);
      }

      // Start new recording for next chunk
      await this.audioRecording.startAsync();

    } catch (error) {
      console.error('[PitchDetection] Error processing audio chunk:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process audio file and extract pitch
   */
  private async processAudioFile(uri: string): Promise<void> {
    try {
      // Load audio file
      const response = await fetch(uri);
      const arrayBuffer = await response.arrayBuffer();
      
      // Decode WAV file to get audio samples
      const audioData = this.decodeWAV(arrayBuffer);
      
      if (audioData && audioData.samples.length > 0) {
        // Detect pitch using autocorrelation
        const frequency = this.detectPitchAutocorrelation(audioData.samples, audioData.sampleRate);
        
        // Calculate confidence based on signal strength
        const rms = this.calculateRMS(audioData.samples);
        const confidence = Math.min(rms * 15, 1);

        const result: PitchAnalysisResult = {
          frequency: frequency && confidence > 0.2 ? frequency : null,
          confidence,
          timestamp: Date.now(),
        };

        console.log('[PitchDetection] Mobile result:', result);
        this.notifyCallbacks(result);
      }
    } catch (error) {
      console.error('[PitchDetection] Error processing audio file:', error);
    }
  }

  /**
   * Decode WAV file to Float32Array
   */
  private decodeWAV(arrayBuffer: ArrayBuffer): { samples: Float32Array; sampleRate: number } | null {
    try {
      const view = new DataView(arrayBuffer);
      
      // Check WAV header
      const riff = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3));
      if (riff !== 'RIFF') {
        console.error('[PitchDetection] Invalid WAV file - no RIFF header');
        return null;
      }

      // Get sample rate (at byte 24)
      const sampleRate = view.getUint32(24, true);
      
      // Get bit depth (at byte 34)
      const bitDepth = view.getUint16(34, true);
      
      // Find data chunk
      let offset = 12;
      while (offset < view.byteLength) {
        const chunkId = String.fromCharCode(
          view.getUint8(offset),
          view.getUint8(offset + 1),
          view.getUint8(offset + 2),
          view.getUint8(offset + 3)
        );
        const chunkSize = view.getUint32(offset + 4, true);
        
        if (chunkId === 'data') {
          // Found data chunk
          const dataOffset = offset + 8;
          const numSamples = chunkSize / (bitDepth / 8);
          const samples = new Float32Array(numSamples);
          
          // Convert to float samples (-1 to 1)
          if (bitDepth === 16) {
            for (let i = 0; i < numSamples; i++) {
              const sample = view.getInt16(dataOffset + i * 2, true);
              samples[i] = sample / 32768.0;
            }
          } else if (bitDepth === 8) {
            for (let i = 0; i < numSamples; i++) {
              const sample = view.getUint8(dataOffset + i);
              samples[i] = (sample - 128) / 128.0;
            }
          }
          
          return { samples, sampleRate };
        }
        
        offset += 8 + chunkSize;
      }
      
      console.error('[PitchDetection] No data chunk found in WAV file');
      return null;
    } catch (error) {
      console.error('[PitchDetection] Error decoding WAV:', error);
      return null;
    }
  }

  /**
   * Stop listening
   */
  async stopListening(): Promise<void> {
    if (!this.isListening) {
      return;
    }

    try {
      // Stop analysis loop
      if (this.analysisInterval) {
        clearInterval(this.analysisInterval);
        this.analysisInterval = null;
      }

      // Stop recording interval
      if (this.recordingInterval) {
        clearInterval(this.recordingInterval);
        this.recordingInterval = null;
      }

      // Cleanup Web Audio
      if (this.microphone) {
        this.microphone.disconnect();
      }
      if (this.audioContext && this.audioContext.state !== 'closed') {
        await this.audioContext.close();
        this.audioContext = null;
        this.analyser = null;
        this.microphone = null;
        this.dataArray = null;
      }

      // Cleanup mobile recording
      if (this.audioRecording) {
        try {
          await this.audioRecording.stopAsync();
          await this.audioRecording.unloadAsync();
        } catch (e) {
          // Ignore errors during cleanup
        }
        this.audioRecording = null;
      }

      this.audioChunks = [];
      this.isListening = false;
      console.log('[PitchDetection] Stopped listening');
    } catch (error) {
      console.error('[PitchDetection] Error stopping listening:', error);
    }
  }

  /**
   * Add callback for pitch detection results
   */
  addCallback(callback: PitchCallback): void {
    this.callbacks.add(callback);
  }

  /**
   * Remove callback
   */
  removeCallback(callback: PitchCallback): void {
    this.callbacks.delete(callback);
  }

  /**
   * Check if currently listening
   */
  getIsListening(): boolean {
    return this.isListening;
  }

  /**
   * Start the web analysis loop using autocorrelation
   */
  private startWebAnalysisLoop(): void {
    this.analysisInterval = setInterval(() => {
      if (!this.isListening || !this.analyser || !this.dataArray) return;

      // Get time domain data
      this.analyser.getFloatTimeDomainData(this.dataArray as Float32Array<ArrayBuffer>);

      // Calculate signal strength first
      const rms = this.calculateRMS(this.dataArray as Float32Array);
      
      // Only try to detect pitch if signal is strong enough
      let frequency = null;
      if (rms > 0.005) { // Lowered threshold for more responsiveness
        // Detect pitch using autocorrelation
        frequency = this.detectPitchAutocorrelation(this.dataArray as Float32Array, this.audioContext!.sampleRate);
      }

      // Scale confidence based on RMS
      const confidence = Math.min(rms * 15, 1); // Balanced multiplier

      const result: PitchAnalysisResult = {
        frequency: frequency && confidence > 0.2 ? frequency : null, // Lower threshold for more updates
        confidence,
        timestamp: Date.now(),
      };

      // Notify all callbacks
      this.notifyCallbacks(result);
    }, 50); // Faster updates - every 50ms instead of 100ms
  }

  /**
   * Autocorrelation pitch detection algorithm
   */
  private detectPitchAutocorrelation(buffer: Float32Array, sampleRate: number): number | null {
    // First check if there's enough signal
    const rms = this.calculateRMS(buffer);
    if (rms < 0.005) {
      // Signal too weak, probably silence
      return null;
    }

    // Find the first zero crossing
    let start = 0;
    while (start < buffer.length && buffer[start] > 0) {
      start++;
    }

    // Calculate autocorrelation with extended range for low frequencies
    const minPeriod = Math.floor(sampleRate / 1200); // 1200 Hz max
    const maxPeriod = Math.floor(sampleRate / 40);   // 40 Hz min (lower for bass notes)

    let bestOffset = -1;
    let bestCorrelation = 0;
    let foundGoodCorrelation = false;

    for (let offset = minPeriod; offset < maxPeriod && offset < buffer.length / 2; offset++) {
      let correlation = 0;
      let count = 0;

      for (let i = start; i < buffer.length - offset; i++) {
        correlation += Math.abs(buffer[i] - buffer[i + offset]);
        count++;
      }

      if (count > 0) {
        correlation = 1 - correlation / count;

        // Lower threshold for better detection, especially for low notes
        if (correlation > 0.90) {
          foundGoodCorrelation = true;
          if (correlation > bestCorrelation) {
            bestCorrelation = correlation;
            bestOffset = offset;
          }
        }
      }
    }

    if (foundGoodCorrelation && bestOffset !== -1) {
      const frequency = sampleRate / bestOffset;
      // Extended guitar range (40-1200 Hz to catch low bass notes)
      if (frequency >= 40 && frequency <= 1200) {
        return frequency;
      }
    }

    return null;
  }

  /**
   * Calculate RMS (Root Mean Square) for signal strength
   */
  private calculateRMS(buffer: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < buffer.length; i++) {
      sum += buffer[i] * buffer[i];
    }
    return Math.sqrt(sum / buffer.length);
  }

  /**
   * Notify all callbacks
   */
  private notifyCallbacks(result: PitchAnalysisResult): void {
    this.callbacks.forEach(callback => {
      try {
        callback(result);
      } catch (error) {
        console.error('[PitchDetection] Callback error:', error);
      }
    });
  }
}

export const pitchDetectionService = new PitchDetectionService();
