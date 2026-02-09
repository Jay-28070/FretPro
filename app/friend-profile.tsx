/**
 * Friend Profile Screen
 * 
 * View a friend's profile with their stats and option to remove friend.
 */

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ProfileSkeleton } from '@/components/ui/skeleton';
import { showToast } from '@/components/ui/toast';
import { db } from '@/config/firebase';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { deleteDoc, doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, Platform, Image as RNImage, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface FriendProfile {
  userId: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  avatarUrl?: string;
  stats: {
    totalPoints: number;
    totalSessions: number;
    totalNotesCorrect: number;
    averageAccuracy: number;
    longestStreak: number;
    practiceTime: number;
  };
}

export default function FriendProfileScreen() {
  const { colorScheme } = useTheme();
  const { user } = useAuth();
  const colors = Colors[colorScheme];
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const friendId = params.friendId as string;

  const [profile, setProfile] = useState<FriendProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [friendshipId, setFriendshipId] = useState<string | null>(null);

  useEffect(() => {
    loadFriendProfile();
  }, [friendId]);

  const loadFriendProfile = async () => {
    if (!user || !friendId) {
      setLoading(false);
      return;
    }

    try {
      // Load friend's profile
      const friendDoc = await getDoc(doc(db, 'users', friendId));

      if (friendDoc.exists()) {
        const data = friendDoc.data();
        setProfile({
          userId: friendId,
          firstName: data.firstName || 'User',
          lastName: data.lastName || '',
          username: data.username || data.email?.split('@')[0] || 'user',
          email: data.email || '',
          avatarUrl: data.avatarUrl || undefined,
          stats: data.stats || {
            totalPoints: 0,
            totalSessions: 0,
            totalNotesCorrect: 0,
            averageAccuracy: 0,
            longestStreak: 0,
            practiceTime: 0,
          }
        });
      }

      // Find the friendship document ID
      const friendshipDocId = [user.uid, friendId].sort().join('_');
      setFriendshipId(friendshipDocId);

    } catch (error) {
      console.error('Error loading friend profile:', error);
      showToast('Failed to load friend profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFriend = () => {
    if (Platform.OS === 'web') {
      if (window.confirm(`Remove ${profile?.firstName} ${profile?.lastName} from friends?`)) {
        removeFriend();
      }
    } else {
      Alert.alert(
        'Remove Friend',
        `Remove ${profile?.firstName} ${profile?.lastName} from friends?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: removeFriend,
          },
        ]
      );
    }
  };

  const removeFriend = async () => {
    if (!friendshipId) return;

    try {
      await deleteDoc(doc(db, 'friends', friendshipId));
      showToast('Friend removed', 'success');
      router.back();
    } catch (error) {
      console.error('Error removing friend:', error);
      showToast('Failed to remove friend', 'error');
    }
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!profile) {
    return (
      <SafeAreaView style={[styles.container, styles.centered, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          Friend not found
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: profile.username,
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />

      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['left', 'right', 'bottom']}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Header */}
          <View style={[styles.header, { backgroundColor: colors.backgroundSecondary }]}>
            {profile.avatarUrl ? (
              <RNImage 
                source={{ uri: profile.avatarUrl }} 
                style={styles.avatarImage}
              />
            ) : (
              <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                <Text style={[styles.avatarText, { color: colors.background }]}>
                  {profile.firstName.charAt(0).toUpperCase()}
                  {profile.lastName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <Text style={[styles.name, { color: colors.text }]}>
              {profile.firstName} {profile.lastName}
            </Text>
            <Text style={[styles.username, { color: colors.textSecondary }]}>
              @{profile.username}
            </Text>
          </View>

          {/* Stats Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Practice Stats
            </Text>

            <View style={[styles.statsGrid, { backgroundColor: colors.backgroundSecondary }]}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  {profile.stats.totalSessions}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Sessions
                </Text>
              </View>

              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.success }]}>
                  {profile.stats.averageAccuracy}%
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Accuracy
                </Text>
              </View>

              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.warning }]}>
                  {profile.stats.totalNotesCorrect}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Notes Correct
                </Text>
              </View>

              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  {profile.stats.longestStreak}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Best Streak
                </Text>
              </View>
            </View>
          </View>

          {/* Practice Time */}
          {profile.stats.practiceTime > 0 && (
            <View style={[styles.timeCard, { backgroundColor: colors.backgroundSecondary }]}>
              <IconSymbol name="clock.fill" size={24} color={colors.primary} />
              <View style={styles.timeInfo}>
                <Text style={[styles.timeValue, { color: colors.text }]}>
                  {Math.floor(profile.stats.practiceTime / 60)} minutes
                </Text>
                <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>
                  Total Practice Time
                </Text>
              </View>
            </View>
          )}

          {/* No Practice Message */}
          {profile.stats.totalSessions === 0 && (
            <View style={[styles.noPracticeCard, { backgroundColor: colors.backgroundSecondary }]}>
              <Text style={[styles.noPracticeText, { color: colors.textSecondary }]}>
                {profile.firstName} hasn't started practicing yet
              </Text>
            </View>
          )}

          {/* Remove Friend Button */}
          <TouchableOpacity
            style={[styles.removeButton, { borderColor: colors.error }]}
            onPress={handleRemoveFriend}
          >
            <IconSymbol name="person.fill.xmark" size={20} color={colors.error} />
            <Text style={[styles.removeButtonText, { color: colors.error }]}>
              Remove Friend
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </>
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
  header: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    borderRadius: 12,
    gap: 16,
  },
  statItem: {
    width: '45%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  timeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 16,
  },
  timeInfo: {
    flex: 1,
  },
  timeValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  noPracticeCard: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  noPracticeText: {
    fontSize: 14,
    textAlign: 'center',
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
  },
  removeButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
