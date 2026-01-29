/**
 * Profile Screen
 * 
 * Main dashboard showing user profile, navigation cards, and practice summary.
 * Modern, clean design with proper spacing and hierarchy.
 */

import { NavigationCard } from '@/components/profile/NavigationCard';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { StatsSummary } from '@/components/profile/StatsSummary';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

export default function ProfileScreen() {
  const { colorScheme } = useTheme();
  const { signOut } = useAuth();
  const colors = Colors[colorScheme];
  const router = useRouter();

  // Mock data - Phase 3 will load from backend
  const mockProfile = {
    username: 'GuitarPro',
    friendCount: 12,
    totalNotesCorrect: 1247,
    averageAccuracy: 87,
    weakestString: 'B',
  };

  const handleSettingsPress = () => {
    router.push('/settings');
  };

  const handleFriendsPress = () => {
    router.push('/friends');
  };

  const handleHistoryPress = () => {
    // TODO: Navigate to practice history
    Alert.alert('Coming Soon', 'Practice history will be available in Phase 3');
  };

  const handleAchievementsPress = () => {
    // TODO: Navigate to achievements
    Alert.alert('Coming Soon', 'Achievements will be available in Phase 3');
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <ProfileHeader 
        username={mockProfile.username}
        friendCount={mockProfile.friendCount}
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
          subtitle={`${mockProfile.friendCount} friends`}
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

      {/* Practice Summary */}
      <View style={styles.section}>
        <StatsSummary
          totalNotesCorrect={mockProfile.totalNotesCorrect}
          averageAccuracy={mockProfile.averageAccuracy}
          weakestString={mockProfile.weakestString}
        />
      </View>
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
  section: {
    marginBottom: 24,
  },
});
