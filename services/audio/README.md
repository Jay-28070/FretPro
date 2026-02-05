# Audio Services

This folder contains all audio-related services for FretPro.

## Services

### PitchDetectionService.ts
Main pitch detection service that works across platforms.

**Web**: ✅ Real-time pitch detection using Web Audio API + autocorrelation
**Mobile**: ⚠️ Placeholder (requires ejection for real implementation)

### TunerService.ts
Guitar tuner service that uses PitchDetectionService.
- Auto-detects guitar strings
- Calculates cents off from target pitch
- Provides tuning status (in-tune, close, far)

### SoundGenerator.ts
Generates audio tones for practice games.
- Metronome clicks (accent + regular beats)
- Musical notes with harmonics
- Uses Web Audio API

### TTSService.ts
Text-to-speech for Note Recognition game.
- Announces notes to play
- Converts sharp symbols to "sharp" pronunciation

## Platform Support

| Service | Web | iOS | Android |
|---------|-----|-----|---------|
| PitchDetection | ✅ Real | ⚠️ Placeholder | ⚠️ Placeholder |
| Tuner | ✅ Works | ⚠️ Limited | ⚠️ Limited |
| SoundGenerator | ✅ Works | ✅ Works | ✅ Works |
| TTS | ✅ Works | ✅ Works | ✅ Works |

## Future Implementation

To enable real pitch detection on mobile:
1. See `docs/NATIVE_AUDIO_GUIDE.md`
2. Eject from Expo: `npx expo prebuild`
3. Install native audio library
4. Implement FFT or autocorrelation on audio buffers

## Usage Example

```typescript
import { pitchDetectionService } from '@/services/audio/PitchDetectionService';

// Initialize
await pitchDetectionService.initialize();

// Add callback
pitchDetectionService.addCallback((result) => {
  console.log('Frequency:', result.frequency);
  console.log('Confidence:', result.confidence);
});

// Start listening
await pitchDetectionService.startListening();

// Stop listening
await pitchDetectionService.stopListening();
```

## Architecture

```
┌─────────────────────────────────────┐
│         Tuner Screen                │
│    (app/(tabs)/tuner.tsx)           │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│       TunerService.ts               │
│  - Manages tuner state              │
│  - Calculates cents off             │
│  - Auto-detects strings             │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   PitchDetectionService.ts          │
│  - Platform-specific detection      │
│  - Web: Autocorrelation             │
│  - Mobile: Placeholder              │
└─────────────────────────────────────┘
```

## Testing

**Web**: Open in browser, allow microphone, hum or play guitar
**Mobile**: Currently shows placeholder behavior (not accurate)

## Notes

- Web implementation is production-ready
- Mobile implementation requires ejection for real pitch detection
- All services use TypeScript for type safety
- Services follow singleton pattern for easy access
