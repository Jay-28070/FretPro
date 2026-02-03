/**
 * Practice Hub
 * 
 * Central hub for all practice modes.
 * Simple navigation to different training exercises.
 */

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PracticeHubScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  const practiceMode = [
    {
      id: 'metronome',
      title: 'Rhythm Master',
      description: 'Hold notes in perfect time with metronome games',
      icon: 'tuningfork' as const,
      color: colors.primary,
      route: '/practice/metronome',
    },
    {
      id: 'ear-training',
      title: 'Ear Training',
      description: 'Identify notes and chords by ear',
      icon: 'music.note' as const,
      color: colors.secondary,
      route: '/practice/ear-training',
    },
    {
      id: 'note-recognition',
      title: 'Note Recognition',
      description: 'Play notes called out by voice on guitar',
      icon: 'music.note.list' as const,
      color: colors.primary,
      route: '/practice/note-recognition',
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Practice Hub</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Choose your training mode
          </Text>
        </View>

        {/* Practice Modes */}
        <View style={styles.modesSection}>
          {practiceMode.map((mode) => (
            <TouchableOpacity
              key={mode.id}
              style={[styles.modeCard, {
                backgroundColor: colors.backgroundSecondary,
                borderColor: colors.border,
              }]}
              onPress={() => router.push(mode.route as any)}
            >
              <View style={[styles.modeIcon, { backgroundColor: mode.color + '20' }]}>
                <IconSymbol name={mode.icon} size={32} color={mode.color} />
              </View>

              <View style={styles.modeContent}>
                <Text style={[styles.modeTitle, { color: colors.text }]}>
                  {mode.title}
                </Text>
                <Text style={[styles.modeDescription, { color: colors.textSecondary }]}>
                  {mode.description}
                </Text>
              </View>

              <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Tips */}
        <View style={[styles.tipsCard, {
          backgroundColor: colors.primary + '10',
          borderColor: colors.primary + '30',
        }]}>
          <Text style={[styles.tipsTitle, { color: colors.primary }]}>💡 Pro Tip</Text>
          <Text style={[styles.tipsText, { color: colors.text }]}>
            Practice for just 10 minutes daily to build muscle memory and improve faster!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  header: {
    marginTop: 20,
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  modesSection: {
    marginBottom: 24,
  },
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    gap: 16,
  },
  modeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeContent: {
    flex: 1,
  },
  modeTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  modeDescription: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  tipsCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
});
