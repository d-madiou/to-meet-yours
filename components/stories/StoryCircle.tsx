import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { UserStories } from '../../src/types/story.types';

interface StoryCircleProps {
  userStories: UserStories;
  isCurrentUser?: boolean;
  onPress: () => void;
  onAddStory?: () => void;
}

export default function StoryCircle({
  userStories,
  isCurrentUser = false,
  onPress,
  onAddStory,
}: StoryCircleProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={isCurrentUser && onAddStory ? onAddStory : onPress}
    >
      <View
        style={[
          styles.imageContainer,
          userStories.has_unviewed && !isCurrentUser && styles.unviewedBorder,
          isCurrentUser && styles.currentUserBorder,
        ]}
      >
        {userStories.user_photo ? (
          <Image
            source={{ uri: userStories.user_photo }}
            style={styles.image}
          />
        ) : (
          <View style={[styles.image, styles.placeholderImage]}>
            <Ionicons name="person" size={30} color={Colors.dark.placeholder} />
          </View>
        )}
        
        {isCurrentUser && (
          <View style={styles.addButton}>
            <Ionicons name="add" size={16} color="#fff" />
          </View>
        )}
      </View>
      
      <Text style={styles.username} numberOfLines={1}>
        {isCurrentUser ? 'Your story' : userStories.username}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginRight: 12,
    width: 70,
  },
  imageContainer: {
    width: 66,
    height: 66,
    borderRadius: 33,
    padding: 3,
    backgroundColor: Colors.dark.inputBackground,
  },
  unviewedBorder: {
    borderWidth: 3,
    borderColor: Colors.dark.primary,
  },
  currentUserBorder: {
    borderWidth: 2,
    borderColor: Colors.dark.placeholder,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  placeholderImage: {
    backgroundColor: Colors.dark.inputBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.dark.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.dark.background,
  },
  username: {
    marginTop: 4,
    fontSize: 12,
    color: Colors.dark.text,
    textAlign: 'center',
  },
});