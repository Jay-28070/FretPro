/**
 * Profile Image Service
 * 
 * Handles profile picture uploads to Firebase Storage
 */

import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

class ProfileImageService {
  /**
   * Request camera/gallery permissions
   */
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        return false;
      }
    }
    return true;
  }

  /**
   * Pick image from gallery
   */
  async pickImage(): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Permission to access gallery was denied');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Square crop
        quality: 0.7, // Compress to reduce file size
      });

      if (!result.canceled && result.assets[0]) {
        return result.assets[0].uri;
      }

      return null;
    } catch (error) {
      console.error('[ProfileImage] Error picking image:', error);
      throw error;
    }
  }

  /**
   * Take photo with camera
   */
  async takePhoto(): Promise<string | null> {
    try {
      // Request camera permission
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission to access camera was denied');
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1], // Square crop
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        return result.assets[0].uri;
      }

      return null;
    } catch (error) {
      console.error('[ProfileImage] Error taking photo:', error);
      throw error;
    }
  }

  /**
   * Upload image to Firestore as base64 (free alternative to Firebase Storage)
   */
  async uploadProfileImageBase64(imageUri: string): Promise<string> {
    try {
      // Convert image to base64
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          resolve(base64data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('[ProfileImage] Error converting to base64:', error);
      throw error;
    }
  }

  /**
   * Complete flow: Pick image and convert to base64
   */
  async pickAndConvertToBase64(): Promise<string> {
    const imageUri = await this.pickImage();
    if (!imageUri) {
      throw new Error('No image selected');
    }

    return await this.uploadProfileImageBase64(imageUri);
  }

  /**
   * Complete flow: Pick image and save as base64 (no Firebase Storage needed)
   */
  async pickAndUploadImage(userId: string): Promise<string> {
    const imageUri = await this.pickImage();
    if (!imageUri) {
      throw new Error('No image selected');
    }

    // Convert to base64 instead of uploading to Storage
    return await this.uploadProfileImageBase64(imageUri);
  }

  /**
   * Complete flow: Take photo and save as base64 (no Firebase Storage needed)
   */
  async takePhotoAndUpload(userId: string): Promise<string> {
    const imageUri = await this.takePhoto();
    if (!imageUri) {
      throw new Error('No photo taken');
    }

    // Convert to base64 instead of uploading to Storage
    return await this.uploadProfileImageBase64(imageUri);
  }
}

export const profileImageService = new ProfileImageService();
