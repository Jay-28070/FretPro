/**
 * Profile Header Component
 * 
 * Displays user avatar, username, and friend count.
 * Friend count is tappable and navigates to Friends page.
 */

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ProfileHeaderProps {
  username: string;
  friendCount: number;
  pendingRequestsCount?: number;
  avatarUrl?: string;
}

export function ProfileHeader({ username, friendCount, pendingRequestsCount = 0, avatarUrl }: ProfileHeaderProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const router = useRouter();

  const handleFriendsPress = () => {
    router.push('/friends');
  };

  return (
    <View style={styles.container}>
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
        <Text style={[styles.avatarText, { color: colors.background }]}>
          {username.charAt(0).toUpperCase()}
        </Text>
      </View>

      {/* Username */}
      <Text style={[styles.username, { color: colors.text }]}>{username}</Text>

      {/* Friend Count - Tappable */}
      <TouchableOpacity 
        style={styles.friendCount}
        onPress={handleFriendsPress}
        activeOpacity={0.7}
      >
        <View style={styles.friendIconContainer}>
          <IconSymbol 
            name="person.2.fill" 
            size={16} 
            color={colors.textSecondary}
          />
          {pendingRequestsCount > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.error }]}>
              <Text style={[styles.badgeText, { color: colors.background }]}>
                {pendingRequestsCount > 9 ? '9+' : pendingRequestsCount}
              </Text>
            </View>
          )}
        </View>
        <Text style={[styles.friendCountText, { color: colors.textSecondary }]}>
          {friendCount} {friendCount === 1 ? 'Friend' : 'Friends'}
        </Text>
        {pendingRequestsCount > 0 && (
          <Text style={[styles.pendingText, { color: colors.error }]}>
            • {pendingRequestsCount} pending
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 24,
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
    marginBottom: 8,
  },
  friendCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  friendIconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  friendCountText: {
    fontSize: 15,
    fontWeight: '500',
  },
  pendingText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
