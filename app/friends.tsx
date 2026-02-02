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
import { Stack } from 'expo-router';
import { collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
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

  // Load friends and friend requests
  useEffect(() => {
    if (!user) return;

    const loadFriendsData = async () => {
      try {
        // Load friends
        const friendsQuery = query(
          collection(db, 'friends'),
          where('status', '==', 'accepted')
        );
        const friendsSnapshot = await getDocs(friendsQuery);
        
        const friendsList: Friend[] = [];
        for (const friendDoc of friendsSnapshot.docs) {
          const data = friendDoc.data();
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

        // Load pending friend requests
        const requestsQuery = query(
          collection(db, 'friends'),
          where('user2', '==', user.uid),
          where('status', '==', 'pending')
        );
        const requestsSnapshot = await getDocs(requestsQuery);
        
        const requestsList: FriendRequest[] = [];
        for (const requestDoc of requestsSnapshot.docs) {
          const data = requestDoc.data();
          const fromProfile = await getDoc(doc(db, 'users', data.user1));
          if (fromProfile.exists()) {
            const profile = fromProfile.data();
            requestsList.push({
              id: requestDoc.id,
              fromUserId: data.user1,
              fromUsername: profile.username || profile.email?.split('@')[0] || 'User',
              fromName: `${profile.firstName} ${profile.lastName}`.trim(),
              createdAt: data.createdAt?.toDate() || new Date(),
            });
          }
        }
        setFriendRequests(requestsList);

        // Load challenges (if any)
        const challengesQuery = query(
          collection(db, 'challenges'),
          where('status', '==', 'completed')
        );
        const challengesSnapshot = await getDocs(challengesQuery);
        
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

      } catch (error) {
        console.error('Error loading friends data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFriendsData();
  }, [user]);

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
        const results = usersSnapshot.docs
          .filter(doc => {
            const data = doc.data();
            const username = data.username || data.email?.split('@')[0] || '';
            const fullName = `${data.firstName} ${data.lastName}`.toLowerCase();
            const searchLower = searchQuery.toLowerCase();
            
            return doc.id !== user.uid && 
                   (username.toLowerCase().includes(searchLower) ||
                    fullName.includes(searchLower));
          })
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
            username: doc.data().username || doc.data().email?.split('@')[0] || 'User',
          }));
        
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
    } catch (error) {
      console.error('Error sending friend request:', error);
      if (Platform.OS === 'web') {
        window.alert('Failed to send friend request');
      }
    }
  };

  const filteredFriends = friends.filter(friend =>
    friend.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `${friend.firstName} ${friend.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            placeholder="Search friends or add new..."
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
                        // Reload friends
                        window.location.reload();
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
            filteredFriends.map(friend => (
              <FriendCard
                key={friend.id}
                username={friend.username}
                fullName={`${friend.firstName} ${friend.lastName}`.trim()}
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
});
