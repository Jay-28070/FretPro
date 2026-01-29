# FretPro

**Professional guitar practice companion built with Expo and React Native.**

Modern, minimal design for focused practice sessions with voice-guided commands.

---

## 🎯 Features

### Phase 1 (Current) ✅
- **Voice-Guided Practice:** TTS speaks commands like "Play G on the B string, fret 3"
- **Smart Command Generation:** Intelligent note/string/fret selection with anti-repetition
- **Session Tracking:** Real-time accuracy and progress statistics
- **Theme Support:** Working light/dark mode toggle
- **Auth-Aware Routing:** Prepared for Phase 3 authentication

### Phase 2 (Scaffolded) 🚧
- **Real-Time Pitch Detection:** YIN algorithm for accurate note recognition
- **Guitar Tuner:** Visual tuning feedback with string detection
- **Metronome:** Precise timing engine with BPM control

### Phase 3 (Planned) 📋
- **User Authentication:** Real login/register flow
- **Progress Tracking:** Historical performance analytics
- **Custom Exercises:** Personalized practice routines

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Expo CLI
- iOS Simulator or Android Emulator (or physical device with Expo Go)

### Installation

```bash
# Install dependencies
npm install

# Install required package (if PowerShell execution policy blocks npm)
# You'll need to install this manually:
npm install @react-native-async-storage/async-storage

# Start development server
npx expo start
```

### Run the App

- **iOS Simulator:** Press `i`
- **Android Emulator:** Press `a`
- **Physical Device:** Scan QR code with Expo Go app
- **Web Browser:** Press `w` (limited audio support)

---

## 📁 Project Structure

```
FretPro/
├── app/                          # Expo Router navigation
│   ├── (auth)/                   # Auth screens (login)
│   │   ├── _layout.tsx
│   │   └── login.tsx
│   ├── (tabs)/                   # Main app tabs
│   │   ├── _layout.tsx
│   │   ├── practice.tsx          # ✅ Main practice interface
│   │   ├── tuner.tsx             # 🚧 Tuner screen
│   │   └── profile.tsx           # ✅ Profile & settings
│   └── _layout.tsx               # Root layout with providers
├── services/                     # Business logic services
│   ├── audio/                    # Audio processing
│   │   ├── TTSService.ts         # ✅ Text-to-speech
│   │   ├── TunerService.ts       # 🚧 Tuner (scaffolded)
│   │   ├── PitchDetectionService.ts  # 🚧 Pitch detection (scaffolded)
│   │   └── MetronomeService.ts   # 🚧 Metronome (scaffolded)
│   └── practice/                 # Practice logic
│       └── CommandGenerator.ts   # ✅ Command generation
├── contexts/                     # React contexts
│   ├── ThemeContext.tsx          # ✅ Theme management
│   └── AuthContext.tsx           # ✅ Auth state (dummy)
├── components/                   # Reusable UI components
├── constants/                    # Theme and constants
│   └── theme.ts                  # ✅ Color system
└── hooks/                        # Custom React hooks
```

---

## 🏗️ Architecture

### Design Principles

1. **Expo-First:** Built on Expo's existing structure, not against it
2. **Service Pattern:** Business logic in singleton services
3. **Context for State:** Theme and auth managed via React Context
4. **Separation of Concerns:** UI, business logic, and data clearly separated
5. **Industry Standard:** No experimental patterns or over-engineering

### Key Patterns

**Services (Singleton)**
```typescript
// services/audio/TTSService.ts
export const ttsService = new TTSService();

// Usage in components
import { ttsService } from '@/services/audio/TTSService';
await ttsService.speak('Hello');
```

**Contexts (Global State)**
```typescript
// contexts/ThemeContext.tsx
export function ThemeProvider({ children }) { ... }
export function useTheme() { ... }

// Usage in components
const { colorScheme, setThemePreference } = useTheme();
```

**Auth-Aware Routing**
```typescript
// app/_layout.tsx
// Automatically redirects based on auth state
if (!isAuthenticated && !inAuthGroup) {
  router.replace('/(auth)/login');
}
```

---

## 🎨 Theme System

### Colors

Professional, minimal design optimized for both light and dark modes:

- **Primary:** `#00D9FF` (Cyan) - Main accent
- **Secondary:** `#FF6B9D` (Pink) - Secondary accent
- **Success:** `#00FF88` (Green) - Success states
- **Warning:** `#FFB800` (Amber) - Warnings
- **Error:** `#FF4757` (Red) - Errors

### Usage

```typescript
import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';

const { colorScheme } = useTheme();
const colors = Colors[colorScheme];

<View style={{ backgroundColor: colors.background }}>
  <Text style={{ color: colors.text }}>Hello</Text>
</View>
```

### Theme Toggle

Users can toggle theme in Profile tab:
- Light
- Dark
- System (follows device setting)

---

## 🎤 Audio Services

### TTS Service (Implemented)

```typescript
import { ttsService } from '@/services/audio/TTSService';

// Speak text
await ttsService.speak('Play G on the B string');

// Speak immediately (interrupts current speech)
await ttsService.speakNow('Correct!');

// Stop speaking
await ttsService.stop();

// Check status
if (ttsService.isSpeaking()) { ... }
```

### Pitch Detection (Scaffolded - Phase 2)

```typescript
import { pitchDetectionService } from '@/services/audio/PitchDetectionService';

// Initialize
await pitchDetectionService.initialize();

// Start listening
await pitchDetectionService.startListening();

// Stop listening
await pitchDetectionService.stopListening();
```

### Tuner Service (Scaffolded - Phase 2)

```typescript
import { tunerService } from '@/services/audio/TunerService';

// Start tuner for specific string
await tunerService.start('E2');

// Stop tuner
await tunerService.stop();

// Get state
const state = tunerService.getState();
```

### Metronome Service (Scaffolded - Phase 2)

```typescript
import { metronomeService } from '@/services/audio/MetronomeService';

// Start metronome
await metronomeService.start(120); // 120 BPM

// Stop metronome
await metronomeService.stop();

// Change tempo
metronomeService.setTempo(140);
```

---

## 🧪 Development

### Scripts

```bash
npm start          # Start Expo dev server
npm run ios        # Run on iOS simulator
npm run android    # Run on Android emulator
npm run web        # Run in web browser
npm run lint       # Run ESLint
npm run typecheck  # TypeScript type checking
npm run clean      # Clear cache and restart
```

### Testing on Real Device

**Audio features require real device testing!**

1. Install Expo Go on your phone
2. Run `npm start`
3. Scan QR code
4. Test TTS and permissions

---

## 🔮 Roadmap

### Phase 1: Foundation ✅ (Complete)
- [x] Project structure
- [x] TTS Service
- [x] Command Generator
- [x] Theme system
- [x] Auth-aware routing
- [x] Practice/Tuner/Profile tabs

### Phase 2: Audio Processing 🚧 (Next)
- [ ] Pitch Detection (expo-av + pitchfinder)
- [ ] Tuner implementation
- [ ] Metronome implementation
- [ ] Real-time feedback UI

### Phase 3: Enhancement 📋 (Future)
- [ ] Real authentication
- [ ] Progress tracking
- [ ] User profiles
- [ ] Custom exercises

---

## 🐛 Troubleshooting

### PowerShell Execution Policy

If you see "running scripts is disabled":

```powershell
# Run as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Or install packages manually in Command Prompt instead of PowerShell.

### TTS Not Working

- **iOS:** Check device volume and silent mode
- **Android:** Ensure TTS engine is installed
- **Both:** Check app permissions

### Build Errors

```bash
# Clear cache
npm run clean

# Reinstall dependencies
rm -rf node_modules
npm install
```

---

## 📖 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [Expo Speech](https://docs.expo.dev/versions/latest/sdk/speech/)
- [Expo Audio](https://docs.expo.dev/versions/latest/sdk/audio/)

---

## 📝 Notes

### Why This Structure?

- **Expo-First:** Respects Expo's conventions and file-based routing
- **Services:** Clean separation of business logic from UI
- **Contexts:** Standard React pattern for global state
- **Scaffolding:** Phase 2 services exist but aren't fully implemented
- **No Over-Engineering:** Simple, maintainable patterns

### Auth State (Dummy)

Currently `isAuthenticated` is hardcoded to `true` in `contexts/AuthContext.tsx`.

Change to `false` to test login screen routing.

Phase 3 will implement real authentication.

---

## 📄 License

MIT

---

**Built with care for musicians** 🎸
