/**
 * Profile Screen
 * 
 * User profile with stats, achievements, and settings.
 * Phase 1: Theme toggle and basic info
 * Phase 3: Full stats, leaderboards, friends, achievements
 */

import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const { colorScheme, themePreference, setThemePreference } = useTheme();
  const { signOut } = useAuth();
  const colors = Colors[colorScheme];

  // Mock data - Phase 3 will load from backend
  const mockStats = {
    totalPoints: 0,
    rank: '--',
    sessionsCompleted: 0,
    practiceTime: '0h 0m',
    averageAccuracy: 0,
    longestStreak: 0,
  };

  const handleThemeChange = async (preference: 'light' | 'dark' | 'system') => {
    await setThemePreference(preference);
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ]
    );
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={[styles.avatarText, { color: colors.background }]}>U</Text>
        </View>
        <Text style={[styles.username, { color: colors.text }]}>Username</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Phase 3: Real profile data
        </Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { 
          backgroundColor: colors.backgroundSecondary,
          borderColor: colors.border,
        }]}>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {mockStats.totalPoints.toLocaleString()}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Total Points
          </Text>
        </View>

        <View style={[styles.statCard, { 
          backgroundColor: colors.backgroundSecondary,
          borderColor: colors.border,
        }]}>
          <Text style={[styles.statValue, { color: colors.text }]}>
            #{mockStats.rank}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Global Rank
          </Text>
        </View>

        <View style={[styles.statCard, { 
          backgroundColor: colors.backgroundSecondary,
          borderColor: colors.border,
        }]}>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {mockStats.sessionsCompleted}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Sessions
          </Text>
        </View>

        <View style={[styles.statCard, { 
          backgroundColor: colors.backgroundSecondary,
          borderColor: colors.border,
        }]}>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {mockStats.practiceTime}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Practice Time
          </Text>
        </View>

        <View style={[styles.statCard, { 
          backgroundColor: colors.backgroundSecondary,
          borderColor: colors.border,
        }]}>
          <Text style={[styles.statValue, { color: colors.success }]}>
            {mockStats.averageAccuracy}%
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Avg Accuracy
          </Text>
        </View>

        <View style={[styles.statCard, { 
          backgroundColor: colors.backgroundSecondary,
          borderColor: colors.border,
        }]}>
          <Text style={[styles.statValue, { color: colors.warning }]}>
            {mockStats.longestStreak}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Best Streak
          </Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
        
        <TouchableOpacity 
          style={[styles.actionButton, { 
            backgroundColor: colors.backgroundSecondary,
            borderColor: colors.border,
          }]}
        >
          <Text style={[styles.actionIcon, { color: colors.primary }]}>🏆</Text>
          <View style={styles.actionContent}>
            <Text style={[styles.actionTitle, { color: colors.text }]}>Leaderboards</Text>
            <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>
              Coming in Phase 3
            </Text>
          </View>
          <Text style={[styles.actionChevron, { color: colors.textTertiary }]}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, { 
            backgroundColor: colors.backgroundSecondary,
            borderColor: colors.border,
          }]}
        >
          <Text style={[styles.actionIcon, { color: colors.secondary }]}>👥</Text>
          <View style={styles.actionContent}>
            <Text style={[styles.actionTitle, { color: colors.text }]}>Friends</Text>
            <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>
              Coming in Phase 3
            </Text>
          </View>
          <Text style={[styles.actionChevron, { color: colors.textTertiary }]}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, { 
            backgroundColor: colors.backgroundSecondary,
            borderColor: colors.border,
          }]}
        >
          <Text style={[styles.actionIcon, { color: colors.success }]}>🎯</Text>
          <View style={styles.actionContent}>
            <Text style={[styles.actionTitle, { color: colors.text }]}>Achievements</Text>
            <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>
              Coming in Phase 3
            </Text>
          </View>
          <Text style={[styles.actionChevron, { color: colors.textTertiary }]}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, { 
            backgroundColor: colors.backgroundSecondary,
            borderColor: colors.border,
          }]}
        >
          <Text style={[styles.actionIcon, { color: colors.warning }]}>⚔️</Text>
          <View style={styles.actionContent}>
            <Text style={[styles.actionTitle, { color: colors.text }]}>Challenges</Text>
            <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>
              Coming in Phase 3
            </Text>
          </View>
          <Text style={[styles.actionChevron, { color: colors.textTertiary }]}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Settings</Text>
        
        {/* Theme Toggle */}
        <View style={[styles.settingCard, { 
          backgroundColor: colors.backgroundSecondary,
          borderColor: colors.border,
        }]}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>Appearance</Text>
          
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

      {/* About */}
      <View style={[styles.section, styles.sectionLast]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
        
        <View style={[styles.aboutCard, { 
          backgroundColor: colors.backgroundSecondary,
          borderColor: colors.border,
        }]}>
          <Text style={[styles.aboutText, { color: colors.textSecondary }]}>
            FretPro v1.0.0
          </Text>
          <Text style={[styles.aboutText, { color: colors.textSecondary }]}>
            Phase 1: TTS + Commands ✓
          </Text>
          <Text style={[styles.aboutText, { color: colors.textSecondary }]}>
            Phase 2: Pitch Detection (Coming Soon)
          </Text>
          <Text style={[styles.aboutText, { color: colors.textSecondary }]}>
            Phase 3: Social + Scoring (Planned)
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
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
  },
  username: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    width: '31%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionLast: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  actionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 12,
  },
  actionChevron: {
    fontSize: 24,
    fontWeight: '300',
  },
  settingCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  themeOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  themeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  themeButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  aboutCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  aboutText: {
    fontSize: 13,
    lineHeight: 20,
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
