/**
 * Login Screen (Placeholder)
 * 
 * Phase 3 will implement real authentication.
 * For now, just a simple screen to demonstrate auth routing.
 */

import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const { signIn, isLoading } = useAuth();
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.logo, { color: colors.primary }]}>FretPro</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Guitar Practice Companion
      </Text>

      <View style={styles.content}>
        <Text style={[styles.message, { color: colors.text }]}>
          Authentication will be implemented in Phase 3
        </Text>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={signIn}
          disabled={isLoading}
        >
          <Text style={[styles.buttonText, { color: colors.background }]}>
            {isLoading ? 'Loading...' : 'Continue to App'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 60,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    gap: 24,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
  },
});
