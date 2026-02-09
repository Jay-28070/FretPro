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
import { Image as RNImage, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ProfileHeaderProps {
  username: string;
  friendCount: number;
  pendingRequestsCount?: number;
  avatarUrl?: string;
  onEditAvatar?: () => void;
  onViewAvatar?: () => void;
}

export function ProfileHeader({ username, friendCount, pendingRequestsCount = 0, avatarUrl, onEditAvatar, onViewAvatar }: ProfileHeaderProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const router = useRouter();

  const handleFriendsPress = () => {
    router.push('/friends');
  };

  const handleAvatarPress = () => {
    console.log('[ProfileHeader] Avatar pressed, avatarUrl:', avatarUrl);
    console.log('[ProfileHeader] onViewAvatar:', !!onViewAvatar, 'onEditAvatar:', !!onEditAvatar);
    
    if (avatarUrl && onViewAvatar) {
      // If has image, view it
      console.log('[ProfileHeader] Calling onViewAvatar');
      onViewAvatar();
    } else if (onEditAvatar) {
      // If no image, upload one
      console.log('[ProfileHeader] Calling onEditAvatar');
      onEditAvatar();
    }
  };

  return (
    <View style={styles.container}>
      {/* Avatar with Edit Button */}
      <View style={styles.avatarContainer}>
        <TouchableOpacity
          onPress={handleAvatarPress}
          activeOpacity={0.7}
        >
          {avatarUrl ? (
            <RNImage 
              source={{ uri: avatarUrl }} 
              style={styles.avatarImage}
            />
          ) : (
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={[styles.avatarText, { color: colors.background }]}>
                {username.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        
        {/* Edit Button - Only show if has image */}
        {onEditAvatar && avatarUrl && (
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: colors.primary }]}
            onPress={onEditAvatar}
            activeOpacity={0.7}
          >
            <IconSymbol name="camera.fill" size={16} color={colors.background} />
          </TouchableOpacity>
        )}
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
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
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
