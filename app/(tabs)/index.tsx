import FeedCard from '@/components/ui/FeedCard';
import { Colors } from '@/constants/theme';
import { feedService } from '@/src/services/api/feed.service';
import { matchingService } from '@/src/services/api/matching.service';
import { FeedUser } from '@/src/types/feed.types';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 85 : 60;

export default function FeedScreen() {
  const [users, setUsers] = useState<FeedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [swipedUsers, setSwipedUsers] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      const response = await feedService.getFeed(20);
      setUsers(response.results || []);
    } catch (error: any) {
      // Only show error if not a 401 (which means not authenticated)
      if (error.response?.status !== 401) {
        Alert.alert('Error', error.message);
      }
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFeed();
    setRefreshing(false);
  };

  const handleLike = async (user: FeedUser) => {
    try {
      setSwipedUsers((prev) => new Set([...prev, user.id]));

      const response = await matchingService.swipe('like', user.id);

      if (response.is_mutual_match) {
        Alert.alert(
          "It's a Match!",
          `You and ${user.username} liked each other!`,
          [
            {
              text: 'Keep Swiping',
              style: 'cancel',
            },
            {
              text: 'View Match',
              onPress: () => {
                // Navigate to matches tab
                console.log('Navigate to matches');
              },
            },
          ]
        );
      }

      setCurrentIndex((prev) => prev + 1);
    } catch (error: any) {
      // Revert swipe on error
      setSwipedUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(user.id);
        return newSet;
      });
      Alert.alert('Error', error.message);
    }
  };

  const handlePass = async (user: FeedUser) => {
    try {
      setSwipedUsers((prev) => new Set([...prev, user.id]));
      await matchingService.swipe('pass', user.id);
      setCurrentIndex((prev) => prev + 1);
    } catch (error: any) {
      setSwipedUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(user.id);
        return newSet;
      });
      Alert.alert('Error', error.message);
    }
  };

  const handleMessage = (user: FeedUser) => {
    console.log('Message:', user.username);
    Alert.alert('Coming Soon', 'Messaging will be implemented next!');
  };

  //Let's add the profile routing here

  const handleProfile = (user: FeedUser) => {
  console.log('View other user profile:', user.username);
  // Navigate to user profile detail with user ID
  router.push(`/userprofile/${user.id}`);
  };
  
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.dark.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <FlatList
        ref={flatListRef}
        data={users.filter((u) => !swipedUsers.has(u.id))}
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
        // Add bottom padding for tab bar
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          paddingBottom: TAB_BAR_HEIGHT, // Space for tab bar
        }}
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