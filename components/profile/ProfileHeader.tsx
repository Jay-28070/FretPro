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
  avatarUrl?: string;
}

export function ProfileHeader({ username, friendCount, avatarUrl }: ProfileHeaderProps) {
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
        <IconSymbol 
          name="person.2.fill" 
          size={16} 
          color={colors.textSecondary}
        />
        <Text style={[styles.friendCountText, { color: colors.textSecondary }]}>
          {friendCount} {friendCount === 1 ? 'Friend' : 'Friends'}
        </Text>
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
  friendCountText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
