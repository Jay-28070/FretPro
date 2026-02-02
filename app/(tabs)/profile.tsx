/**
 * Profile Screen
 * 
 * Main dashboard showing user profile, navigation cards, and practice summary.
 * Loads real user data from Firestore.
 */

import { NavigationCard } from '@/components/profile/NavigationCard';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { StatsSummary } from '@/components/profile/StatsSummary';
import { ProfileSkeleton } from '@/components/ui/skeleton';
import { db } from '@/config/firebase';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

interface UserProfile {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  stats: {
    totalPoints: number;
    totalSessions: number;
    totalNotesCorrect: number;
    averageAccuracy: number;
    longestStreak: number;
    practiceTime: number;
  };
}

export default function ProfileScreen() {
  const { colorScheme } = useTheme();
  const { user } = useAuth();
  const colors = Colors[colorScheme];
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user profile from Firestore
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      console.log('📊 Loading profile for user:', user.uid);

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          console.log('✅ Profile loaded from Firestore:', data);
          console.log('📝 First Name:', data.firstName);
          console.log('📝 Last Name:', data.lastName);
          
          setProfile({
            firstName: data.firstName || 'User',
            lastName: data.lastName || '',
            username: data.username || user.email?.split('@')[0] || 'user',
            email: data.email || user.email || '',
            stats: data.stats || {
              totalPoints: 0,
              totalSessions: 0,
              totalNotesCorrect: 0,
              averageAccuracy: 0,
              longestStreak: 0,
              practiceTime: 0,
            }
          });
        } else {
          console.log('⚠️ User document not found, using defaults');
          console.log('👤 User displayName:', user.displayName);
          console.log('📧 User email:', user.email);
          
          setProfile({
            firstName: user.displayName?.split(' ')[0] || 'User',
            lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
            username: user.email?.split('@')[0] || 'user',
            email: user.email || '',
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
        console.error('❌ Firestore error:', error);
        console.log('Error code:', error.code);
        console.log('Error message:', error.message);
        
        // Use default profile from auth (works even without Firestore rules)
        setProfile({
          firstName: user.displayName?.split(' ')[0] || 'User',
          lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
          username: user.email?.split('@')[0] || 'user',
          email: user.email || '',
          stats: {
            totalPoints: 0,
            totalSessions: 0,
            totalNotesCorrect: 0,
            averageAccuracy: 0,
            longestStreak: 0,
            practiceTime: 0,
          }
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleSettingsPress = () => {
    router.push('/settings');
  };

  const handleFriendsPress = () => {
    router.push('/friends');
  };

  const handleHistoryPress = () => {
    Alert.alert('Coming Soon', 'Practice history will be available in Phase 3');
  };

  const handleAchievementsPress = () => {
    Alert.alert('Coming Soon', 'Achievements will be available in Phase 3');
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!profile) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          Failed to load profile
        </Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <ProfileHeader 
        username={`${profile.firstName} ${profile.lastName}`.trim() || profile.username}
        friendCount={0}
      />

      {/* Navigation Cards */}
      <View style={styles.section}>
        <NavigationCard
          icon="gearshape.fill"
          title="Settings"
          subtitle="Theme, audio, preferences"
          onPress={handleSettingsPress}
          iconColor={colors.textSecondary}
        />

        <NavigationCard
          icon="person.2.fill"
          title="Friends"
          subtitle="Coming soon"
          onPress={handleFriendsPress}
          iconColor={colors.primary}
        />

        <NavigationCard
          icon="chart.bar.fill"
          title="Practice History"
          subtitle="View past sessions"
          onPress={handleHistoryPress}
          iconColor={colors.success}
        />

        <NavigationCard
          icon="trophy.fill"
          title="Achievements"
          subtitle="Unlock milestones"
          onPress={handleAchievementsPress}
          iconColor={colors.warning}
        />
      </View>

      {/* Practice Summary - Only show if user has practiced */}
      {profile.stats.totalSessions > 0 && (
        <View style={styles.section}>
          <StatsSummary
            totalNotesCorrect={profile.stats.totalNotesCorrect}
            averageAccuracy={profile.stats.averageAccuracy}
            weakestString="N/A"
          />
        </View>
      )}

      {/* No practice yet message */}
      {profile.stats.totalSessions === 0 && (
        <View style={[styles.noPracticeCard, { 
          backgroundColor: colors.backgroundSecondary,
          borderColor: colors.border,
        }]}>
          <Text style={[styles.noPracticeTitle, { color: colors.text }]}>
            Start Practicing!
          </Text>
          <Text style={[styles.noPracticeText, { color: colors.textSecondary }]}>
            Head to the Practice tab to begin your guitar journey
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
  },
  noPracticeCard: {
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  noPracticeTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  noPracticeText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
