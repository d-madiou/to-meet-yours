/*  FeedScreen.tsx  */
import FeedCard from '@/components/ui/FeedCard';
import { Colors } from '@/constants/theme';
import { feedService } from '@/src/services/api/feed.service';
import { matchingService } from '@/src/services/api/matching.service';
import { FeedUser } from '@/src/types/feed.types';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 85 : 60;

/* --------------------------------------------------------------- */
export default function FeedScreen() {
  const [users, setUsers] = useState<FeedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [swipedIds, setSwipedIds] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [now, setNow] = useState(new Date());

  const flatListRef = useRef<FlatList>(null);

  /* ---------- Live Malaysian Clock (MY) ---------- */
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const myTime = now.toLocaleTimeString('en-MY', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  /* ---------- Load Feed ---------- */
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

  /* ---------- Swipe Handlers ---------- */
  const swipe = async (action: 'like' | 'pass', user: FeedUser) => {
    const tempSet = new Set(swipedIds);
    tempSet.add(user.id);
    setSwipedIds(tempSet);
    setCurrentIndex(prev => prev + 1);

    try {
      const resp = await matchingService.swipe(action, user.id);

      if (action === 'like' && resp.is_mutual_match) {
        Alert.alert(
          "It's a Match!",
          `You and ${user.username} liked each other!`,
          [
            { text: 'Keep Swiping', style: 'cancel' },
            {
              text: 'View Match',
              onPress: () => {
                // TODO: navigate to matches tab / screen
                router.push('/matches');
              },
            },
          ]
        );
      }
    } catch (err: any) {
      // revert swipe on error
      const revert = new Set(swipedIds);
      revert.delete(user.id);
      setSwipedIds(revert);
      setCurrentIndex(prev => Math.max(prev - 1, 0));
      Alert.alert('Error', err.message ?? 'Swipe failed');
    }
  };

  const handleLike = (u: FeedUser) => swipe('like', u);
  const handlePass = (u: FeedUser) => swipe('pass', u);
  const handleMessage = (u: FeedUser) => {
    Alert.alert('Coming Soon', 'Messaging will be available soon!');
  };
  const handleProfile = (u: FeedUser) => {
    router.push(`/userprofile/${u.id}`);
  };

  /* ---------- Render ---------- */
  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.dark.primary} />
        <Text style={styles.loadingText}>Loading feed…</Text>
      </View>
    );
  }

  const visibleUsers = users.filter(u => !swipedIds.has(u.id));

  if (visibleUsers.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>No more profiles</Text>
        <Text style={styles.emptySubtitle}>Pull to refresh for new people</Text>
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* ---- Live Clock + MY badge ---- */}
      <View style={styles.timeBadge}>
        <Text style={styles.timeText}>{myTime}</Text>
        <Text style={styles.countryText}>MY</Text>
      </View>

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
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"
          />
        }
        onMomentumScrollEnd={e => {
          const idx = Math.round(e.nativeEvent.contentOffset.y / SCREEN_HEIGHT);
          setCurrentIndex(idx);
        }}
      />
    </View>
  );
}

/* --------------------------------------------------------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },

  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark.background,
  },
  loadingText: { color: '#AAA', marginTop: 12, fontSize: 16 },

  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 40,
  },
  emptyTitle: { color: '#FFF', fontSize: 22, fontWeight: '600', marginBottom: 8 },
  emptySubtitle: { color: '#888', fontSize: 15 },

  /* ---- Clock badge (top-right) ---- */
  timeBadge: {
    position: 'absolute',
    top: 50,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    zIndex: 10,
  },
  timeText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  countryText: { color: '#FF006E', fontSize: 10, fontWeight: '700', marginTop: 2 },
});