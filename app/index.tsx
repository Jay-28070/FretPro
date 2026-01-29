/**
 * Root Index
 * 
 * Redirects to appropriate route based on auth state.
 * This file is required by Expo Router as the entry point.
 */

import { useAuth } from '@/contexts/AuthContext';
import { Redirect } from 'expo-router';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show nothing while checking auth
  if (isLoading) {
    return null;
  }

  // Redirect based on auth state
  if (isAuthenticated) {
    return <Redirect href="/(tabs)/practice" />;
  }

  return <Redirect href="/(auth)/login" />;
}
