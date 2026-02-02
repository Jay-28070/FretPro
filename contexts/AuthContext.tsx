/**
 * Auth Context
 * 
 * Manages authentication state using Firebase Auth.
 * Handles sign in, sign up, sign out, and Google Sign-In.
 * 
 * Security: Firebase Auth handles all authentication securely.
 * User data access is controlled by Firestore security rules.
 * 
 * Note: Google Sign-In uses signInWithPopup which works on web.
 * For native apps, this will need to be replaced with a native flow.
 */

import { auth, db } from '@/config/firebase';
import {
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signInWithPopup,
    User
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          firstName: 'User',
          lastName: '',
          email: userCredential.user.email,
          username: userCredential.user.email?.split('@')[0] || 'user',
          createdAt: new Date(),
          updatedAt: new Date(),
          stats: {
            totalPoints: 0,
            totalSessions: 0,
            totalNotesCorrect: 0,
            averageAccuracy: 0,
            longestStreak: 0,
            practiceTime: 0,
          }
        });
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    setIsLoading(true);
    try {
      // Create auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        firstName,
        lastName,
        email,
        username: email.split('@')[0], // Default username from email
        createdAt: new Date(),
        updatedAt: new Date(),
        stats: {
          totalPoints: 0,
          totalSessions: 0,
          totalNotesCorrect: 0,
          averageAccuracy: 0,
          longestStreak: 0,
          practiceTime: 0,
        }
      });
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw new Error(error.message || 'Failed to sign up');
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await firebaseSignOut(auth);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign out');
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if user document exists, create if not
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (!userDoc.exists()) {
        const displayName = result.user.displayName || '';
        const nameParts = displayName.split(' ');
        const firstName = nameParts[0] || 'User';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        await setDoc(doc(db, 'users', result.user.uid), {
          firstName,
          lastName,
          email: result.user.email,
          username: result.user.email?.split('@')[0] || 'user',
          avatar: result.user.photoURL,
          createdAt: new Date(),
          updatedAt: new Date(),
          stats: {
            totalPoints: 0,
            totalSessions: 0,
            totalNotesCorrect: 0,
            averageAccuracy: 0,
            longestStreak: 0,
            practiceTime: 0,
          }
        });
      }
    } catch (error: any) {
      console.error('Google sign in error:', error);
      throw new Error(error.message || 'Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user,
      isAuthenticated: !!user, 
      isLoading, 
      signIn, 
      signUp,
      signInWithGoogle,
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
