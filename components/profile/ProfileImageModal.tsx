/**
 * Profile Image Modal
 * 
 * Full-screen modal to view profile picture with option to remove
 */

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { Modal, Image as RNImage, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ProfileImageModalProps {
  visible: boolean;
  imageUrl: string | undefined;
  onClose: () => void;
  onRemove?: () => void;
}

export function ProfileImageModal({ visible, imageUrl, onClose, onRemove }: ProfileImageModalProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  if (!imageUrl) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        {/* Close Button */}
        <TouchableOpacity
          style={[styles.closeButton, { backgroundColor: colors.background }]}
          onPress={onClose}
          activeOpacity={0.7}
        >
          <IconSymbol name="xmark" size={24} color={colors.text} />
        </TouchableOpacity>

        {/* Remove Button */}
        {onRemove && (
          <TouchableOpacity
            style={[styles.removeButton, { backgroundColor: colors.error }]}
            onPress={onRemove}
            activeOpacity={0.7}
          >
            <IconSymbol name="trash" size={20} color={colors.background} />
            <Text style={[styles.removeButtonText, { color: colors.background }]}>
              Remove
            </Text>
          </TouchableOpacity>
        )}

        {/* Full Size Image */}
        <TouchableOpacity
          style={styles.imageContainer}
          activeOpacity={1}
          onPress={onClose}
        >
          <RNImage
            source={{ uri: imageUrl }}
            style={styles.fullImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  removeButton: {
    position: 'absolute',
    bottom: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    zIndex: 10,
  },
  removeButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '90%',
    height: '90%',
  },
});
