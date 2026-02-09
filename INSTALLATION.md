# Installation Instructions

## Required Package: expo-image-picker

The profile picture upload feature requires `expo-image-picker`. Install it with:

```bash
npx expo install expo-image-picker
```

## After Installation

1. Restart the development server:
```bash
npm run clean
npm start
```

2. On iOS, the app will automatically request camera and photo library permissions when needed.

3. On Android, permissions are handled automatically by Expo.

4. On Web, the browser's file picker will be used (no special permissions needed).

## Firebase Storage Setup

Make sure Firebase Storage is enabled in your Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Storage in the left menu
4. Click "Get Started"
5. Choose production mode or test mode
6. Select a location
7. Click "Done"

## Storage Security Rules

The default rules allow authenticated users to upload to their own profile folder. If you need to customize, update your Storage rules in Firebase Console:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /profile-images/{userId}.jpg {
      // Allow users to read any profile image
      allow read: if true;
      
      // Allow users to write only their own profile image
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Testing

1. Open the app
2. Go to Profile tab
3. Tap the camera icon on your avatar
4. Choose "Take Photo" or "Choose from Library"
5. Crop and confirm
6. Image will upload and display immediately

## Troubleshooting

**"Cannot find module 'expo-image-picker'"**
- Run: `npx expo install expo-image-picker`
- Restart dev server

**"Permission denied" on mobile**
- Check app permissions in device settings
- Grant camera and photo library access

**Upload fails**
- Check Firebase Storage is enabled
- Check internet connection
- Check Firebase Storage rules

**Image doesn't display**
- Check browser console for errors
- Verify image URL in Firestore
- Check Firebase Storage CORS settings
