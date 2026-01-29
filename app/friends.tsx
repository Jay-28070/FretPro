/**
 * Friends Screen
 * 
 * Search for friends, view friend list, and see recent challenges.
 * Modern, clean design with search bar and interactive cards.
 */

import { ChallengeCard } from '@/components/friends/ChallengeCard';
import { FriendCard } from '@/components/friends/FriendCard';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function FriendsScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - Phase 3 will load from backend
  const mockFriends = [
    { id: '1', username: 'RockStar92', accuracy: 89, isOnline: true },
    { id: '2', username: 'BluesLegend', accuracy: 92, isOnline: false },
    { id: '3', username: 'JazzMaster', accuracy: 85, isOnline: true },
  ];

  const mockChallenges = [
    { id: '1', opponent: 'RockStar92', yourScore: 1250, theirScore: 1180, won: true },
    { id: '2', opponent: 'BluesLegend', yourScore: 980, theirScore: 1050, won: false },
  ];

  const filteredFriends = mockFriends.filter(friend =>
    friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Friends',
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />
      
      <ScrollView 
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View style={[styles.searchContainer, { 
          backgroundColor: colors.backgroundSecondary,
          borderColor: colors.border,
        }]}>
          <IconSymbol name="magnifyingglass" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search friends..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <IconSymbol name="xmark.circle.fill" size={20} color={colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Friends List */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Friends ({filteredFriends.length})
          </Text>

          {filteredFriends.length > 0 ? (
            filteredFriends.map(friend => (
              <FriendCard
                key={friend.id}
                username={friend.username}
                accuracy={friend.accuracy}
                isOnline={friend.isOnline}
              />
            ))
          ) : (
            <View style={[styles.emptyState, { backgroundColor: colors.backgroundSecondary }]}>
              <IconSymbol name="person.2" size={48} color={colors.textTertiary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {searchQuery ? 'No friends found' : 'No friends yet'}
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
                {searchQuery ? 'Try a different search' : 'Search to add friends!'}
              </Text>
            </View>
          )}
        </View>

        {/* Recent Challenges */}
        {mockChallenges.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Recent Challenges
            </Text>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.challengesScroll}
            >
              {mockChallenges.map(challenge => (
                <ChallengeCard
                  key={challenge.id}
                  opponent={challenge.opponent}
                  yourScore={challenge.yourScore}
                  theirScore={challenge.theirScore}
                  won={challenge.won}
                />
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  emptyState: {
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  emptySubtext: {
    fontSize: 14,
  },
  challengesScroll: {
    gap: 12,
    paddingRight: 20,
  },
});
