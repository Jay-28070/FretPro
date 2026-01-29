/**
 * Firebase Configuration
 * 
 * Initializes Firebase with environment variables.
 * Config values are safe to expose - security is enforced by Firestore rules.
 * 
 * Why this is secure:
 * - apiKey is a public identifier, not a secret
 * - Access control is handled by Firebase Auth + Firestore Rules
 * - Users can only access data they're authorized for
 */

import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Validate config
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  throw new Error(
    'Firebase config is missing. Please check your .env file and ensure all EXPO_PUBLIC_FIREBASE_* variables are set.'
  );
}

// Initialize Firebase (only once)
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Auth
// Firebase automatically handles persistence in React Native
const auth = getAuth(app);

// Initialize Firestore
const db = getFirestore(app);

export { app, auth, db };
