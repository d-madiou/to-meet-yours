import React from 'react';
import {
    ScrollView,
    StyleSheet,
    View
} from 'react-native';
import { UserStories } from '../../src/types/story.types';
import StoryCircle from './StoryCircle';

interface StoriesHeaderProps {
  stories: UserStories[];
  currentUserId: string;
  onViewStory: (userStories: UserStories) => void;
  onAddStory: () => void;
}

export default function StoriesHeader({
  stories,
  currentUserId,
  onViewStory,
  onAddStory,
}: StoriesHeaderProps) {
  // Separate current user's stories
  const currentUserStories = stories.find(s => s.user_id === currentUserId);
  const otherStories = stories.filter(s => s.user_id !== currentUserId);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Current User Story - Always first */}
        {currentUserStories ? (
          <StoryCircle
            userStories={currentUserStories}
            isCurrentUser
            onPress={() => onViewStory(currentUserStories)}
            onAddStory={onAddStory}
          />
        ) : (
          <StoryCircle
            userStories={{
              user_id: currentUserId,
              username: 'You',
              user_photo: null,
              has_unviewed: false,
              story_count: 0,
              stories: [],
            }}
            isCurrentUser
            onPress={onAddStory}
            onAddStory={onAddStory}
          />
        )}

        {/* Other Users' Stories */}
        {otherStories.map((userStories) => (
          <StoryCircle
            key={userStories.user_id}
            userStories={userStories}
            onPress={() => onViewStory(userStories)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  scrollContent: {
    paddingHorizontal: 12,
  },
});