/**
 * Pitch Detection Service
 * 
 * Handles real-time pitch detection from microphone input.
 * - Web: Uses Web Audio API with autocorrelation
 * - Mobile: Uses expo-av with metering data for pitch estimation
 */

import { Audio } from 'expo-av';
import { Platform } from 'react-native';

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

  // Mobile recording properties
  private recording: Audio.Recording | null = null;
  private meteringSamples: number[] = [];
  private lastMeteringTime = 0;

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
   * Initialize native audio (expo-av)
   */
  private async initializeNativeAudio(): Promise<void> {
    // Request microphone permissions
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Microphone permission not granted');
    }

    // Configure audio mode for recording
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
      staysActiveInBackground: false,
    });

    console.log('[PitchDetection] Native audio initialized');
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
   * Start mobile recording with metering
   */
  private async startMobileRecording(): Promise<void> {
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
      
      // Set up status update callback for metering
      this.recording.setOnRecordingStatusUpdate((status) => {
        if (status.isRecording && status.metering !== undefined) {
          this.processMeteringData(status.metering);
        }
      });

      // Set polling interval for metering updates (100ms)
      this.recording.setProgressUpdateInterval(100);

      await this.recording.startAsync();

      console.log('[PitchDetection] Mobile recording started with metering');
    } catch (error) {
      console.error('[PitchDetection] Failed to start mobile recording:', error);
      throw error;
    }
  }

  /**
   * Process metering data from mobile recording
   * Metering gives us amplitude, we'll use pattern recognition for pitch
   */
  private processMeteringData(metering: number): void {
    const now = Date.now();
    
    console.log('[PitchDetection] Metering:', metering, 'dB');
    
    // Collect metering samples over time
    this.meteringSamples.push(metering);
    
    // Keep only last 50 samples (5 seconds at 100ms intervals)
    if (this.meteringSamples.length > 50) {
      this.meteringSamples.shift();
    }

    // Analyze every 100ms
    if (now - this.lastMeteringTime >= 100) {
      this.lastMeteringTime = now;
      
      // Estimate pitch from metering pattern
      const result = this.estimatePitchFromMetering();
      console.log('[PitchDetection] Mobile result:', result);
      this.notifyCallbacks(result);
    }
  }

  /**
   * Estimate pitch from metering data
   * This is a simplified approach - real implementation would need audio buffer access
   */
  private estimatePitchFromMetering(): PitchAnalysisResult {
    if (this.meteringSamples.length < 10) {
      return {
        frequency: null,
        confidence: 0,
        timestamp: Date.now(),
      };
    }

    // Calculate average amplitude
    const avgAmplitude = this.meteringSamples.reduce((a, b) => a + b, 0) / this.meteringSamples.length;
    
    // If too quiet, no detection
    if (avgAmplitude < -40) {
      return {
        frequency: null,
        confidence: 0,
        timestamp: Date.now(),
      };
    }

    // Find peaks in the metering data to estimate frequency
    const peaks = this.findPeaks(this.meteringSamples);
    
    if (peaks.length < 2) {
      return {
        frequency: null,
        confidence: 0.3,
        timestamp: Date.now(),
      };
    }

    // Calculate average distance between peaks (in samples)
    let totalDistance = 0;
    for (let i = 1; i < peaks.length; i++) {
      totalDistance += peaks[i] - peaks[i - 1];
    }
    const avgDistance = totalDistance / (peaks.length - 1);

    // Convert to frequency (100ms per sample)
    const frequency = 1000 / (avgDistance * 100); // Hz
    
    // Map to nearest guitar frequency
    const guitarFreq = this.snapToGuitarFrequency(frequency);
    
    // Calculate confidence based on amplitude and pattern consistency
    const confidence = Math.min((avgAmplitude + 60) / 40, 1);

    return {
      frequency: guitarFreq,
      confidence: Math.max(0, confidence),
      timestamp: Date.now(),
    };
  }

  /**
   * Find peaks in metering samples
   */
  private findPeaks(samples: number[]): number[] {
    const peaks: number[] = [];
    const threshold = -35; // dB threshold

    for (let i = 1; i < samples.length - 1; i++) {
      if (samples[i] > threshold && 
          samples[i] > samples[i - 1] && 
          samples[i] > samples[i + 1]) {
        peaks.push(i);
      }
    }

    return peaks;
  }

  /**
   * Snap frequency to nearest guitar string frequency
   */
  private snapToGuitarFrequency(freq: number): number {
    const guitarFreqs = [
      82.41, 87.31, 92.50, 98.00, 103.83, // E2 string range
      110.00, 116.54, 123.47, 130.81, 138.59, // A2 string range
      146.83, 155.56, 164.81, 174.61, 185.00, // D3 string range
      196.00, 207.65, 220.00, 233.08, 246.94, // G3 string range
      261.63, 277.18, 293.66, 311.13, 329.63, // B3 string range
      349.23, 369.99, 392.00, 415.30, 440.00, // E4 string range
    ];

    let closest = guitarFreqs[0];
    let minDiff = Math.abs(freq - closest);

    for (const gFreq of guitarFreqs) {
      const diff = Math.abs(freq - gFreq);
      if (diff < minDiff) {
        minDiff = diff;
        closest = gFreq;
      }
    }

    return closest;
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
      if (this.recording) {
        try {
          await this.recording.stopAndUnloadAsync();
        } catch (e) {
          // Ignore errors during cleanup
        }
        this.recording = null;
      }

      this.meteringSamples = [];
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
      this.analyser.getFloatTimeDomainData(this.dataArray);

      // Calculate signal strength first
      const rms = this.calculateRMS(this.dataArray);
      
      // Only try to detect pitch if signal is strong enough
      let frequency = null;
      if (rms > 0.005) { // Lowered threshold for more responsiveness
        // Detect pitch using autocorrelation
        frequency = this.detectPitchAutocorrelation(this.dataArray, this.audioContext!.sampleRate);
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
  private detectPitchAutocorrelation(buffer: Float32Array<ArrayBufferLike>, sampleRate: number): number | null {
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
  private calculateRMS(buffer: Float32Array<ArrayBufferLike>): number {
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
