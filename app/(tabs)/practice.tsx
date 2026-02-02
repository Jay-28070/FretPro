/**
 * Practice Hub
 * 
 * Central hub for all practice modes and daily progress tracking.
 * Gamified experience to encourage daily practice.
 */

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface DailyProgress {
  streak: number;
  todayAccuracy: number;
  sessionsToday: number;
  goal: number;
}

export default function PracticeHubScreen() {
  const { colorScheme } = useTheme();
  const { user } = useAuth();
  const colors = Colors[colorScheme];

  const [progress, setProgress] = useState<DailyProgress>({
    streak: 0,
    todayAccuracy: 0,
    sessionsToday: 0,
    goal: 3,
  });

  useEffect(() => {
    // TODO: Load progress from Firestore
    // For now, using placeholder data
    setProgress({
      streak: 5,
      todayAccuracy: 87,
      sessionsToday: 2,
      goal: 3,
    });
  }, [user]);

  const practiceMode = [
    {
      id: 'metronome',
      title: 'Rhythm Master',
      description: 'Hold notes in perfect time',
      icon: 'tuningfork' as const,
      color: colors.primary,
      route: '/practice/metronome',
    },
    {
      id: 'ear-training',
      title: 'Ear Training',
      description: 'Identify notes and chords',
      icon: 'music.note' as const,
      color: colors.secondary,
      route: '/practice/ear-training',
    },
    {
      id: 'note-recognition',
      title: 'Note Recognition',
      description: 'Play notes called out by voice',
      icon: 'music.note.list' as const,
      color: colors.primary,
      route: '/practice/note-recognition',
    },
  ];

  const progressPercentage = (progress.sessionsToday / progress.goal) * 100;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Practice Hub</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Build your skills daily
        </Text>
      </View>

      {/* Practice Modes */}
      <View style={styles.modesSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Practice Modes</Text>
        
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
    marginTop: 40,
    marginBottom: 24,
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
  progressCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 32,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  streakBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  streakText: {
    fontSize: 16,
    fontWeight: '700',
  },
  progressBarSection: {
    marginBottom: 16,
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#00000020',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  modesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
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
  },
  tipsCard: {
    padding: 16,
    borderRadius: 12,
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
