import { Colors } from '@/constants/theme';
import { authService } from '@/src/services/api/auth.service';
import { profileService } from '@/src/services/api/profile.service';
import { User } from '@/src/types/auth.types';
import { Profile } from '@/src/types/profile.types';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const [currentUser, profileData] = await Promise.all([
        authService.getCurrentUser(),
        profileService.getMyProfile(),
      ]);
      setUser(currentUser);
      setProfile(profileData);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  };

  const handleEditProfile = () => {
    router.push('/edit-profile' as any);
  };

  const handleLogout = () => {
  Alert.alert(
    'Logout',
    'Are you sure you want to logout?',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            // Clear auth data
            await authService.logout();
            
            // Navigate to login (will trigger re-render of root layout)
            router.replace('/(auth)/login' as any);
          } catch (error: any) {
            console.error('Logout error:', error);
            // Even if logout fails, navigate to login
            router.replace('/(auth)/login' as any);
          }
        },
      },
    ]
  );
};

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.dark.primary} />
      </View>
    );
  }

  const primaryPhoto = profile?.photos?.find(p => p.is_primary) || profile?.photos?.[0];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={Colors.dark.primary}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color={Colors.dark.text} />
        </TouchableOpacity>
      </View>

      {/* Profile Photo */}
      <View style={styles.photoSection}>
        {primaryPhoto?.url ? (
          <Image source={{ uri: primaryPhoto.url }} style={styles.profilePhoto} />
        ) : (
          <View style={styles.placeholderPhoto}>
            <Ionicons name="person" size={80} color={Colors.dark.placeholder} />
          </View>
        )}
        <TouchableOpacity style={styles.editPhotoButton} onPress={handleEditProfile}>
          <Ionicons name="camera" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* User Info */}
      <View style={styles.infoSection}>
        <Text style={styles.username}>{user?.username}</Text>
        {profile?.age && (
          <Text style={styles.age}>{profile.age} years old</Text>
        )}
        {profile?.city && (
          <View style={styles.locationRow}>
            <Ionicons name="location" size={16} color={Colors.dark.placeholder} />
            <Text style={styles.location}>
              {profile.city}{profile.country && `, ${profile.country}`}
            </Text>
          </View>
        )}
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {profile?.actual_matches ?? profile?.total_matches ?? 0}
          </Text>
          <Text style={styles.statLabel}>Matches</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {profile?.actual_views ?? profile?.profile_views ?? 0}
          </Text>
          <Text style={styles.statLabel}>Views</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {profile?.profile_completion_percentage ?? 0}%
          </Text>
          <Text style={styles.statLabel}>Complete</Text>
        </View>
      </View>

      {/* Bio */}
      {profile?.bio && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Me</Text>
          <Text style={styles.bioText}>{profile.bio}</Text>
        </View>
      )}

      {/* Interests */}
      {profile?.interests && profile.interests.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interests</Text>
          <View style={styles.interestsContainer}>
            {profile.interests.map((interest, index) => (
              <View key={index} style={styles.interestChip}>
                <Text style={styles.interestText}>{interest.interest.name}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Looking For</Text>
        <View style={styles.preferenceRow}>
          <Ionicons name="heart" size={20} color={Colors.dark.primary} />
          <Text style={styles.preferenceText}>
            {profile?.relationship_goal || 'Not specified'}
          </Text>
        </View>
        {profile?.looking_for_gender && (
          <View style={styles.preferenceRow}>
            <Ionicons name="people" size={20} color={Colors.dark.primary} />
            <Text style={styles.preferenceText}>
              {profile.looking_for_gender === 'M' ? 'Men' : 
               profile.looking_for_gender === 'F' ? 'Women' : 'Everyone'}
            </Text>
          </View>
        )}
        <View style={styles.preferenceRow}>
          <Ionicons name="location" size={20} color={Colors.dark.primary} />
          <Text style={styles.preferenceText}>
            Within {profile?.max_distance_km || 50} km
          </Text>
        </View>
        <View style={styles.preferenceRow}>
          <Ionicons name="calendar" size={20} color={Colors.dark.primary} />
          <Text style={styles.preferenceText}>
            Age {profile?.min_age_preference || 18} - {profile?.max_age_preference || 100}
          </Text>
        </View>
      </View>

      {/* Edit Profile Button */}
      <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
        <Ionicons name="create-outline" size={20} color="#fff" />
        <Text style={styles.editButtonText}>Edit Profile</Text>
      </TouchableOpacity>

      {/* Settings Options */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.settingItem}>
          <Ionicons name="settings-outline" size={24} color={Colors.dark.text} />
          <Text style={styles.settingText}>Settings</Text>
          <Ionicons name="chevron-forward" size={24} color={Colors.dark.placeholder} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <Ionicons name="help-circle-outline" size={24} color={Colors.dark.text} />
          <Text style={styles.settingText}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={24} color={Colors.dark.placeholder} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#F44336" />
          <Text style={[styles.settingText, { color: '#F44336' }]}>Logout</Text>
          <Ionicons name="chevron-forward" size={24} color={Colors.dark.placeholder} />
        </TouchableOpacity>
      </View>

      {/* Version Info */}
      <Text style={styles.versionText}>Version 1.0.0</Text>
    </ScrollView>
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
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  logoutButton: {
    padding: 8,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: Colors.dark.primary,
  },
  placeholderPhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.dark.inputBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.dark.primary,
  },
  editPhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    backgroundColor: Colors.dark.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.dark.background,
  },
  infoSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  age: {
    fontSize: 16,
    color: Colors.dark.placeholder,
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 14,
    color: Colors.dark.placeholder,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    marginHorizontal: 20,
    backgroundColor: Colors.dark.inputBackground,
    borderRadius: 16,
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.dark.placeholder,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.dark.inputBorder,
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
    fontSize: 14,
    color: Colors.dark.text,
    lineHeight: 20,
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
    fontSize: 13,
    color: Colors.dark.text,
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  preferenceText: {
    fontSize: 14,
    color: Colors.dark.text,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark.primary,
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 25,
    gap: 8,
    marginBottom: 24,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: Colors.dark.text,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.dark.placeholder,
    marginTop: 20,
  },
});