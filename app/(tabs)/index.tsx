import FeedCard from '@/components/ui/FeedCard';
import { Colors } from '@/constants/theme';
import { feedService } from '@/src/services/api/feed.service';
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
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      const response = await feedService.getFeed(20);
      setUsers(response.results);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFeed();
    setRefreshing(false);
  };

  const handleLike = (user: FeedUser) => {
    console.log('Like:', user.username);
    // TODO: Implement like logic later
    Alert.alert('Coming Soon', 'Like feature will be implemented next!');
  };

  const handlePass = (user: FeedUser) => {
    console.log('Pass:', user.username);
    // TODO: Implement pass logic later
    Alert.alert('Coming Soon', 'Pass feature will be implemented next!');
  };

  const handleMessage = (user: FeedUser) => {
    console.log('Message:', user.username);
    // TODO: Implement message logic later
    Alert.alert('Coming Soon', 'Messaging will be implemented next!');
  };

  const handleProfile = (user: FeedUser) => {
    console.log('View Profile:', user.username);
    // TODO: Navigate to profile detail
    Alert.alert('Coming Soon', 'Profile view will be implemented next!');
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
        data={users}
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