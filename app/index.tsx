/**
 * Root Index
 * 
 * Redirects to appropriate route based on auth state.
 * This file is required by Expo Router as the entry point.
 */

import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  console.log('Index - Auth state:', { isAuthenticated, isLoading });

  // Show loading while checking auth
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Redirect based on auth state
  if (isAuthenticated) {
    console.log('Index - Redirecting to practice');
    return <Redirect href="/(tabs)/practice" />;
  }

  console.log('Index - Redirecting to login');
  return <Redirect href="/(auth)/login" />;
}
