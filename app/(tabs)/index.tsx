import FeedCard from '@/components/ui/FeedCard';
import { feedService } from '@/src/services/api/feed.service';
import { matchingService } from '@/src/services/api/matching.service';
import { FeedUser } from '@/src/types/feed.types';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  View
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 85 : 60;

export default function FeedScreen() {
  const [users, setUsers] = useState<FeedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [swipedIds, setSwipedIds] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [now, setNow] = useState(new Date());

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const myTime = now.toLocaleTimeString('en-MY', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const loadFeed = useCallback(async () => {
    try {
      const { results = [] } = await feedService.getFeed(20);
      setUsers(results);
      setSwipedIds(new Set());
      setCurrentIndex(0);
    } catch (err: any) {
      if (err.response?.status !== 401) {
        Alert.alert('Error', err.message ?? 'Failed to load feed');
      }
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFeed();
    setRefreshing(false);
  };

  const swipe = async (action: 'like' | 'pass', user: FeedUser) => {
    const tempSet = new Set(swipedIds);
    tempSet.add(user.id);
    setSwipedIds(tempSet);
    
    try {
      const resp = await matchingService.swipe(action, user.id);
      if (action === 'like' && resp.is_mutual_match) {
        Alert.alert("It's a Match!", `You and ${user.username} liked each other!`);
      }
      
      if (currentIndex < users.length - 1) {
        flatListRef.current?.scrollToIndex({
          index: currentIndex + 1,
          animated: true,
        });
      }
    } catch (err: any) {
      const revert = new Set(swipedIds);
      revert.delete(user.id);
      setSwipedIds(revert);
      Alert.alert('Error', err.message ?? 'Swipe failed');
    }
  };

  const handleLike = (u: FeedUser) => swipe('like', u);
  const handlePass = (u: FeedUser) => swipe('pass', u);
  const handleMessage = (u: FeedUser) => Alert.alert('Coming Soon');
  const handleProfile = (u: FeedUser) => router.push(`/userprofile/${u.id}`);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#FF006E" />
        <Text style={styles.loadingText}>Finding matches nearby...</Text>
      </View>
    );
  }

  const visibleUsers = users.filter(u => !swipedIds.has(u.id));

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={['rgba(0,0,0,0.8)', 'transparent']}
        style={styles.topGradient}
        pointerEvents="none"
      />

      <View style={styles.headerOverlay}>
        <View style={styles.locationBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.locationText}>Malaysia • {myTime}</Text>
        </View>
        <View style={styles.filterIcon}>
           <Ionicons name="options" size={20} color="#fff" />
        </View>
      </View>

      {visibleUsers.length === 0 ? (
         <View style={styles.empty}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="people" size={50} color="rgba(255,255,255,0.2)" />
            </View>
            <Text style={styles.emptyTitle}>You're all caught up!</Text>
            <Text style={styles.emptySubtitle}>Check back later for new people.</Text>
            <View style={styles.refreshButton}>
               <Text style={styles.refreshText} onPress={onRefresh}>Refresh Feed</Text>
            </View>
         </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={visibleUsers}
          keyExtractor={i => i.id}
          renderItem={({ item }) => (
            <FeedCard
              user={item}
              onLike={() => handleLike(item)}
              onPass={() => handlePass(item)}
              onMessage={() => handleMessage(item)}
              onProfile={() => handleProfile(item)}
              isProcessing={swipedIds.has(item.id)}
            />
          )}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          snapToInterval={SCREEN_HEIGHT}
          snapToAlignment="start"
          decelerationRate="fast"
          onMomentumScrollEnd={e => {
            const idx = Math.round(e.nativeEvent.contentOffset.y / SCREEN_HEIGHT);
            setCurrentIndex(idx);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 150,
    zIndex: 5,
  },

  headerOverlay: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF006E',
    marginRight: 8,
  },
  locationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  filterIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: { color: '#666', marginTop: 16, fontSize: 14 },

  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    marginBottom: 20,
    padding: 20,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  emptyTitle: { color: '#FFF', fontSize: 22, fontWeight: '700', marginBottom: 8 },
  emptySubtitle: { color: '#666', fontSize: 14, textAlign: 'center', marginBottom: 30 },
  refreshButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#FF006E',
    borderRadius: 30,
  },
  refreshText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});