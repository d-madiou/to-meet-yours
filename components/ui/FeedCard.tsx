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
      {user.photo_url ? (
        <Image
          source={{ uri: user.photo_url }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.placeholderImage}>
          <Ionicons name="person" size={80} color="rgba(255,255,255,0.3)" />
        </View>
      )}

      <LinearGradient
        colors={[
          'transparent',
          'rgba(0,0,0,0.2)',
          'rgba(0,0,0,0.6)',
          'rgba(0,0,0,0.9)',
        ]}
        locations={[0, 0.2, 0.6, 1]}
        style={styles.gradient}
      >
        <View style={styles.contentContainer}>
          <View style={styles.textWrapper}>
            <View style={styles.headerRow}>
              <Text style={styles.name}>{user.username}</Text>
              {user.age && (
                <View style={styles.ageBadge}>
                  <Text style={styles.ageText}>{user.age}</Text>
                </View>
              )}
              {user.is_verified && (
                <Ionicons name="checkmark-circle" size={20} color="#20E070" style={styles.verifiedIcon} />
              )}
            </View>

            <View style={styles.metaRow}>
              {user.city && (
                <View style={styles.metaItem}>
                  <Ionicons name="location" size={12} color="#fff" />
                  <Text style={styles.metaText}>
                    {user.city}{user.country ? `, ${user.country}` : ''}
                  </Text>
                </View>
              )}
              
              {user.gender && (
                <>
                  <Text style={styles.metaDivider}>•</Text>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaText}>{user.gender}</Text>
                  </View>
                </>
              )}
            </View>

            {user.relationship_goal && (
              <View style={styles.goalPill}>
                <Ionicons name="heart" size={10} color="white" />
                <Text style={styles.goalText}>{user.relationship_goal}</Text>
              </View>
            )}

            {user.interests && user.interests.length > 0 && (
              <View style={styles.tagsRow}>
                {user.interests.slice(0, 3).map((interest, index) => (
                  <View key={index} style={styles.interestTag}>
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
        </View>
      </LinearGradient>

      <View style={styles.sideBar}>
        <TouchableOpacity
          style={styles.sideAction}
          onPress={onProfile}
          disabled={isProcessing}
        >
          <View style={[styles.profileCircle, isProcessing && styles.dimmed]}>
            {user.photo_url ? (
              <Image source={{ uri: user.photo_url }} style={styles.miniAvatar} />
            ) : (
              <Ionicons name="person" size={20} color="#fff" />
            )}
            <View style={styles.plusBadge}>
              <Ionicons name="add" size={12} color="#fff" />
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sideAction}
          onPress={onLike}
          disabled={isProcessing}
        >
          <View style={[styles.iconCircle, styles.likeCircle, isProcessing && styles.dimmed]}>
            <Ionicons name="heart" size={32} color="#FF006E" style={styles.shadowIcon} />
          </View>
          <Text style={styles.actionText}>Like</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sideAction}
          onPress={onMessage}
          disabled={isProcessing}
        >
          <View style={[styles.iconCircle, isProcessing && styles.dimmed]}>
            <Ionicons name="chatbubble-ellipses" size={30} color="#fff" style={styles.shadowIcon} />
          </View>
          <Text style={styles.actionText}>Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sideAction}
          onPress={onPass}
          disabled={isProcessing}
        >
          <View style={[styles.iconCircle, isProcessing && styles.dimmed]}>
            <Ionicons name="close-circle" size={32} color="rgba(255,255,255,0.6)" />
          </View>
          <Text style={styles.actionText}>Pass</Text>
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
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '55%',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingRight: 60, 
  },
  textWrapper: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  name: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  ageBadge: {
    backgroundColor: '#eeff00ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  ageText: {
    color: 'black',
    fontSize: 14,
    fontWeight: '700',
  },
  verifiedIcon: {
    marginLeft: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaDivider: {
    color: 'rgba(255,255,255,0.5)',
    marginHorizontal: 8,
  },
  metaText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '500',
  },
  goalPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF006E',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,0,110,0.3)',
    gap: 6,
  },
  goalText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  interestTag: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  interestText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  bio: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 15,
    lineHeight: 22,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  sideBar: {
    position: 'absolute',
    right: 10,
    bottom: Platform.OS === 'ios' ? 110 : 90,
    alignItems: 'center',
    gap: 25,
  },
  sideAction: {
    alignItems: 'center',
  },
  profileCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#fff',
    padding: 2,
    marginBottom: 10,
  },
  miniAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  plusBadge: {
    position: 'absolute',
    bottom: -8,
    alignSelf: 'center',
    backgroundColor: '#FF006E',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  likeCircle: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 30,
    backdropFilter: 'blur(10px)', 
  },
  shadowIcon: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  dimmed: {
    opacity: 0.5,
  },
});