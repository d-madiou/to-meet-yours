import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { FeedUser } from '../../src/types/feed.types';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

interface FeedCardProps {
  user: FeedUser;
  onLike?: () => void;
  onPass?: () => void;
  onMessage?: () => void;
  onProfile?: () => void;
  isProcessing?: boolean;
}

export default function FeedCard({
  user,
  onLike,
  onPass,
  onMessage,
  onProfile,
  isProcessing = false,
}: FeedCardProps) {
  return (
    <View style={styles.container}>
      {/* Background Image */}
      {user.photo_url ? (
        <Image
          source={{ uri: user.photo_url }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.placeholderImage}>
          <Ionicons name="person" size={100} color={Colors.dark.placeholder} />
        </View>
      )}

      {/* Gradient Overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.gradient}
      >
        {/* User Info */}
        <View style={styles.infoContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>
              {user.username}
              {user.age && <Text style={styles.age}> {user.age}</Text>}
            </Text>

            {user.is_verified && (
              <Ionicons
                name="checkmark-circle"
                size={18}
                color="#4cd964"
                style={{ marginLeft: 6 }}
              />
            )}
          </View>

          {user.city && (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={16} color="#fff" />
              <Text style={styles.location}>
                {user.city}
                {user.country && `, ${user.country}`}
              </Text>
            </View>
          )}

          {user.relationship_goal && (
            <View style={styles.goalRow}>
              <Ionicons name="heart-outline" size={16} color="#fff" />
              <Text style={styles.goal}>{user.relationship_goal}</Text>
            </View>
          )}

          {user.gender && (
            <View style={styles.genderRow}>
              <Ionicons
                name={
                  user.gender === 'Male'
                    ? 'male'
                    : user.gender === 'Female'
                    ? 'female'
                    : 'male-female'
                }
                size={16}
                color="#fff"
              />
              <Text style={styles.gender}>{user.gender}</Text>
            </View>
          )}

          {user.interests && user.interests.length > 0 && (
            <View style={styles.interestsContainer}>
              {user.interests.slice(0, 3).map((interest, index) => (
                <View key={index} style={styles.interestChip}>
                  <Text style={styles.interestText}>{interest}</Text>
                </View>
              ))}
            </View>
          )}

          {user.bio && (
            <Text style={styles.bio} numberOfLines={2}>
              {user.bio}
            </Text>
          )}
        </View>
      </LinearGradient>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        {/* Profile Button */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onProfile}
          disabled={isProcessing} // ✅ disable if processing
        >
          <View
            style={[
              styles.avatarButton,
              isProcessing && styles.disabledButton, // ✅ visually dim
            ]}
          >
            {user.photo_url ? (
              <Image source={{ uri: user.photo_url }} style={styles.avatar} />
            ) : (
              <Ionicons name="person" size={24} color="#fff" />
            )}
          </View>
        </TouchableOpacity>

        {/* Like Button */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onLike}
          disabled={isProcessing} // ✅
        >
          <View
            style={[
              styles.iconButton,
              styles.likeButton,
              isProcessing && styles.disabledButton, // ✅
            ]}
          >
            <Ionicons name="heart" size={28} color="#fff" />
          </View>
          <Text style={styles.actionLabel}>Like</Text>
        </TouchableOpacity>

        {/* Message Button */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onMessage}
          disabled={isProcessing}
        >
          <View
            style={[
              styles.iconButton,
              styles.messageButton,
              isProcessing && styles.disabledButton,
            ]}
          >
            <Ionicons name="chatbubble" size={24} color="#fff" />
          </View>
          <Text style={styles.actionLabel}>Message</Text>
        </TouchableOpacity>

        {/* Pass Button */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onPass}
          disabled={isProcessing}
        >
          <View
            style={[
              styles.iconButton,
              styles.passButton,
              isProcessing && styles.disabledButton,
            ]}
          >
            <Ionicons name="close" size={28} color="#000" />
          </View>
          <Text style={styles.actionLabel}>Pass</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#000',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.dark.inputBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '45%',
    justifyContent: 'flex-end',
    paddingBottom: Platform.OS === 'ios' ? 120 : 90,
  },
  infoContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#fff',
  },
  age: {
    backgroundColor: '#f6ff00ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    marginLeft: 8,
    color: '#000',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  location: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 4,
    fontFamily: 'Poppins',
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  goal: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 4,
  },
  genderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  gender: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 4,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  interestChip: {
    backgroundColor: '#FF006E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  interestText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  bio: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
  },
  actionsContainer: {
    position: 'absolute',
    right: 12,
    bottom: 100,
    alignItems: 'center',
    gap: 20,
  },
  actionButton: {
    alignItems: 'center',
  },
  avatarButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.dark.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  iconButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  likeButton: {
    backgroundColor: '#FF006E',
  },
  messageButton: {
    backgroundColor: '#8338EC',
  },
  passButton: {
    backgroundColor: '#fff700ff',
  },
  actionLabel: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
});
