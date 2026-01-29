/**
 * Auth Layout
 * 
 * Layout for authentication screens (login, register).
 * Hidden when user is authenticated.
 */

import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
    </Stack>
  );
}
