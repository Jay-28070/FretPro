/**
 * Account Settings Screen
 * 
 * Clean UI with expandable forms for updating profile and password.
 */

import { IconSymbol } from '@/components/ui/icon-symbol';
import { showToast } from '@/components/ui/toast';
import { db } from '@/config/firebase';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Stack } from 'expo-router';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function AccountSettingsScreen() {
  const { colorScheme } = useTheme();
  const { user } = useAuth();
  const colors = Colors[colorScheme];

  const [showProfileForm, setShowProfileForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [currentName, setCurrentName] = useState({ firstName: '', lastName: '' });
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setCurrentName({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
          });
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!user) return;

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();

    if (!trimmedFirstName || !trimmedLastName) {
      showToast('Please enter both first and last name', 'error');
      return;
    }

    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        updatedAt: new Date(),
      });

      setCurrentName({ firstName: trimmedFirstName, lastName: trimmedLastName });
      showToast('Profile updated successfully', 'success');
      setFirstName('');
      setLastName('');
      setShowProfileForm(false);
    } catch (error: any) {
      showToast(error.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user || !user.email) return;

    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('Please fill in all password fields', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    if (currentPassword === newPassword) {
      showToast('New password must be different', 'error');
      return;
    }

    setLoading(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      showToast('Password changed successfully', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
    } catch (error: any) {
      if (error.code === 'auth/wrong-password') {
        showToast('Current password is incorrect', 'error');
      } else {
        showToast(error.message || 'Failed to change password', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Account Settings',
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          style={[styles.container, { backgroundColor: colors.background }]}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {currentName.firstName && (
            <View style={[styles.infoCard, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Current Name</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {currentName.firstName} {currentName.lastName}
              </Text>
            </View>
          )}

          {!showProfileForm ? (
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}
              onPress={() => setShowProfileForm(true)}
            >
              <View style={styles.actionCardLeft}>
                <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                  <IconSymbol name="person.fill" size={24} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.actionTitle, { color: colors.text }]}>Update Name</Text>
                  <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>
                    Change your first and last name
                  </Text>
                </View>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ) : (
            <View style={[styles.formCard, { backgroundColor: colors.backgroundSecondary, borderColor: colors.primary }]}>
              <View style={styles.formHeader}>
                <Text style={[styles.formTitle, { color: colors.text }]}>Update Name</Text>
                <TouchableOpacity onPress={() => setShowProfileForm(false)}>
                  <IconSymbol name="xmark.circle.fill" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.text }]}>First Name</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  placeholder="Enter new first name"
                  placeholderTextColor={colors.textSecondary}
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                  editable={!loading}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.text }]}>Last Name</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  placeholder="Enter new last name"
                  placeholderTextColor={colors.textSecondary}
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                  editable={!loading}
                />
              </View>

              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: colors.primary }]}
                onPress={handleUpdateProfile}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color={colors.background} /> : (
                  <Text style={[styles.submitButtonText, { color: colors.background }]}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {!showPasswordForm ? (
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}
              onPress={() => setShowPasswordForm(true)}
            >
              <View style={styles.actionCardLeft}>
                <View style={[styles.iconContainer, { backgroundColor: colors.error + '20' }]}>
                  <IconSymbol name="lock.fill" size={24} color={colors.error} />
                </View>
                <View>
                  <Text style={[styles.actionTitle, { color: colors.text }]}>Change Password</Text>
                  <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>
                    Update your account password
                  </Text>
                </View>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ) : (
            <View style={[styles.formCard, { backgroundColor: colors.backgroundSecondary, borderColor: colors.error }]}>
              <View style={styles.formHeader}>
                <Text style={[styles.formTitle, { color: colors.text }]}>Change Password</Text>
                <TouchableOpacity onPress={() => setShowPasswordForm(false)}>
                  <IconSymbol name="xmark.circle.fill" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.formDescription, { color: colors.textSecondary }]}>
                For security, enter your current password
              </Text>

              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.text }]}>Current Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.passwordInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                    placeholder="Enter current password"
                    placeholderTextColor={colors.textSecondary}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    secureTextEntry={!showCurrentPassword}
                    autoCapitalize="none"
                    editable={!loading}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                    disabled={loading}
                  >
                    <View style={styles.eyeIcon}>
                      {showCurrentPassword ? (
                        <>
                          <View style={[styles.eyeShape, { borderColor: colors.textSecondary }]} />
                          <View style={[styles.eyeSlash, { backgroundColor: colors.textSecondary }]} />
                        </>
                      ) : (
                        <>
                          <View style={[styles.eyeShape, { borderColor: colors.textSecondary }]} />
                          <View style={[styles.eyePupil, { backgroundColor: colors.textSecondary }]} />
                        </>
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.text }]}>New Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.passwordInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                    placeholder="At least 6 characters"
                    placeholderTextColor={colors.textSecondary}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showNewPassword}
                    autoCapitalize="none"
                    editable={!loading}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowNewPassword(!showNewPassword)}
                    disabled={loading}
                  >
                    <View style={styles.eyeIcon}>
                      {showNewPassword ? (
                        <>
                          <View style={[styles.eyeShape, { borderColor: colors.text }]} />
                          <View style={[styles.eyeSlash, { backgroundColor: colors.text }]} />
                        </>
                      ) : (
                        <>
                          <View style={[styles.eyeShape, { borderColor: colors.text }]} />
                          <View style={[styles.eyePupil, { backgroundColor: colors.text }]} />
                        </>
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.text }]}>Confirm New Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.passwordInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                    placeholder="Re-enter new password"
                    placeholderTextColor={colors.textSecondary}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    editable={!loading}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                  >
                    <View style={styles.eyeIcon}>
                      {showConfirmPassword ? (
                        <>
                          <View style={[styles.eyeShape, { borderColor: colors.text }]} />
                          <View style={[styles.eyeSlash, { backgroundColor: colors.text }]} />
                        </>
                      ) : (
                        <>
                          <View style={[styles.eyeShape, { borderColor: colors.text }]} />
                          <View style={[styles.eyePupil, { backgroundColor: colors.text }]} />
                        </>
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: colors.error }]}
                onPress={handleChangePassword}
                disabled={loading}
              >
                <Text style={[styles.submitButtonText, { color: colors.background }]}>
                  {loading ? 'Changing...' : 'Change Password'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  infoCard: { padding: 20, borderRadius: 12, borderWidth: 1, marginBottom: 24 },
  infoLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  infoValue: { fontSize: 18, fontWeight: '600' },
  actionCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderRadius: 12, borderWidth: 1, marginBottom: 16 },
  actionCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 },
  iconContainer: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  actionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  actionSubtitle: { fontSize: 14 },
  formCard: { padding: 20, borderRadius: 12, borderWidth: 2, marginBottom: 16 },
  formHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  formTitle: { fontSize: 18, fontWeight: '700' },
  formDescription: { fontSize: 14, marginBottom: 20 },
  inputContainer: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { height: 48, borderWidth: 1, borderRadius: 10, paddingHorizontal: 16, fontSize: 16 },
  passwordContainer: { position: 'relative' },
  passwordInput: { height: 48, borderWidth: 1, borderRadius: 10, paddingHorizontal: 16, paddingRight: 50, fontSize: 16 },
  eyeButton: { position: 'absolute', right: 12, top: 10, padding: 6, backgroundColor: 'rgba(128,128,128,0.2)', borderRadius: 6, minWidth: 32, minHeight: 32, alignItems: 'center', justifyContent: 'center' },
  eyeIcon: { width: 18, height: 12, alignItems: 'center', justifyContent: 'center' },
  eyeShape: { width: 18, height: 12, borderWidth: 1.5, borderRadius: 9 },
  eyePupil: { position: 'absolute', width: 6, height: 6, borderRadius: 3 },
  eyeSlash: { position: 'absolute', width: 20, height: 1.5, transform: [{ rotate: '45deg' }] },
  submitButton: { height: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  submitButtonText: { fontSize: 16, fontWeight: '700' },
});
