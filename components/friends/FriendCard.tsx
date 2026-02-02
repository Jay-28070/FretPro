/**
 * Friend Card Component
 * 
 * Displays friend info with action buttons.
 */

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface FriendCardProps {
  username: string;
  fullName?: string;
  accuracy: number;
  isOnline: boolean;
}

export function FriendCard({ username, fullName, accuracy, isOnline }: FriendCardProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  const handleChallenge = () => {
    Alert.alert('Coming Soon', 'Challenges will be available in Phase 3');
  };

  const handleViewProfile = () => {
    Alert.alert('Coming Soon', 'Friend profiles will be available in Phase 3');
  };

  return (
    <TouchableOpacity
      style={[styles.card, { 
        backgroundColor: colors.backgroundSecondary,
        borderColor: colors.border,
      }]}
      onPress={handleViewProfile}
      activeOpacity={0.7}
    >
      <View style={styles.leftSection}>
        {/* Avatar */}
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={[styles.avatarText, { color: colors.background }]}>
            {username.charAt(0).toUpperCase()}
          </Text>
          {isOnline && (
            <View style={[styles.onlineIndicator, { 
              backgroundColor: colors.success,
              borderColor: colors.backgroundSecondary,
            }]} />
          )}
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={[styles.username, { color: colors.text }]}>{username}</Text>
          {fullName && (
            <Text style={[styles.fullName, { color: colors.textSecondary }]}>
              {fullName}
            </Text>
          )}
          <Text style={[styles.accuracy, { color: colors.textSecondary }]}>
            {accuracy}% accuracy
          </Text>
        </View>
      </View>

      {/* Challenge Button */}
      <TouchableOpacity
        style={[styles.challengeButton, { 
          backgroundColor: colors.primary,
        }]}
        onPress={handleChallenge}
      >
        <IconSymbol name="bolt.fill" size={16} color={colors.background} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    minHeight: 72,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  info: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  fullName: {
    fontSize: 13,
    marginBottom: 2,
  },
  accuracy: {
    fontSize: 13,
  },
  challengeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
