/**
 * Profile Screen
 * 
 * Main dashboard showing user profile, navigation cards, and practice summary.
 * Loads real user data from Firestore.
 */

import { LevelDisplay } from '@/components/profile/LevelDisplay';
import { NavigationCard } from '@/components/profile/NavigationCard';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileImageModal } from '@/components/profile/ProfileImageModal';
import { StatsSummary } from '@/components/profile/StatsSummary';
import { ProfileSkeleton } from '@/components/ui/skeleton';
import { showToast } from '@/components/ui/toast';
import { db } from '@/config/firebase';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { progressionService, type PlayerProgression } from '@/services/progression/ProgressionService';
import { profileImageService } from '@/services/storage/ProfileImageService';
import { useFocusEffect, useRouter } from 'expo-router';
import { collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { ActionSheetIOS, Alert, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface UserProfile {
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

export default function ProfileScreen() {
  const { colorScheme } = useTheme();
  const { user } = useAuth();
  const colors = Colors[colorScheme];
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [friendCount, setFriendCount] = useState(0);
  const [progression, setProgression] = useState<PlayerProgression | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  // Load user profile from Firestore
  const loadProfile = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));

      if (userDoc.exists()) {
        const data = userDoc.data();
        setProfile({
          firstName: data.firstName || 'User',
          lastName: data.lastName || '',
          username: data.username || user.email?.split('@')[0] || 'user',
          email: data.email || user.email || '',
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
      } else {
        setProfile({
          firstName: user.displayName?.split(' ')[0] || 'User',
          lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
          username: user.email?.split('@')[0] || 'user',
          email: user.email || '',
          avatarUrl: undefined,
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

      // Load pending friend requests count
      const allRequestsSnapshot = await getDocs(
        query(collection(db, 'friends'), where('status', '==', 'pending'))
      );

      let pendingCount = 0;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      allRequestsSnapshot.docs.forEach((docSnapshot: any) => {
        const data = docSnapshot.data();
        // Count requests where current user is the RECEIVER (not the sender)
        const isPartOfFriendship = data.user1 === user.uid || data.user2 === user.uid;
        const isReceiver = data.requestedBy !== user.uid;
        
        if (isPartOfFriendship && isReceiver) {
          pendingCount++;
        }
      });

      setPendingRequestsCount(pendingCount);

      // Load friend count (accepted friendships)
      const friendsSnapshot = await getDocs(
        query(collection(db, 'friends'), where('status', '==', 'accepted'))
      );

      let acceptedFriendsCount = 0;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      friendsSnapshot.docs.forEach((docSnapshot: any) => {
        const data = docSnapshot.data();
        // Count friendships where current user is part of
        if (data.user1 === user.uid || data.user2 === user.uid) {
          acceptedFriendsCount++;
        }
      });

      setFriendCount(acceptedFriendsCount);

      // Load player progression
      if (user) {
        const prog = await progressionService.getProgression(user.uid);
        setProgression(prog);
      }
    } catch (error: any) {
      setProfile({
        firstName: user.displayName?.split(' ')[0] || 'User',
        lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
        username: user.email?.split('@')[0] || 'user',
        email: user.email || '',
        avatarUrl: undefined,
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
  }, [user]);

  // Load profile on mount
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Refresh profile when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  const handleSettingsPress = () => {
    router.push('/settings');
  };

  const handleFriendsPress = () => {
    router.push('/friends');
  };

  const handleViewAvatar = () => {
    console.log('[Profile] View avatar clicked');
    setShowImageModal(true);
  };

  const handleRemoveAvatar = async () => {
    if (!user) return;

    try {
      setShowImageModal(false);
      
      // Confirm removal
      if (Platform.OS === 'web') {
        if (!window.confirm('Remove profile picture?')) return;
      } else {
        Alert.alert(
          'Remove Profile Picture',
          'Are you sure you want to remove your profile picture?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Remove',
              style: 'destructive',
              onPress: async () => {
                await removeAvatarFromFirestore();
              },
            },
          ]
        );
        return;
      }

      await removeAvatarFromFirestore();
    } catch (error) {
      console.error('[Profile] Error removing avatar:', error);
      showToast('Failed to remove profile picture', 'error');
    }
  };

  const removeAvatarFromFirestore = async () => {
    if (!user) return;

    try {
      // Remove from Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        avatarUrl: null,
      });

      // Update local state
      setProfile(prev => prev ? { ...prev, avatarUrl: undefined } : null);
      showToast('Profile picture removed', 'success');
    } catch (error) {
      throw error;
    }
  };

  const handleEditAvatar = () => {
    console.log('[Profile] Edit avatar clicked, Platform:', Platform.OS);
    
    if (Platform.OS === 'web') {
      // Web - Directly open file picker
      handleChoosePhoto();
    } else if (Platform.OS === 'ios') {
      // iOS Action Sheet
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Library'],
          cancelButtonIndex: 0,
        },
        async (buttonIndex) => {
          if (buttonIndex === 1) {
            await handleTakePhoto();
          } else if (buttonIndex === 2) {
            await handleChoosePhoto();
          }
        }
      );
    } else {
      // Android Alert
      Alert.alert(
        'Change Profile Picture',
        'Choose an option',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Take Photo', onPress: handleTakePhoto },
          { text: 'Choose from Library', onPress: handleChoosePhoto },
        ]
      );
    }
  };

  const handleTakePhoto = async () => {
    if (!user) return;

    try {
      showToast('Opening camera...', 'info');
      const downloadURL = await profileImageService.takePhotoAndUpload(user.uid);
      
      // Update Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        avatarUrl: downloadURL,
      });

      // Update local state
      setProfile(prev => prev ? { ...prev, avatarUrl: downloadURL } : null);
      showToast('Profile picture updated!', 'success');
    } catch (error: any) {
      console.error('[Profile] Error taking photo:', error);
      if (error.message !== 'No photo taken') {
        showToast('Failed to update profile picture', 'error');
      }
    }
  };

  const handleChoosePhoto = async () => {
    if (!user) return;

    try {
      showToast('Opening gallery...', 'info');
      const base64Image = await profileImageService.pickAndUploadImage(user.uid);
      
      console.log('[Profile] Image converted to base64, length:', base64Image.length);
      
      // Update Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        avatarUrl: base64Image,
      });

      console.log('[Profile] Firestore updated with avatarUrl');

      // Update local state
      setProfile(prev => prev ? { ...prev, avatarUrl: base64Image } : null);
      showToast('Profile picture updated!', 'success');
    } catch (error: any) {
      console.error('[Profile] Error choosing photo:', error);
      if (error.message !== 'No image selected') {
        showToast('Failed to update profile picture', 'error');
      }
    }
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!profile) {
    return (
      <SafeAreaView style={[styles.container, styles.centered, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          Failed to load profile
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <ProfileHeader
          username={`${profile.firstName} ${profile.lastName}`.trim() || profile.username}
          friendCount={friendCount}
          pendingRequestsCount={pendingRequestsCount}
          avatarUrl={profile.avatarUrl}
          onEditAvatar={handleEditAvatar}
          onViewAvatar={handleViewAvatar}
        />

        {/* Profile Image Modal */}
        <ProfileImageModal
          visible={showImageModal}
          imageUrl={profile.avatarUrl}
          onClose={() => setShowImageModal(false)}
          onRemove={handleRemoveAvatar}
        />

        {/* Level Display */}
        {progression && (
          <View style={styles.section}>
            <LevelDisplay
              level={progression.level}
              xp={progression.xp}
              xpToNextLevel={progression.xpToNextLevel}
              xpProgress={progression.xpProgress}
              title={progression.title}
            />
          </View>
        )}

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
            subtitle="Search, add, and compete"
            onPress={handleFriendsPress}
            iconColor={colors.primary}
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
    </SafeAreaView>
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
