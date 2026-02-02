/**
 * Settings Screen
 * 
 * App settings including theme, audio preferences, and account.
 */

import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Stack, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const { colorScheme, themePreference, setThemePreference } = useTheme();
  const { signOut } = useAuth();
  const colors = Colors[colorScheme];
  const router = useRouter();

  const handleThemeChange = async (preference: 'light' | 'dark' | 'system') => {
    await setThemePreference(preference);
  };

  const handleSignOut = () => {
    // Use native confirm for web compatibility
    const confirmed = window.confirm('Are you sure you want to sign out?');
    
    if (!confirmed) return;
    
    console.log('Force logout initiated');
    
    // Direct Firebase signout
    signOut().catch(console.error);
    
    // Immediate storage clear
    try {
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
        
        // Clear IndexedDB (Firebase uses this)
        indexedDB.databases().then(dbs => {
          dbs.forEach(db => indexedDB.deleteDatabase(db.name));
        });
      }
    } catch (e) {
      console.error('Storage clear error:', e);
    }
    
    // Force reload after short delay
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }, 500);
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Settings',
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />
      
      <ScrollView 
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
      >
        {/* Theme Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
          
          <View style={[styles.card, { 
            backgroundColor: colors.backgroundSecondary,
            borderColor: colors.border,
          }]}>
            <View style={styles.themeOptions}>
              <TouchableOpacity
                style={[
                  styles.themeButton,
                  { 
                    backgroundColor: themePreference === 'light' ? colors.primary : colors.backgroundTertiary,
                    borderColor: colors.border,
                  }
                ]}
                onPress={() => handleThemeChange('light')}
              >
                <Text style={[
                  styles.themeButtonText,
                  { color: themePreference === 'light' ? colors.background : colors.text }
                ]}>
                  Light
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.themeButton,
                  { 
                    backgroundColor: themePreference === 'dark' ? colors.primary : colors.backgroundTertiary,
                    borderColor: colors.border,
                  }
                ]}
                onPress={() => handleThemeChange('dark')}
              >
                <Text style={[
                  styles.themeButtonText,
                  { color: themePreference === 'dark' ? colors.background : colors.text }
                ]}>
                  Dark
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.themeButton,
                  { 
                    backgroundColor: themePreference === 'system' ? colors.primary : colors.backgroundTertiary,
                    borderColor: colors.border,
                  }
                ]}
                onPress={() => handleThemeChange('system')}
              >
                <Text style={[
                  styles.themeButtonText,
                  { color: themePreference === 'system' ? colors.background : colors.text }
                ]}>
                  System
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Audio Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Audio</Text>
          
          <View style={[styles.card, { 
            backgroundColor: colors.backgroundSecondary,
            borderColor: colors.border,
          }]}>
            <Text style={[styles.placeholder, { color: colors.textTertiary }]}>
              Audio preferences coming in Phase 2
            </Text>
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
          
          <TouchableOpacity
            style={[styles.card, styles.accountCard, { 
              backgroundColor: colors.backgroundSecondary,
              borderColor: colors.border,
            }]}
            onPress={() => router.push('/account-settings')}
          >
            <Text style={[styles.accountCardTitle, { color: colors.text }]}>
              Personal Information
            </Text>
            <Text style={[styles.accountCardSubtitle, { color: colors.textSecondary }]}>
              Update name and password
            </Text>
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
          
          <View style={[styles.card, { 
            backgroundColor: colors.backgroundSecondary,
            borderColor: colors.border,
          }]}>
            <Text style={[styles.aboutText, { color: colors.textSecondary }]}>
              FretPro v1.0.0
            </Text>
            <Text style={[styles.aboutText, { color: colors.textSecondary }]}>
              Phase 1: TTS + Commands ✓
            </Text>
          </View>
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          style={[styles.signOutButton, { borderColor: colors.error }]}
          onPress={handleSignOut}
        >
          <Text style={[styles.signOutText, { color: colors.error }]}>
            Sign Out
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  themeOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  themeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  themeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  placeholder: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 8,
  },
  aboutText: {
    fontSize: 14,
    marginBottom: 4,
  },
  accountCard: {
    paddingVertical: 20,
  },
  accountCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  accountCardSubtitle: {
    fontSize: 14,
  },
  signOutButton: {
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    marginTop: 8,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
