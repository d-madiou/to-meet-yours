// ============================================================================
// File: app/edit-profile.tsx (or screens/EditProfileScreen.tsx)
// Complete Edit Profile Screen
// ============================================================================

import DatePickerInput from '@/components/ui/DatePickerInput';
import DropdownInput from '@/components/ui/DropdownInput';
import { Colors } from '@/constants/theme';
import { profileService } from '@/src/services/api/profile.service';
import { Profile, ProfileUpdateRequest } from '@/src/types/profile.types';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const COUNTRIES = [
  { label: 'Guinea', value: 'Guinea' },
  { label: 'Senegal', value: 'Senegal' },
  { label: 'Mali', value: 'Mali' },
  { label: 'Nigeria', value: 'Nigeria' },
  { label: 'Cote d\'Ivoire', value: 'Cote d\'Ivoire' },
  { label: 'Gabon', value: 'Gabon' },
  { label: 'Congo', value: 'Congo' },
];

const RELATIONSHIP_GOALS = [
  { label: 'Casual Dating', value: 'casual' },
  { label: 'Serious Relationship', value: 'serious' },
  { label: 'Friendship', value: 'friendship' },
  { label: 'Marriage', value: 'marriage' },
];

export default function EditProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [bio, setBio] = useState('');
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [gender, setGender] = useState<'M' | 'F' | 'O' | null>(null);
  const [lookingForGender, setLookingForGender] = useState<'M' | 'F' | 'O' | null>(null);
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [relationshipGoal, setRelationshipGoal] = useState('');
  const [minAge, setMinAge] = useState('18');
  const [maxAge, setMaxAge] = useState('35');
  const [maxDistance, setMaxDistance] = useState('50');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await profileService.getMyProfile();
      setProfile(data);

      // Populate form with current values
      setBio(data.bio || '');
      if (data.birth_date) {
        setBirthDate(new Date(data.birth_date));
      }
      setGender(data.gender || null);
      setLookingForGender(data.looking_for_gender || null);
      setCountry(data.country || '');
      setCity(data.city || '');
      setRelationshipGoal(data.relationship_goal || '');
      setMinAge(data.min_age_preference?.toString() || '18');
      setMaxAge(data.max_age_preference?.toString() || '35');
      setMaxDistance(data.max_distance_km?.toString() || '50');
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load profile');
      console.error('Load profile error:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    if (!bio.trim()) {
      Alert.alert('Error', 'Bio is required');
      return false;
    }

    if (bio.length < 20) {
      Alert.alert('Error', 'Bio must be at least 20 characters');
      return false;
    }

    if (!birthDate) {
      Alert.alert('Error', 'Date of birth is required');
      return false;
    }

    if (!gender) {
      Alert.alert('Error', 'Please select your gender');
      return false;
    }

    if (!city.trim()) {
      Alert.alert('Error', 'City is required');
      return false;
    }

    if (!country) {
      Alert.alert('Error', 'Country is required');
      return false;
    }

    const minAgeNum = parseInt(minAge);
    const maxAgeNum = parseInt(maxAge);

    if (minAgeNum < 18 || minAgeNum > 100) {
      Alert.alert('Error', 'Minimum age must be between 18 and 100');
      return false;
    }

    if (maxAgeNum < 18 || maxAgeNum > 100) {
      Alert.alert('Error', 'Maximum age must be between 18 and 100');
      return false;
    }

    if (minAgeNum > maxAgeNum) {
      Alert.alert('Error', 'Minimum age cannot be greater than maximum age');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);

    try {
      const data: ProfileUpdateRequest = {
        bio: bio.trim(),
        birth_date: birthDate!.toISOString().split('T')[0],
        gender: gender!,
        city: city.trim(),
        country,
        relationship_goal: relationshipGoal as any,
        looking_for_gender: lookingForGender!,
        min_age_preference: parseInt(minAge),
        max_age_preference: parseInt(maxAge),
        max_distance_km: parseInt(maxDistance),
      };

      await profileService.updateProfile(data);

      Alert.alert('Success', 'Profile updated successfully', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
      console.error('Update profile error:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.dark.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.dark.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Bio */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Bio *</Text>
            <View style={styles.textAreaContainer}>
              <TextInput
                style={styles.textArea}
                placeholder="Tell us about yourself..."
                placeholderTextColor={Colors.dark.placeholder}
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={4}
                maxLength={500}
              />
            </View>
            <Text style={styles.charCount}>{bio.length}/500</Text>
          </View>

          {/* Date of Birth */}
          <DatePickerInput
            label="Date of Birth *"
            value={birthDate}
            onChange={setBirthDate}
            maximumDate={new Date()}
          />

          {/* Gender */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>I am *</Text>
            <View style={styles.genderContainer}>
              <TouchableOpacity
                style={[styles.genderButton, gender === 'M' && styles.genderButtonActive]}
                onPress={() => setGender('M')}
              >
                <Ionicons 
                  name="male" 
                  size={24} 
                  color={gender === 'M' ? '#fff' : Colors.dark.text} 
                />
                <Text style={[styles.genderText, gender === 'M' && styles.genderTextActive]}>
                  Male
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.genderButton, gender === 'F' && styles.genderButtonActive]}
                onPress={() => setGender('F')}
              >
                <Ionicons 
                  name="female" 
                  size={24} 
                  color={gender === 'F' ? '#fff' : Colors.dark.text} 
                />
                <Text style={[styles.genderText, gender === 'F' && styles.genderTextActive]}>
                  Female
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.genderButton, gender === 'O' && styles.genderButtonActive]}
                onPress={() => setGender('O')}
              >
                <Ionicons 
                  name="male-female" 
                  size={24} 
                  color={gender === 'O' ? '#fff' : Colors.dark.text} 
                />
                <Text style={[styles.genderText, gender === 'O' && styles.genderTextActive]}>
                  Other
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Looking For */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Looking for</Text>
            <View style={styles.genderContainer}>
              <TouchableOpacity
                style={[styles.genderButton, lookingForGender === 'M' && styles.genderButtonActive]}
                onPress={() => setLookingForGender('M')}
              >
                <Ionicons 
                  name="male" 
                  size={24} 
                  color={lookingForGender === 'M' ? '#fff' : Colors.dark.text} 
                />
                <Text style={[styles.genderText, lookingForGender === 'M' && styles.genderTextActive]}>
                  Men
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.genderButton, lookingForGender === 'F' && styles.genderButtonActive]}
                onPress={() => setLookingForGender('F')}
              >
                <Ionicons 
                  name="female" 
                  size={24} 
                  color={lookingForGender === 'F' ? '#fff' : Colors.dark.text} 
                />
                <Text style={[styles.genderText, lookingForGender === 'F' && styles.genderTextActive]}>
                  Women
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.genderButton, lookingForGender === 'O' && styles.genderButtonActive]}
                onPress={() => setLookingForGender('O')}
              >
                <Ionicons 
                  name="people" 
                  size={24} 
                  color={lookingForGender === 'O' ? '#fff' : Colors.dark.text} 
                />
                <Text style={[styles.genderText, lookingForGender === 'O' && styles.genderTextActive]}>
                  Everyone
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Relationship Goal */}
          <DropdownInput
            label="Relationship Goal"
            placeholder="What are you looking for?"
            value={relationshipGoal}
            options={RELATIONSHIP_GOALS}
            onChange={setRelationshipGoal}
          />

          {/* Country */}
          <DropdownInput
            label="Country *"
            placeholder="Select your country"
            value={country}
            options={COUNTRIES}
            onChange={setCountry}
          />

          {/* City */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>City *</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter your city"
                placeholderTextColor={Colors.dark.placeholder}
                value={city}
                onChangeText={setCity}
              />
            </View>
          </View>

          {/* Age Preferences */}
          <Text style={styles.sectionTitle}>Age Preferences</Text>
          <View style={styles.row}>
            <View style={[styles.inputWrapper, { flex: 1 }]}>
              <Text style={styles.label}>Min Age</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="18"
                  placeholderTextColor={Colors.dark.placeholder}
                  value={minAge}
                  onChangeText={setMinAge}
                  keyboardType="number-pad"
                  maxLength={3}
                />
              </View>
            </View>

            <View style={[styles.inputWrapper, { flex: 1 }]}>
              <Text style={styles.label}>Max Age</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="35"
                  placeholderTextColor={Colors.dark.placeholder}
                  value={maxAge}
                  onChangeText={setMaxAge}
                  keyboardType="number-pad"
                  maxLength={3}
                />
              </View>
            </View>
          </View>

          {/* Max Distance */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Max Distance (km)</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="50"
                placeholderTextColor={Colors.dark.placeholder}
                value={maxDistance}
                onChangeText={setMaxDistance}
                keyboardType="number-pad"
                maxLength={4}
              />
            </View>
            <Text style={styles.helpText}>
              Show me people within {maxDistance || '50'} km
            </Text>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.inputBorder,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: Colors.dark.text,
    marginBottom: 8,
    fontWeight: '500',
  },
  inputContainer: {
    backgroundColor: Colors.dark.inputBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.inputBorder,
    paddingHorizontal: 16,
    minHeight: 50,
    justifyContent: 'center',
  },
  input: {
    fontSize: 16,
    color: Colors.dark.text,
    paddingVertical: 12,
  },
  textAreaContainer: {
    backgroundColor: Colors.dark.inputBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.inputBorder,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  textArea: {
    fontSize: 16,
    color: Colors.dark.text,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: Colors.dark.placeholder,
    textAlign: 'right',
    marginTop: 4,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  genderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.dark.inputBackground,
    borderWidth: 1,
    borderColor: Colors.dark.inputBorder,
    paddingVertical: 12,
    borderRadius: 12,
  },
  genderButtonActive: {
    backgroundColor: Colors.dark.primary,
    borderColor: Colors.dark.primary,
  },
  genderText: {
    fontSize: 14,
    color: Colors.dark.text,
    fontWeight: '500',
  },
  genderTextActive: {
    color: '#fff',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 12,
    marginTop: 8,
  },
  helpText: {
    fontSize: 12,
    color: Colors.dark.placeholder,
    marginTop: 4,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark.primary,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});