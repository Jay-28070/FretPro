/**
 * Friends Screen
 * 
 * Search for friends, view friend list, manage friend requests, and see recent challenges.
 * Fully integrated with Firebase Firestore.
 */

import { ChallengeCard } from '@/components/friends/ChallengeCard';
import { FriendCard } from '@/components/friends/FriendCard';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { db } from '@/config/firebase';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { type Difficulty, type GameType, scoreService } from '@/services/practice/ScoreService';
import { Stack, useFocusEffect } from 'expo-router';
import { collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Friend {
  id: string;
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  accuracy: number;
  isOnline: boolean;
}

interface FriendRequest {
  id: string;
  fromUserId: string;
  fromUsername: string;
  fromName: string;
  createdAt: Date;
}

interface Challenge {
  id: string;
  opponent: string;
  yourScore: number;
  theirScore: number;
  won: boolean;
}

interface LeaderboardEntry {
  userId: string;
  userName: string;
  score: number;
  accuracy: number;
  isCurrentUser: boolean;
}

export default function FriendsScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [selectedGame, setSelectedGame] = useState<GameType>('ear-training');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('easy');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [friendsPage, setFriendsPage] = useState(1);
  const [friendsPerPage] = useState(10);

  const filteredFriends = friends.filter(friend =>
    friend.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `${friend.firstName} ${friend.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(leaderboard.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLeaderboard = leaderboard.slice(startIndex, endIndex);

  // Friends pagination
  const totalFriendsPages = Math.ceil(filteredFriends.length / friendsPerPage);
  const friendsStartIndex = (friendsPage - 1) * friendsPerPage;
  const friendsEndIndex = friendsStartIndex + friendsPerPage;
  const paginatedFriends = filteredFriends.slice(friendsStartIndex, friendsEndIndex);

  // Load friends and friend requests
  const loadFriendsData = useCallback(async () => {
    if (!user) return;

    try {
      console.log('[Friends] Loading friends data for user:', user.uid);
      
      // Load friends (accepted friendships)
      console.log('[Friends] Querying friends collection...');
      const friendsQuery = query(
        collection(db, 'friends'),
        where('status', '==', 'accepted')
      );
      const friendsSnapshot = await getDocs(friendsQuery);
      console.log('[Friends] Found', friendsSnapshot.docs.length, 'accepted friendships');

      const friendsList: Friend[] = [];
      for (const friendDoc of friendsSnapshot.docs) {
        const data = friendDoc.data();
        // Check if current user is part of this friendship
        if (data.user1 !== user.uid && data.user2 !== user.uid) continue;
        
        const friendUserId = data.user1 === user.uid ? data.user2 : data.user1;

        // Get friend's profile
        const friendProfile = await getDoc(doc(db, 'users', friendUserId));
        if (friendProfile.exists()) {
          const profile = friendProfile.data();
          friendsList.push({
            id: friendDoc.id,
            userId: friendUserId,
            username: profile.username || profile.email?.split('@')[0] || 'User',
            firstName: profile.firstName || '',
            lastName: profile.lastName || '',
            accuracy: profile.stats?.averageAccuracy || 0,
            isOnline: false, // TODO: Implement online status
          });
        }
      }
      setFriends(friendsList);
      console.log('[Friends] Loaded', friendsList.length, 'friends');

      // Load ALL pending friend requests (both received and sent)
      console.log('[Friends] Querying pending requests...');
      const allRequestsSnapshot = await getDocs(
        query(collection(db, 'friends'), where('status', '==', 'pending'))
      );
      console.log('[Friends] Found', allRequestsSnapshot.docs.length, 'pending requests');

      const requestsList: FriendRequest[] = [];
      for (const requestDoc of allRequestsSnapshot.docs) {
        const data = requestDoc.data();
        
        // Only show requests where current user is the RECEIVER (not the sender)
        // Check if current user is part of this friendship AND didn't send it
        const isPartOfFriendship = data.user1 === user.uid || data.user2 === user.uid;
        const isReceiver = data.requestedBy !== user.uid;
        
        if (isPartOfFriendship && isReceiver) {
          // Get the sender's ID (the one who is NOT the current user)
          const senderId = data.user1 === user.uid ? data.user2 : data.user1;
          
          const fromProfile = await getDoc(doc(db, 'users', senderId));
          if (fromProfile.exists()) {
            const profile = fromProfile.data();
            requestsList.push({
              id: requestDoc.id,
              fromUserId: senderId,
              fromUsername: profile.username || profile.email?.split('@')[0] || 'User',
              fromName: `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'User',
              createdAt: data.createdAt?.toDate() || new Date(),
            });
          }
        }
      }
      setFriendRequests(requestsList);
      console.log('[Friends] Loaded', requestsList.length, 'friend requests for current user');

      // Load challenges (if any) - make this optional since challenges might not exist yet
      console.log('[Friends] Querying challenges...');
      try {
        const challengesQuery = query(
          collection(db, 'challenges'),
          where('status', '==', 'completed')
        );
        const challengesSnapshot = await getDocs(challengesQuery);
        console.log('[Friends] Found', challengesSnapshot.docs.length, 'completed challenges');

        const challengesList: Challenge[] = [];
        for (const challengeDoc of challengesSnapshot.docs) {
          const data = challengeDoc.data();
          if (data.challenger === user.uid || data.opponent === user.uid) {
            const isChallenger = data.challenger === user.uid;
            const opponentId = isChallenger ? data.opponent : data.challenger;
            const opponentProfile = await getDoc(doc(db, 'users', opponentId));

            if (opponentProfile.exists()) {
              const profile = opponentProfile.data();
              challengesList.push({
                id: challengeDoc.id,
                opponent: profile.username || profile.email?.split('@')[0] || 'User',
                yourScore: isChallenger ? data.challengerScore : data.opponentScore,
                theirScore: isChallenger ? data.opponentScore : data.challengerScore,
                won: isChallenger ? data.challengerScore > data.opponentScore : data.opponentScore > data.challengerScore,
              });
            }
          }
        }
        setChallenges(challengesList);
        console.log('[Friends] Loaded', challengesList.length, 'challenges');
      } catch (challengeError: any) {
        console.warn('[Friends] Could not load challenges (this is OK if challenges feature not implemented yet):', challengeError?.message);
        setChallenges([]); // Just set empty array, don't fail the whole function
      }

      console.log('[Friends] Successfully loaded all friends data');
    } catch (error: any) {
      console.error('[Friends] Error loading friends data:', error);
      console.error('[Friends] Error code:', error?.code);
      console.error('[Friends] Error message:', error?.message);
      // Don't show error to user - just set empty states
      setFriends([]);
      setFriendRequests([]);
      setChallenges([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadFriendsData();
  }, [loadFriendsData]);

  // Refresh friends data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadFriendsData();
    }, [loadFriendsData])
  );

  // Load leaderboard when game/difficulty changes
  useEffect(() => {
    if (!user) return;
    setCurrentPage(1); // Reset to first page
    loadLeaderboard();
  }, [user, selectedGame, selectedDifficulty]);

  const loadLeaderboard = async () => {
    if (!user) return;

    try {
      const friendScores = await scoreService.getFriendLeaderboard(user.uid, selectedGame, selectedDifficulty);

      // Add current user's score
      const userScore = await scoreService.getHighScore(user.uid, selectedGame, selectedDifficulty);
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();

      const entries: LeaderboardEntry[] = friendScores.map(score => ({
        userId: score.userId,
        userName: score.userName,
        score: score.score,
        accuracy: score.accuracy,
        isCurrentUser: false,
      }));

      // Add current user if they have a score
      if (userScore) {
        entries.push({
          userId: user.uid,
          userName: userData?.username || 'You',
          score: userScore.score,
          accuracy: userScore.accuracy,
          isCurrentUser: true,
        });
      }

      // Sort by score descending
      entries.sort((a, b) => b.score - a.score);

      setLeaderboard(entries);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      // Silently fail - just show empty leaderboard
      setLeaderboard([]);
    }
  };

  // Search for users
  useEffect(() => {
    if (!searchQuery.trim() || !user) {
      setSearchResults([]);
      return;
    }

    const searchUsers = async () => {
      setSearching(true);
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const searchLower = searchQuery.toLowerCase().trim();
        
        const results = usersSnapshot.docs
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .filter((doc: any) => {
            if (doc.id === user.uid) return false; // Don't show current user
            
            const data = doc.data();
            const username = (data.username || '').toLowerCase();
            const firstName = (data.firstName || '').toLowerCase();
            const lastName = (data.lastName || '').toLowerCase();
            const fullName = `${firstName} ${lastName}`.trim();
            const email = (data.email || '').toLowerCase();

            // Search by: first name, last name, full name, username, or email
            return firstName.includes(searchLower) ||
                   lastName.includes(searchLower) ||
                   fullName.includes(searchLower) ||
                   username.includes(searchLower) ||
                   email.includes(searchLower);
          })
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((doc: any) => ({
            id: doc.id,
            ...doc.data(),
            username: doc.data().username || doc.data().email?.split('@')[0] || 'User',
          }))
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .sort((a: any, b: any) => {
            // Sort by relevance: exact name matches first, then username matches
            const aFullName = `${a.firstName || ''} ${a.lastName || ''}`.toLowerCase();
            const bFullName = `${b.firstName || ''} ${b.lastName || ''}`.toLowerCase();
            
            const aNameMatch = aFullName.startsWith(searchLower);
            const bNameMatch = bFullName.startsWith(searchLower);
            
            if (aNameMatch && !bNameMatch) return -1;
            if (!aNameMatch && bNameMatch) return 1;
            
            return aFullName.localeCompare(bFullName);
          });

        setSearchResults(results);
      } catch (error) {
        console.error('Error searching users:', error);
      } finally {
        setSearching(false);
      }
    };

    const debounce = setTimeout(searchUsers, 500);
    return () => clearTimeout(debounce);
  }, [searchQuery, user]);

  const handleSendFriendRequest = async (toUserId: string) => {
    if (!user) return;

    try {
      // Create friendship document with sorted IDs
      const friendshipId = [user.uid, toUserId].sort().join('_');

      // Check if friendship already exists
      const existingFriendship = await getDoc(doc(db, 'friends', friendshipId));
      
      if (existingFriendship.exists()) {
        const status = existingFriendship.data().status;
        if (status === 'accepted') {
          if (Platform.OS === 'web') {
            window.alert('You are already friends with this user!');
          }
          return;
        } else if (status === 'pending') {
          if (Platform.OS === 'web') {
            window.alert('Friend request already sent!');
          }
          return;
        }
      }

      // Create new friend request
      await setDoc(doc(db, 'friends', friendshipId), {
        user1: user.uid < toUserId ? user.uid : toUserId,
        user2: user.uid < toUserId ? toUserId : user.uid,
        status: 'pending',
        createdAt: new Date(),
        requestedBy: user.uid,
      });

      if (Platform.OS === 'web') {
        window.alert('Friend request sent!');
      }
      setSearchQuery('');
      setSearchResults([]);
      
      // Reload friends data to update UI
      loadFriendsData();
    } catch (error) {
      console.error('Error sending friend request:', error);
      if (Platform.OS === 'web') {
        window.alert('Failed to send friend request');
      }
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

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
            placeholder="Search by name or username..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {(searchQuery.length > 0 || searching) && (
            searching ? (
              <ActivityIndicator size="small" color={colors.textSecondary} />
            ) : (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <IconSymbol name="xmark.circle.fill" size={20} color={colors.textTertiary} />
              </TouchableOpacity>
            )
          )}
        </View>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Search Results
            </Text>
            {searchResults.map(result => (
              <View
                key={result.id}
                style={[styles.searchResultCard, {
                  backgroundColor: colors.backgroundSecondary,
                  borderColor: colors.border,
                }]}
              >
                <View style={styles.leftSection}>
                  <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                    <Text style={[styles.avatarText, { color: colors.background }]}>
                      {result.username.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.info}>
                    <Text style={[styles.username, { color: colors.text }]}>
                      {result.username}
                    </Text>
                    <Text style={[styles.fullName, { color: colors.textSecondary }]}>
                      {result.firstName} {result.lastName}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.addButton, { backgroundColor: colors.primary }]}
                  onPress={() => handleSendFriendRequest(result.id)}
                >
                  <IconSymbol name="person.badge.plus" size={20} color={colors.background} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Friend Requests */}
        {friendRequests.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Friend Requests ({friendRequests.length})
            </Text>
            {friendRequests.map(request => (
              <View
                key={request.id}
                style={[styles.requestCard, {
                  backgroundColor: colors.backgroundSecondary,
                  borderColor: colors.primary,
                }]}
              >
                <View style={styles.leftSection}>
                  <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                    <Text style={[styles.avatarText, { color: colors.background }]}>
                      {request.fromUsername.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.info}>
                    <Text style={[styles.username, { color: colors.text }]}>
                      {request.fromUsername}
                    </Text>
                    <Text style={[styles.fullName, { color: colors.textSecondary }]}>
                      {request.fromName}
                    </Text>
                  </View>
                </View>
                <View style={styles.requestActions}>
                  <TouchableOpacity
                    style={[styles.acceptButton, { backgroundColor: colors.success }]}
                    onPress={async () => {
                      try {
                        await setDoc(doc(db, 'friends', request.id), {
                          status: 'accepted',
                          acceptedAt: new Date(),
                        }, { merge: true });
                        setFriendRequests(prev => prev.filter(r => r.id !== request.id));
                        // Reload friends data
                        await loadFriendsData();
                      } catch (error) {
                        console.error('Error accepting request:', error);
                      }
                    }}
                  >
                    <IconSymbol name="checkmark" size={20} color={colors.background} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.rejectButton, { backgroundColor: colors.error }]}
                    onPress={async () => {
                      try {
                        await setDoc(doc(db, 'friends', request.id), {
                          status: 'rejected',
                        }, { merge: true });
                        setFriendRequests(prev => prev.filter(r => r.id !== request.id));
                      } catch (error) {
                        console.error('Error rejecting request:', error);
                      }
                    }}
                  >
                    <IconSymbol name="xmark" size={20} color={colors.background} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Friends List */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Friends ({filteredFriends.length})
          </Text>

          {filteredFriends.length > 0 ? (
            <>
              {paginatedFriends.map(friend => (
                <FriendCard
                  key={friend.id}
                  userId={friend.userId}
                  username={friend.username}
                  fullName={`${friend.firstName} ${friend.lastName}`.trim()}
                  accuracy={friend.accuracy}
                  isOnline={friend.isOnline}
                />
              ))}

              {/* Friends Pagination */}
              {totalFriendsPages > 1 && (
                <View style={styles.paginationContainer}>
                  <TouchableOpacity
                    style={[
                      styles.paginationButton,
                      {
                        backgroundColor: friendsPage === 1 ? colors.border : colors.primary,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => setFriendsPage(prev => Math.max(1, prev - 1))}
                    disabled={friendsPage === 1}
                  >
                    <IconSymbol
                      name="chevron.left.forwardslash.chevron.right"
                      size={16}
                      color={friendsPage === 1 ? colors.textTertiary : colors.background}
                    />
                  </TouchableOpacity>

                  <View style={styles.paginationInfo}>
                    <Text style={[styles.paginationText, { color: colors.text }]}>
                      Page {friendsPage} of {totalFriendsPages}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.paginationButton,
                      {
                        backgroundColor: friendsPage === totalFriendsPages ? colors.border : colors.primary,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => setFriendsPage(prev => Math.min(totalFriendsPages, prev + 1))}
                    disabled={friendsPage === totalFriendsPages}
                  >
                    <IconSymbol
                      name="chevron.right"
                      size={16}
                      color={friendsPage === totalFriendsPages ? colors.textTertiary : colors.background}
                    />
                  </TouchableOpacity>
                </View>
              )}
            </>
          ) : (
            <View style={[styles.emptyState, { backgroundColor: colors.backgroundSecondary }]}>
              <IconSymbol name="person.2" size={48} color={colors.textTertiary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {searchQuery ? 'No friends found' : 'No friends yet'}
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
                {searchQuery ? 'Try a different search' : 'Search above to add friends!'}
              </Text>
            </View>
          )}
        </View>

        {/* Recent Challenges */}
        {challenges.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Recent Challenges
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.challengesScroll}
            >
              {challenges.map(challenge => (
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

        {/* Leaderboards */}
        <View style={styles.section}>
          <View style={styles.leaderboardHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Leaderboards
            </Text>
            <View style={styles.itemsPerPageSelector}>
              <Text style={[styles.itemsPerPageLabel, { color: colors.textSecondary }]}>Show:</Text>
              {[10, 25, 50].map(num => (
                <TouchableOpacity
                  key={num}
                  style={[
                    styles.itemsPerPageButton,
                    {
                      backgroundColor: itemsPerPage === num ? colors.primary : colors.background,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => {
                    setItemsPerPage(num);
                    setCurrentPage(1);
                  }}
                >
                  <Text
                    style={[
                      styles.itemsPerPageText,
                      { color: itemsPerPage === num ? colors.background : colors.text },
                    ]}
                  >
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Game Selector */}
          <View style={styles.gameSelector}>
            <TouchableOpacity
              style={[
                styles.gameSelectorButton,
                {
                  backgroundColor: selectedGame === 'ear-training' ? colors.primary : colors.background,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setSelectedGame('ear-training')}
            >
              <Text
                style={[
                  styles.gameSelectorText,
                  { color: selectedGame === 'ear-training' ? colors.background : colors.text },
                ]}
              >
                Ear Training
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.gameSelectorButton,
                {
                  backgroundColor: selectedGame === 'note-recognition' ? colors.primary : colors.background,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setSelectedGame('note-recognition')}
            >
              <Text
                style={[
                  styles.gameSelectorText,
                  { color: selectedGame === 'note-recognition' ? colors.background : colors.text },
                ]}
              >
                Note Recognition
              </Text>
            </TouchableOpacity>
          </View>

          {/* Difficulty Selector */}
          <View style={styles.difficultySelector}>
            {(['easy', 'medium', 'hard'] as Difficulty[]).map(diff => (
              <TouchableOpacity
                key={diff}
                style={[
                  styles.difficultyButton,
                  {
                    backgroundColor: selectedDifficulty === diff ? colors.primary : colors.background,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setSelectedDifficulty(diff)}
              >
                <Text
                  style={[
                    styles.difficultyText,
                    { color: selectedDifficulty === diff ? colors.background : colors.text },
                  ]}
                >
                  {diff.charAt(0).toUpperCase() + diff.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Leaderboard List */}
          {leaderboard.length > 0 ? (
            <>
              <View style={[styles.leaderboardCard, {
                backgroundColor: colors.backgroundSecondary,
                borderColor: colors.border,
              }]}>
                {paginatedLeaderboard.map((entry, index) => {
                  const globalRank = startIndex + index + 1;

                  return (
                    <View
                      key={entry.userId}
                      style={[
                        styles.leaderboardEntry,
                        {
                          backgroundColor: entry.isCurrentUser ? colors.primary + '10' : 'transparent',
                          borderBottomColor: colors.border,
                          borderBottomWidth: index < paginatedLeaderboard.length - 1 ? 1 : 0,
                        },
                      ]}
                    >
                      <View style={styles.leaderboardLeft}>
                        <View style={[
                          styles.rankBadge,
                          {
                            backgroundColor: globalRank === 1 ? '#FFD700' :
                              globalRank === 2 ? '#C0C0C0' :
                                globalRank === 3 ? '#CD7F32' : colors.border,
                          },
                        ]}>
                          <Text style={[
                            styles.rankText,
                            { color: globalRank <= 3 ? '#FFFFFF' : colors.text }
                          ]}>
                            {globalRank}
                          </Text>
                        </View>
                        <View style={styles.playerInfo}>
                          <Text style={[
                            styles.leaderboardName,
                            {
                              color: entry.isCurrentUser ? colors.primary : colors.text,
                              fontWeight: entry.isCurrentUser ? '700' : '600',
                            },
                          ]}>
                            {entry.isCurrentUser ? 'You' : entry.userName}
                          </Text>
                          <Text style={[styles.leaderboardAccuracy, { color: colors.textSecondary }]}>
                            {entry.accuracy}% accuracy
                          </Text>
                        </View>
                      </View>
                      <View style={styles.leaderboardRight}>
                        <Text style={[styles.leaderboardScore, { color: colors.primary }]}>
                          {entry.score}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <View style={styles.paginationContainer}>
                  <TouchableOpacity
                    style={[
                      styles.paginationButton,
                      {
                        backgroundColor: currentPage === 1 ? colors.border : colors.primary,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <IconSymbol
                      name="chevron.left.forwardslash.chevron.right"
                      size={16}
                      color={currentPage === 1 ? colors.textTertiary : colors.background}
                    />
                  </TouchableOpacity>

                  <View style={styles.paginationInfo}>
                    <Text style={[styles.paginationText, { color: colors.text }]}>
                      Page {currentPage} of {totalPages}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.paginationButton,
                      {
                        backgroundColor: currentPage === totalPages ? colors.border : colors.primary,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <IconSymbol
                      name="chevron.right"
                      size={16}
                      color={currentPage === totalPages ? colors.textTertiary : colors.background}
                    />
                  </TouchableOpacity>
                </View>
              )}
            </>
          ) : (
            <View style={[styles.emptyLeaderboard, { backgroundColor: colors.backgroundSecondary }]}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No scores yet
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
                Play some games to see scores here!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
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
  searchResultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
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
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
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
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
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
  leaderboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  itemsPerPageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemsPerPageLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  itemsPerPageButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  itemsPerPageText: {
    fontSize: 13,
    fontWeight: '600',
  },
  gameSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  gameSelectorButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  gameSelectorText: {
    fontSize: 14,
    fontWeight: '700',
  },
  difficultySelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  difficultyButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  difficultyText: {
    fontSize: 13,
    fontWeight: '600',
  },
  leaderboardCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  leaderboardEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  leaderboardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 14,
    fontWeight: '700',
  },
  playerInfo: {
    flex: 1,
  },
  leaderboardName: {
    fontSize: 16,
    marginBottom: 4,
  },
  leaderboardRight: {
    alignItems: 'flex-end',
  },
  leaderboardScore: {
    fontSize: 20,
    fontWeight: '900',
  },
  leaderboardAccuracy: {
    fontSize: 13,
    fontWeight: '500',
  },
  emptyLeaderboard: {
    padding: 48,
    alignItems: 'center',
    borderRadius: 16,
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingHorizontal: 8,
  },
  paginationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationInfo: {
    alignItems: 'center',
  },
  paginationText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
