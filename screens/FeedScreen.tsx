import StoriesHeader from '@/components/stories/StoriesHeader';
import FeedCard from '@/components/ui/FeedCard';
import { authService } from '@/src/services/api/auth.service';
import { feedService } from '@/src/services/api/feed.service';
import { matchingService } from '@/src/services/api/matching.service';
import { storyService } from '@/src/services/api/story.service';
import { FeedUser } from '@/src/types/feed.types';
import { UserStories } from '@/src/types/story.types';
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
    TouchableOpacity,
    View,
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function FeedScreen() {
  // Feed State
  const [users, setUsers] = useState<FeedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [swipedIds, setSwipedIds] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Stories state
  const [stories, setStories] = useState<UserStories[]>([]);
  const [loadingStories, setLoadingStories] = useState(true);
  const [currentUserId, setCurrentUserId] = useState('');

  // Clock State
  const [now, setNow] = useState(new Date());

  const flatListRef = useRef<FlatList>(null);

  // --- Timer Effect ---
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const myTime = now.toLocaleTimeString('en-MY', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  // --- Data Loading ---
  const loadFeed = useCallback(async () => {
    try {
      const { results = [] } = await feedService.getFeed(20);
      setUsers(results);
      setSwipedIds(new Set());
      setCurrentIndex(0);
    } catch (err: any) {
      if (err.response?.status !== 401) {
        // Silent fail preferred for feed to avoid spamming alerts
        console.log('Feed load error:', err.message);
      }
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStoriesAndUser = useCallback(async () => {
    try {
      const user = await authService.getCurrentUser();
      // Ensure ID is string to match story types
      setCurrentUserId(String(user.id || user.uuid));

      const response = await storyService.getStories();
      setStories(response.results || response);
    } catch (error: any) {
      console.error('Failed to load stories:', error);
    } finally {
      setLoadingStories(false);
    }
  }, []);

  // Initial Load
  useEffect(() => {
    loadFeed();
    loadStoriesAndUser();
  }, [loadFeed, loadStoriesAndUser]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadFeed(), loadStoriesAndUser()]);
    setRefreshing(false);
  };

  // --- Handlers ---
  const handleViewStory = (userStories: UserStories) => {
    router.push({
      pathname: '/story-viewer',
      params: {
        stories: JSON.stringify(userStories.stories),
        initialStoryIndex: 0,
      },
    });
  };

  const handleAddStory = () => {
    router.push('/create-story');
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
      
      // Auto-scroll
      if (currentIndex < users.length - 1) {
        flatListRef.current?.scrollToIndex({
          index: currentIndex + 1,
          animated: true,
        });
      }
    } catch (err: any) {
      // Undo optimistic update on failure
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
      
      {/* 1. Gradient Background for Header Area (Behind text) */}
      <LinearGradient
        colors={['rgba(0,0,0,0.9)', 'rgba(0,0,0,0.4)', 'transparent']}
        style={styles.topGradient}
        pointerEvents="none"
      />

      {/* 2. Header Overlay (Location & Filter) */}
      <View style={styles.headerOverlay}>
        <View style={styles.locationBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.locationText}>Malaysia • {myTime}</Text>
        </View>
        <TouchableOpacity style={styles.filterIcon}>
           <Ionicons name="options" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* 3. Stories Header (Sticky Overlay) */}
      {!loadingStories && (
        <View style={styles.storiesWrapper}>
          <StoriesHeader
            stories={stories}
            currentUserId={currentUserId}
            onViewStory={handleViewStory}
            onAddStory={handleAddStory}
          />
        </View>
      )}

      {/* 4. Main Feed List */}
      {visibleUsers.length === 0 ? (
         <View style={styles.empty}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="people" size={50} color="rgba(255,255,255,0.2)" />
            </View>
            <Text style={styles.emptyTitle}>You're all caught up!</Text>
            <Text style={styles.emptySubtitle}>Check back later for new people.</Text>
            <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
               <Text style={styles.refreshText}>Refresh Feed</Text>
            </TouchableOpacity>
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
  
  // FIX: Make stories background transparent and position correctly
  storiesWrapper: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 105 : 85, // Positioned below the location header
    left: 0,
    right: 0,
    zIndex: 15,
    height: 100,
    // Removed backgroundColor and borderBottomWidth to look cleaner
  },
  
  // FIX: Increased gradient height to ensure stories text is readable
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 220, // Covers header + stories area
    zIndex: 5,
  },

  headerOverlay: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 0,
    right: 0,
    zIndex: 20, // Highest z-index to stay clickable
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
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