# Native Audio Implementation Guide

This guide explains how to implement real pitch detection on mobile after ejecting from Expo.

## Current Status

- ✅ **Web**: Real pitch detection using Web Audio API + autocorrelation
- ⚠️ **Mobile**: Placeholder implementation (metering-based, not accurate)

## When to Eject

Eject when:
- You're ready to publish to app stores
- The rest of the app is stable
- You have time to handle native build complexity

## Ejection Process

### Step 1: Prebuild (Generate Native Folders)

```bash
npx expo prebuild
```

This creates `android/` and `ios/` folders with native code.

### Step 2: Install Native Audio Library

```bash
npm install react-native-audio-toolkit
cd ios && pod install && cd ..
```

### Step 3: Update PitchDetectionService

Replace the mobile implementation in `services/audio/PitchDetectionService.ts`:

```typescript
// In the mobile section, replace metering with:
import { Recorder } from 'react-native-audio-toolkit';

private recorder: Recorder | null = null;

private async startMobileRecording(): Promise<void> {
  this.recorder = new Recorder('temp.wav', {
    bitrate: 128000,
    channels: 1,
    sampleRate: 44100,
    quality: 'high',
  });

  this.recorder.prepare((err) => {
    if (err) {
      console.error('Recorder prepare error:', err);
      return;
    }

    this.recorder!.record((err) => {
      if (err) console.error('Record error:', err);
    });

    // Get audio buffer periodically
    this.analysisInterval = setInterval(() => {
      // TODO: Access audio buffer and run autocorrelation
      // This requires native module extension
    }, 50);
  });
}
```

### Step 4: Implement FFT or Autocorrelation

You'll need to either:

**Option A**: Use a library like `react-native-fft` for frequency analysis
```bash
npm install react-native-fft
```

**Option B**: Implement autocorrelation in JavaScript (slower but works)
- Copy the autocorrelation algorithm from the web implementation
- Apply it to the audio buffer from the recorder

### Step 5: Build and Test

```bash
# For Android
npx expo run:android

# For iOS
npx expo run:ios
```

## Alternative: Use Existing Library

Instead of implementing from scratch, consider:

```bash
npm install react-native-pitch-detector
```

Then update `PitchDetectionService.ts` to use it on mobile.

## File Structure After Ejection

```
services/audio/
├── PitchDetectionService.ts       # Main service (platform-agnostic)
├── PitchDetectionService.web.ts   # Web implementation (current)
├── PitchDetectionService.native.ts # Native implementation (to be completed)
└── README.md                       # This guide
```

## Testing Checklist

After implementing native audio:

- [ ] Test on Android device
- [ ] Test on iOS device
- [ ] Verify accuracy with guitar tuner app
- [ ] Test with different note ranges (E2-E4)
- [ ] Test with quiet playing
- [ ] Test with loud playing
- [ ] Check battery usage
- [ ] Verify no memory leaks

## Troubleshooting

### Android: Permission Denied
Add to `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
```

### iOS: Microphone Not Working
Add to `ios/YourApp/Info.plist`:
```xml
<key>NSMicrophoneUsageDescription</key>
<string>We need microphone access for the guitar tuner</string>
```

### Build Errors
```bash
# Clean and rebuild
cd android && ./gradlew clean && cd ..
cd ios && pod install && cd ..
```

## Resources

- [React Native Audio Toolkit](https://github.com/react-native-audio-toolkit/react-native-audio-toolkit)
- [Autocorrelation Algorithm](https://en.wikipedia.org/wiki/Autocorrelation)
- [Expo Prebuild Docs](https://docs.expo.dev/workflow/prebuild/)

## Questions?

If you need help with ejection, refer to:
- Expo documentation
- React Native documentation
- Or hire a React Native developer familiar with native modules
