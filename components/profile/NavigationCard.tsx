/**
 * Navigation Card Component
 * 
 * Reusable card for navigation actions in profile.
 * Minimum 44px tap target for accessibility.
 */

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface NavigationCardProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  iconColor?: string;
}

export function NavigationCard({ icon, title, subtitle, onPress, iconColor }: NavigationCardProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  return (
    <TouchableOpacity
      style={[styles.card, { 
        backgroundColor: colors.backgroundSecondary,
        borderColor: colors.border,
      }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: colors.backgroundTertiary }]}>
        <IconSymbol 
          name={icon} 
          size={24} 
          color={iconColor || colors.primary}
        />
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>

      <IconSymbol 
        name="chevron.right" 
        size={20} 
        color={colors.textTertiary}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    minHeight: 72,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '400',
  },
});
