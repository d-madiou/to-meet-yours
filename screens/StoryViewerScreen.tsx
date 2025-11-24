import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { storyService } from '../src/services/api/story.service';
import { Story } from '../src/types/story.types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function StoryViewerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [stories, setStories] = useState<Story[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);
  
  const progressRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    loadStories();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (stories.length > 0 && !paused) {
      startStoryTimer();
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentIndex, stories, paused]);

  const loadStories = async () => {
    try {
      // Get stories from params (passed from previous screen)
      const storiesData = JSON.parse(params.stories as string) as Story[];
      setStories(storiesData);
      
      // Mark first story as viewed
      if (storiesData.length > 0) {
        await storyService.markStoryViewed(storiesData[0].id);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load stories');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const startStoryTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    progressRef.current = 0;
    const currentStory = stories[currentIndex];
    const duration = currentStory?.duration || 5;
    const intervalTime = 50; // Update every 50ms
    const increment = (intervalTime / 1000) / duration;

    timerRef.current = setInterval(() => {
      progressRef.current += increment;

      if (progressRef.current >= 1) {
        goToNext();
      }
    }, intervalTime);
  };

  const goToNext = async () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
      
      // Mark next story as viewed
      await storyService.markStoryViewed(stories[currentIndex + 1].id);
    } else {
      // All stories viewed, go back
      router.back();
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      router.back();
    }
  };

  const handleScreenPress = (event: any) => {
    const { locationX } = event.nativeEvent;
    const screenMiddle = SCREEN_WIDTH / 2;

    if (locationX < screenMiddle) {
      goToPrevious();
    } else {
      goToNext();
    }
  };

  const handleLongPress = () => {
    setPaused(true);
  };

  const handlePressOut = () => {
    setPaused(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  const currentStory = stories[currentIndex];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Story Content */}
      {currentStory.story_type === 'image' && currentStory.media_url && (
        <Image
          source={{ uri: currentStory.media_url }}
          style={styles.media}
          resizeMode="cover"
        />
      )}

      {currentStory.story_type === 'text' && (
        <View
          style={[
            styles.textStory,
            { backgroundColor: currentStory.background_color },
          ]}
        >
          <Text style={styles.textContent}>{currentStory.text_content}</Text>
        </View>
      )}

      {/* Gradient Overlay */}
      <LinearGradient
        colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.3)']}
        style={styles.gradient}
      />

      {/* Progress Bars */}
      <View style={styles.progressContainer}>
        {stories.map((_, index) => (
          <View key={index} style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width:
                    index < currentIndex
                      ? '100%'
                      : index === currentIndex
                      ? `${progressRef.current * 100}%`
                      : '0%',
                },
              ]}
            />
          </View>
        ))}
      </View>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          {currentStory.user_photo && (
            <Image
              source={{ uri: currentStory.user_photo }}
              style={styles.userPhoto}
            />
          )}
          <Text style={styles.username}>{currentStory.user_username}</Text>
          <Text style={styles.timeAgo}>
            {getTimeAgo(currentStory.created_at)}
          </Text>
        </View>

        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Caption */}
      {currentStory.caption && (
        <View style={styles.captionContainer}>
          <Text style={styles.caption}>{currentStory.caption}</Text>
        </View>
      )}

      {/* Touchable Area for Navigation */}
      <View style={styles.touchableArea}>
        <TouchableOpacity
          style={styles.touchableLeft}
          onPress={goToPrevious}
          onLongPress={handleLongPress}
          onPressOut={handlePressOut}
          activeOpacity={1}
        />
        <TouchableOpacity
          style={styles.touchableRight}
          onPress={goToNext}
          onLongPress={handleLongPress}
          onPressOut={handlePressOut}
          activeOpacity={1}
        />
      </View>
    </View>
  );
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  media: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  textStory: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  textContent: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  progressContainer: {
    position: 'absolute',
    top: 50,
    left: 8,
    right: 8,
    flexDirection: 'row',
    gap: 4,
  },
  progressBarBackground: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#fff',
  },
  header: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userPhoto: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 8,
  },
  timeAgo: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  closeButton: {
    padding: 4,
  },
  captionContainer: {
    position: 'absolute',
    bottom: 40,
    left: 16,
    right: 16,
  },
  caption: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  touchableArea: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
  },
  touchableLeft: {
    flex: 1,
  },
  touchableRight: {
    flex: 1,
  },
});