import FeedCard from '@/components/ui/FeedCard';
import { Colors } from '@/constants/theme';
import { feedService } from '@/src/services/api/feed.service';
import { matchingService } from '@/src/services/api/matching.service';
import { FeedUser } from '@/src/types/feed.types';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function FeedScreen() {
  const [users, setUsers] = useState<FeedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [swipedUsers, setSwipedUsers] = useState<Set<string>>(new Set()); // ✅ Added state
  const [currentIndex, setCurrentIndex] = useState(0); // ✅ Added state
  const flatListRef = useRef<FlatList>(null);

  // -------------------------------
  // FETCH USERS
  // -------------------------------
  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      const response = await feedService.getFeed(20);
      // Ensure users is always an array, even if response.results is undefined
      setUsers(response.results || []);
    } catch (error: any) {
      Alert.alert('Error', error.message);
      setUsers([]); // Reset to an empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFeed();
    setRefreshing(false);
  };

  // -------------------------------
  // HANDLE LIKE
  // -------------------------------
  const handleLike = async (user: FeedUser) => {
    try {
      // Mark as swiped
      setSwipedUsers((prev) => new Set([...prev, user.id]));

      // Send swipe action to backend
      const response = await matchingService.swipe('like', user.id);

      // Handle mutual match
      if (response.is_mutual_match) {
        Alert.alert(
          'It\'s a Match!',
          `You and ${user.username} liked each other!`,
          [
            {
              text: 'Keep Swiping',
              style: 'cancel',
            },
            {
              text: 'View Match',
              onPress: () => {
                // TODO: Navigate to Matches screen
                console.log('Navigate to matches');
              },
            },
          ]
        );
      }

      // Move to next user
      setCurrentIndex((prev) => prev + 1);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  // -------------------------------
  // HANDLE PASS
  // -------------------------------
  const handlePass = async (user: FeedUser) => {
    try {
      // Mark as swiped
      setSwipedUsers((prev) => new Set([...prev, user.id]));

      // Send pass action
      await matchingService.swipe('pass', user.id);

      // Move to next user
      setCurrentIndex((prev) => prev + 1);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  // -------------------------------
  // OTHER PLACEHOLDERS
  // -------------------------------
  const handleMessage = (user: FeedUser) => {
    console.log('Message:', user.username);
    Alert.alert('Coming Soon', 'Messaging will be implemented next!');
  };

  const handleProfile = (user: FeedUser) => {
    console.log('View Profile:', user.username);
    Alert.alert('Coming Soon', 'Profile view will be implemented next!');
  };

  // -------------------------------
  // LOADING STATE
  // -------------------------------
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.dark.primary} />
      </View>
    );
  }

  // -------------------------------
  // RENDER UI
  // -------------------------------
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <FlatList
        ref={flatListRef}
        data={users.filter((u) => !swipedUsers.has(u.id))} // ✅ Skip swiped users
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FeedCard
            user={item}
            onLike={() => handleLike(item)}
            onPass={() => handlePass(item)}
            onMessage={() => handleMessage(item)}
            onProfile={() => handleProfile(item)}
          />
        )}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#fff"
          />
        }
      />
    </View>
  );
}

// -------------------------------
// STYLES
// -------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark.background,
  },
});
