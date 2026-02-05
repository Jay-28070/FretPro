# FretPro 🎸

A comprehensive guitar learning app built with React Native and Expo. Practice fretboard recognition, ear training, rhythm, and more with real-time audio feedback.

## Features

### 🎯 Practice Modes
- **Ear Training**: Listen to notes and identify them on the fretboard
- **Note Recognition**: Find specific notes across the fretboard
- **Rhythm Master**: Metronome with hold-out game mode for internal tempo training
- **Tuner**: Real-time chromatic tuner with visual feedback (web only)

### 👥 Social Features
- **Friends System**: Search, add, and manage friends
- **Leaderboards**: Compete with friends on practice games
- **Profile Stats**: Track your progress and achievements
- **Friend Profiles**: View friends' stats and practice history

### 🎨 Customization
- **Dark/Light Themes**: Beautiful color schemes for any environment
- **Audio Settings**: Adjust metronome and game sounds
- **User Profiles**: Personalized avatars and usernames

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router (file-based routing)
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Audio**: Web Audio API (web), expo-av (mobile)
- **Language**: TypeScript
- **State Management**: React Context API

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **Expo CLI** - Will be installed with dependencies
- **Git** - [Download](https://git-scm.com/)

### For Mobile Development
- **Expo Go** app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))
- OR **Android Studio** / **Xcode** for emulators

## Installation

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd FretPro
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Set Up Firebase

The project is already configured with Firebase, but if you want to use your own Firebase project:

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable **Authentication** (Email/Password)
3. Create a **Firestore Database** (start in production mode)
4. Copy your Firebase config
5. Update `.env` file with your credentials:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Deploy Firestore Security Rules

```bash
# Install Firebase CLI if you haven't
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project (if not already done)
firebase init firestore

# Deploy security rules
firebase deploy --only firestore:rules
```

Or use the provided batch script (Windows):
```bash
deploy-rules.bat
```

### 5. Add Audio Files

The app requires audio files for the best experience:

#### Metronome Sounds (Required)
The metronome requires two WAV files in `assets/sounds/`:
- `click.wav` - Regular metronome click
- `accented_click.wav` - Accented beat (downbeat)

#### Musical Note Files (Optional but Recommended)
For the Ear Training game, add note files in `assets/sounds/notes/`:
- 36 WAV files covering 3 octaves (C3-B3, C4-B4, C5-B5)
- Named like: `C4.wav`, `Cs4.wav` (s = sharp), `D4.wav`, etc.
- See `assets/sounds/notes/README.md` for detailed instructions

**Quick options:**
- **Generate with Audacity**: Free tone generator (see notes README)
- **Download samples**: Freesound.org, Philharmonia Orchestra
- **Record your own**: Guitar, piano, or synthesizer

**Note**: The app works without note files (uses synthesized sounds on web), but local files provide much better quality on mobile.

## Running the App

### Development Server

```bash
npm start
# or
yarn start
```

This will start the Expo development server and show a QR code.

### Platform-Specific Commands

```bash
# Run on web browser
npm run web

# Run on Android (emulator or device)
npm run android

# Run on iOS (Mac only, emulator or device)
npm run ios

# Clear cache and restart
npm run clean
```

### Using Expo Go (Recommended for Quick Testing)

1. Install Expo Go on your phone
2. Run `npm start`
3. Scan the QR code with:
   - **iOS**: Camera app
   - **Android**: Expo Go app

## Project Structure

```
FretPro/
├── app/                          # Expo Router screens
│   ├── (auth)/                   # Authentication screens
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/                   # Main tab navigation
│   │   ├── index.tsx             # Home/Practice
│   │   ├── profile.tsx           # User profile
│   │   └── tuner.tsx             # Chromatic tuner
│   ├── practice/                 # Practice game screens
│   │   ├── ear-training.tsx
│   │   ├── note-recognition.tsx
│   │   └── metronome.tsx
│   ├── friends.tsx               # Friends management
│   ├── friend-profile.tsx        # View friend stats
│   ├── settings.tsx              # App settings
│   └── _layout.tsx               # Root layout
├── components/                   # Reusable components
│   ├── friends/                  # Friend-related components
│   ├── profile/                  # Profile components
│   └── ui/                       # UI primitives
├── services/                     # Business logic
│   ├── audio/                    # Audio services
│   │   ├── PitchDetectionService.ts
│   │   ├── TunerService.ts
│   │   ├── SoundGenerator.ts
│   │   └── TTSService.ts
│   └── practice/                 # Practice game logic
│       └── ScoreService.ts
├── contexts/                     # React contexts
│   ├── AuthContext.tsx           # Authentication state
│   └── ThemeContext.tsx          # Theme management
├── config/                       # Configuration
│   └── firebase.ts               # Firebase setup
├── constants/                    # App constants
│   └── theme.ts                  # Color schemes
├── assets/                       # Static assets
│   ├── images/
│   └── sounds/                   # Audio files
├── docs/                         # Documentation
├── firestore.rules               # Firestore security rules
├── .env                          # Environment variables
└── package.json
```

## Key Features Explained

### Tuner (Web Only)
The chromatic tuner uses Web Audio API for real-time pitch detection. It:
- Auto-detects notes and octaves
- Shows cents off from perfect pitch
- Displays visual tuning meter
- Supports low frequencies (down to 40Hz for bass)

**Note**: Mobile tuner requires native implementation (see `docs/NATIVE_AUDIO_GUIDE.md`)

### Metronome
Two modes available:
1. **Normal Metronome**: Simple click track with visual indicators
2. **Hold-Out Game**: Tests your internal tempo by going silent

Works on both web and mobile with local audio files.

### Practice Games
- **Ear Training**: Develops relative pitch recognition
- **Note Recognition**: Improves fretboard knowledge
- **Scoring System**: Tracks accuracy, streaks, and progress

### Friends System
- Search by name or username
- Send/accept friend requests
- View friend profiles and stats
- Compete on leaderboards

## Firebase Collections

The app uses the following Firestore collections:

- `users` - User profiles and stats
- `friends` - Friend relationships
- `challenges` - Practice challenges (future feature)
- `sessions` - Practice session data
- `gameScores` - Individual game scores
- `highScores` - Best scores per game/difficulty

See `firestore.rules` for security rules.

## Development

### Type Checking

```bash
npm run typecheck
```

### Linting

```bash
npm run lint
```

### Environment Variables

All Firebase config should be prefixed with `EXPO_PUBLIC_` to be accessible in the app.

## Troubleshooting

### "Missing or insufficient permissions" Error
- Make sure you've deployed Firestore security rules
- Run: `firebase deploy --only firestore:rules`

### Metronome Not Working on Mobile
- Ensure `click.wav` and `accented_click.wav` exist in `assets/sounds/`
- Check that files are properly formatted WAV files
- Try clearing cache: `npm run clean`

### Tuner Not Working
- **Web**: Allow microphone permissions in browser
- **Mobile**: Tuner requires native implementation (not yet available)

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npm run clean
```

## Platform Support

| Feature | Web | iOS | Android |
|---------|-----|-----|---------|
| Authentication | ✅ | ✅ | ✅ |
| Practice Games | ✅ | ✅ | ✅ |
| Metronome | ✅ | ✅ | ✅ |
| Friends System | ✅ | ✅ | ✅ |
| Tuner | ✅ | ⚠️ Placeholder | ⚠️ Placeholder |
| Pitch Detection | ✅ | ⚠️ Placeholder | ⚠️ Placeholder |

## Future Enhancements

- [ ] Native pitch detection for mobile tuner
- [ ] Practice challenges between friends
- [ ] More practice game modes
- [ ] Chord recognition
- [ ] Scale practice
- [ ] Progress analytics
- [ ] Practice reminders
- [ ] Achievement system

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Support

For issues or questions:
- Check existing issues in the repository
- Create a new issue with detailed description
- Include error messages and screenshots

## Acknowledgments

- Built with [Expo](https://expo.dev/)
- Audio processing with [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- Backend powered by [Firebase](https://firebase.google.com/)
- Icons from [SF Symbols](https://developer.apple.com/sf-symbols/)

---

**Happy Practicing! 🎸🎵**
