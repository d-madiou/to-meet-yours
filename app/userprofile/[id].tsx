import { Colors } from '@/constants/theme';
import { matchingService } from '@/src/services/api/matching.service';
import { profileService } from '@/src/services/api/profile.service';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

interface UserProfile {
  id: string;
  username: string;
  age: number | null;
  city: string;
  country: string;
  bio: string;
  gender: string;
  relationship_goal: string;
  photo_url: string | null;
  all_photos: string[];
  interests: string[];
  is_matched: boolean;  // ← Key property
}

export default function UserProfileDetailScreen() {
  const { id } = useLocalSearchParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadUserProfile(id as string);
    }
  }, [id]);

  const loadUserProfile = async (userId: string) => {
    try {
      const response = await profileService.getUserProfile(userId);
      setProfile(response);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load profile');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!profile) return;
    
    setActionLoading(true);
    try {
      await (matchingService as any).likeUser(profile.id);
      Alert.alert('Success', 'Like sent!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePass = async () => {
    if (!profile) return;
    
    setActionLoading(true);
    try {
      await (matchingService as any).passUser(profile.id);
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBlock = () => {
    if (!profile) return;

    Alert.alert(
      'Block User',
      `Are you sure you want to block ${profile.username}? This will remove any existing match and hide their profile.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Block',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              await matchingService.blockUser(profile.id);
              Alert.alert('Blocked', `${profile.username} has been blocked.`, [
                {
                  text: 'OK',
                  onPress: () => router.back(),
                },
              ]);
            } catch (error: any) {
              Alert.alert('Error', error.message);
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleSendMessage = () => {
    if (!profile) return;
    
    // Navigate to chat
    router.push({
      pathname: '/chat/new',
      params: {
        userUuid: profile.id,
        username: profile.username,
      },
    });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.dark.primary} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Profile not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <View style={styles.backButtonInner}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </View>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Photo */}
        <View style={styles.photoSection}>
          {profile.photo_url ? (
            <Image source={{ uri: profile.photo_url }} style={styles.profilePhoto} />
          ) : (
            <View style={styles.placeholderPhoto}>
              <Ionicons name="person" size={100} color={Colors.dark.placeholder} />
            </View>
          )}
        </View>

        {/* User Info */}
        <View style={styles.infoSection}>
          <View style={styles.nameRow}>
            <Text style={styles.username}>{profile.username}</Text>
            {profile.age && <Text style={styles.age}>, {profile.age}</Text>}
          </View>

          {profile.city && (
            <View style={styles.locationRow}>
              <Ionicons name="location" size={16} color={Colors.dark.placeholder} />
              <Text style={styles.location}>
                {profile.city}
                {profile.country && `, ${profile.country}`}
              </Text>
            </View>
          )}

          {profile.gender && (
            <View style={styles.detailRow}>
              <Ionicons name="male-female" size={16} color={Colors.dark.placeholder} />
              <Text style={styles.detailText}>{profile.gender}</Text>
            </View>
          )}

          {profile.relationship_goal && (
            <View style={styles.detailRow}>
              <Ionicons name="heart" size={16} color={Colors.dark.primary} />
              <Text style={styles.detailText}>{profile.relationship_goal}</Text>
            </View>
          )}
        </View>

        {/* Bio */}
        {profile.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bioText}>{profile.bio}</Text>
          </View>
        )}

        {/* Photo Gallery */}
        {profile.all_photos && profile.all_photos.length > 1 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Photos</Text>
            <View style={styles.photoGrid}>
              {profile.all_photos.slice(1).map((photoUrl, index) => (
                <Image
                  key={index}
                  source={{ uri: photoUrl }}
                  style={styles.gridPhoto}
                />
              ))}
            </View>
          </View>
        )}

        {/* Interests */}
        {profile.interests && profile.interests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interests</Text>
            <View style={styles.interestsContainer}>
              {profile.interests.map((interest: string, index: number) => (
                <View key={index} style={styles.interestChip}>
                  <Text style={styles.interestText}>{interest}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Spacer for buttons */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Action Buttons - Conditional Rendering */}
      <View style={styles.actionsContainer}>
        {profile.is_matched ? (
          // Matched Users - Show Message and Block buttons
          <>
            <TouchableOpacity
              style={styles.messageButton}
              onPress={handleSendMessage}
              disabled={actionLoading}
            >
              <Ionicons name="chatbubble" size={24} color="#fff" />
              <Text style={styles.buttonText}>Send Message</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.blockButton}
              onPress={handleBlock}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="ban" size={24} color="#fff" />
                  <Text style={styles.buttonText}>Block</Text>
                </>
              )}
            </TouchableOpacity>
          </>
        ) : (
          // Not Matched - Show Like and Pass buttons
          <>
            <TouchableOpacity
              style={styles.passButton}
              onPress={handlePass}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Ionicons name="close" size={32} color="#fff" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.likeButton}
              onPress={handleLike}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Ionicons name="heart" size={32} color="#fff" />
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark.background,
  },
  errorText: {
    fontSize: 16,
    color: Colors.dark.text,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  backButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoSection: {
    width: width,
    height: width * 1.2,
    backgroundColor: Colors.dark.inputBackground,
  },
  profilePhoto: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderPhoto: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark.inputBackground,
  },
  infoSection: {
    padding: 20,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  username: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  age: {
    fontSize: 24,
    color: Colors.dark.text,
    marginLeft: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  location: {
    fontSize: 16,
    color: Colors.dark.placeholder,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  detailText: {
    fontSize: 14,
    color: Colors.dark.text,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 12,
  },
  bioText: {
    fontSize: 15,
    color: Colors.dark.text,
    lineHeight: 22,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridPhoto: {
    width: (width - 48) / 3,
    height: (width - 48) / 3,
    borderRadius: 8,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestChip: {
    backgroundColor: Colors.dark.inputBackground,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.dark.inputBorder,
  },
  interestText: {
    fontSize: 14,
    color: Colors.dark.text,
  },
  actionsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: Colors.dark.background,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.inputBorder,
    gap: 12,
  },
  // Like/Pass buttons (for non-matched users)
  passButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  likeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.dark.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  // Message/Block buttons (for matched users)
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.dark.primary,
    paddingVertical: 14,
    borderRadius: 12,
  },
  blockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F44336',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});