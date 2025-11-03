import Button from '@/components/ui/Button';
import DatePickerInput from '@/components/ui/DatePickerInput';
import DropdownInput from '@/components/ui/DropdownInput';
import GenderSelector from '@/components/ui/GenderSelector';
import { Colors } from '@/constants/theme';
import { profileService } from '@/src/services/api/profile.service';
import { Interest, ProfileUpdateRequest } from '@/src/types/profile.types';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
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
  { label: 'Cote d\'Ivoire', value: 'Cote d\'Ivoire' },
  { label: 'Gabon', value: 'Gabon' },
  { label: 'Congo', value: 'Congo' },
  { label: 'Burkina Faso', value: 'Burkina Faso' },
  { label: 'Togo', value: 'Togo' },
  { label: 'Benin', value: 'Benin' },
];

const RELATIONSHIP_GOALS = [
  { label: 'Casual Dating', value: 'casual' },
  { label: 'Serious Relationship', value: 'serious' },
  { label: 'Friendship', value: 'friendship' },
  { label: 'Marriage', value: 'marriage' },
];

interface PhotoItem {
  id?: number;
  uri: string;
  isPrimary: boolean;
  uploaded: boolean;
}

export default function CompleteProfileScreen() {
  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // Form state
  const [bio, setBio] = useState('');
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [gender, setGender] = useState<'M' | 'F' | 'O' | null>(null);
  const [lookingForGender, setLookingForGender] = useState<'M' | 'F' | 'O' | null>(null);
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [relationshipGoal, setRelationshipGoal] = useState('');
  
  // Photos
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  // Interests
  const [availableInterests, setAvailableInterests] = useState<Interest[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<number[]>([]);
  const [loadingInterests, setLoadingInterests] = useState(false);
  
  // Loading state
  const [loading, setLoading] = useState(false);

  // Errors
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    loadInterests();
  }, []);

  const loadInterests = async () => {
    setLoadingInterests(true);
    try {
      const interests = await profileService.getInterests();
      setAvailableInterests(interests);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load interests');
    } finally {
      setLoadingInterests(false);
    }
  };

  // Helper to map 'M'/'F' to 'male'/'female' for GenderSelector
  const mapToSelectorGender = (g: 'M' | 'F' | 'O' | null): 'male' | 'female' | null => {
    if (g === 'M') return 'male';
    if (g === 'F') return 'female';
    return null;
  };

  // Helper to map 'male'/'female' to 'M'/'F' from GenderSelector
  const mapFromSelectorGender = (g: 'male' | 'female'): 'M' | 'F' => {
    if (g === 'male') return 'M';
    return 'F';
  };

  // Get max date (18 years ago)
  const getMaxDate = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 18);
    return date;
  };

  // Get min date (100 years ago)
  const getMinDate = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 100);
    return date;
  };

  // Validation for step 1
  const validateStep1 = (): boolean => {
    const newErrors: any = {};
    let valid = true;

    if (!bio.trim()) {
      newErrors.bio = 'Bio is required';
      valid = false;
    } else if (bio.length < 20) {
      newErrors.bio = 'Bio must be at least 20 characters';
      valid = false;
    }

    if (!birthDate) {
      newErrors.birthDate = 'Date of birth is required';
      valid = false;
    }

    if (!gender) {
      newErrors.gender = 'Please select your gender';
      valid = false;
    }

    if (!lookingForGender) {
      newErrors.lookingForGender = 'Please select who you\'re looking for';
      valid = false;
    }

    if (!country) {
      newErrors.country = 'Country is required';
      valid = false;
    }

    if (!city.trim()) {
      newErrors.city = 'City is required';
      valid = false;
    }

    if (!relationshipGoal) {
      newErrors.relationshipGoal = 'Relationship goal is required';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  // Validation for step 2
  const validateStep2 = (): boolean => {
    if (photos.length === 0) {
      Alert.alert('Photos Required', 'Please add at least one photo to continue');
      return false;
    }
    return true;
  };

  // Validation for step 3
  const validateStep3 = (): boolean => {
    if (selectedInterests.length < 3) {
      Alert.alert('Interests Required', 'Please select at least 3 interests');
      return false;
    }
    if (selectedInterests.length < 3) {
      Alert.alert('More Interests Needed', 'Please select at least 3 interests');
      return false;
    }
    return true;
  };

  // Handle next step
  const handleNext = async () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep === 3 && !validateStep3()) return;

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      await handleSubmit();
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Add photo
  const handleAddPhoto = async () => {
    try {
      const hasPermission = await profileService.requestImagePermissions();
      if (!hasPermission) {
        Alert.alert('Permission Required', 'Please grant camera and photo library permissions');
        return;
      }

      Alert.alert(
        'Add Photo',
        'Choose a photo source',
        [
          {
            text: 'Camera',
            onPress: async () => {
              const uri = await profileService.takePhoto();
              if (uri) {
                await uploadPhoto(uri);
              }
            },
          },
          {
            text: 'Gallery',
            onPress: async () => {
              const uri = await profileService.pickImage();
              if (uri) {
                await uploadPhoto(uri);
              }
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      console.error('Add photo error:', error);
    }
  };

  // Upload photo to server
  const uploadPhoto = async (uri: string) => {
    setUploadingPhoto(true);
    try {
      const isPrimary = photos.length === 0; // First photo is primary
      const response = await profileService.uploadPhoto(uri, isPrimary);
      
      setPhotos([...photos, {
        id: response.photo?.id,
        uri: response.photo?.url || uri,
        isPrimary,
        uploaded: true,
      }]);

      Alert.alert('Success', 'Photo uploaded successfully');
    } catch (error: any) {
      Alert.alert('Upload Failed', error.message);
      // Still add to UI for retry
      setPhotos([...photos, {
        uri,
        isPrimary: photos.length === 0,
        uploaded: false,
      }]);
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Remove photo
  const handleRemovePhoto = async (index: number) => {
    const photo = photos[index];
    
    if (photo.id) {
      try {
        await profileService.deletePhoto(photo.id);
      } catch (error: any) {
        Alert.alert('Error', 'Failed to delete photo');
        return;
      }
    }

    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
  };

  // Toggle interest selection
  const toggleInterest = (interestId: number) => {
    if (selectedInterests.includes(interestId)) {
      setSelectedInterests(selectedInterests.filter(id => id !== interestId));
    } else {
      setSelectedInterests([...selectedInterests, interestId]);
    }
  };

  // Submit complete profile
  const handleSubmit = async () => {
    setLoading(true);

    try {
      // Step 1: Update profile information
      const profileData: ProfileUpdateRequest = {
        bio,
        birth_date: birthDate?.toISOString().split('T')[0],
        gender: gender!,
        city,
        country,
        relationship_goal: relationshipGoal as any,
        looking_for_gender: lookingForGender!,
      };

      await profileService.updateProfile(profileData);

      // Step 2: Add interests
      for (const interestId of selectedInterests) {
        try {
          await profileService.addInterest(interestId, 3); // Default passion level
        } catch (error) {
          console.error('Failed to add interest:', interestId);
        }
      }

      // Success!
      Alert.alert(
        'Profile Complete!',
        'Your profile has been created successfully. Start matching!',
        [
          {
            text: 'Get Started',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Skip for now
  const handleSkip = () => {
    Alert.alert(
      'Skip Profile Completion',
      'You can complete your profile later from settings. Continue?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Continue',
          onPress: () => router.replace('/(tabs)'),
        },
      ]
    );
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Tell us about yourself</Text>

            {/* Bio */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Bio</Text>
              <View style={[styles.textAreaContainer, errors.bio && styles.inputError]}>
                <TextInput
                  style={styles.textArea}
                  placeholder="Tell us about yourself..."
                  placeholderTextColor={Colors.dark.placeholder}
                  value={bio}
                  onChangeText={(text) => {
                    setBio(text);
                    if (errors.bio) setErrors({ ...errors, bio: '' });
                  }}
                  multiline
                  numberOfLines={4}
                  maxLength={500}
                />
              </View>
              <Text style={styles.charCount}>{bio.length}/500</Text>
              {errors.bio && <Text style={styles.errorText}>{errors.bio}</Text>}
            </View>

            {/* Date of Birth */}
            <DatePickerInput
              label="Date of Birth"
              value={birthDate}
              onChange={(date) => {
                setBirthDate(date);
                if (errors.birthDate) setErrors({ ...errors, birthDate: '' });
              }}
              error={errors.birthDate}
              maximumDate={getMaxDate()}
              minimumDate={getMinDate()}
            />

            {/* Gender */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>I am</Text>
              <GenderSelector
                selected={mapToSelectorGender(gender)}
                onSelect={(g) => {
                  setGender(mapFromSelectorGender(g));
                  if (errors.gender) setErrors({ ...errors, gender: '' });
                }}
                error={errors.gender}
              />
            </View>

            {/* Looking For Gender */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Looking for</Text>
              <GenderSelector
                selected={mapToSelectorGender(lookingForGender)}
                onSelect={(g) => {
                  setLookingForGender(mapFromSelectorGender(g));
                  if (errors.lookingForGender) setErrors({ ...errors, lookingForGender: '' });
                }}
                error={errors.lookingForGender}
              />
            </View>

            {/* Relationship Goal */}
            <DropdownInput
              label="Relationship Goal"
              placeholder="What are you looking for?"
              value={relationshipGoal}
              options={RELATIONSHIP_GOALS}
              onChange={(value) => {
                setRelationshipGoal(value);
                if (errors.relationshipGoal) setErrors({ ...errors, relationshipGoal: '' });
              }}
              error={errors.relationshipGoal}
            />

            {/* Country */}
            <DropdownInput
              label="Country"
              placeholder="Select your country"
              value={country}
              options={COUNTRIES}
              onChange={(value) => {
                setCountry(value);
                if (errors.country) setErrors({ ...errors, country: '' });
              }}
              error={errors.country}
            />

            {/* City */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>City</Text>
              <View style={[styles.inputContainer, errors.city && styles.inputError]}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your city"
                  placeholderTextColor={Colors.dark.placeholder}
                  value={city}
                  onChangeText={(text) => {
                    setCity(text);
                    if (errors.city) setErrors({ ...errors, city: '' });
                  }}
                />
              </View>
              {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Add your photos</Text>
            <Text style={styles.stepSubtitle}>Add at least one photo to continue</Text>

            <View style={styles.photosGrid}>
              {photos.map((photo, index) => (
                <View key={index} style={styles.photoItem}>
                  <Image source={{ uri: photo.uri }} style={styles.photoImage} />
                  {photo.isPrimary && (
                    <View style={styles.primaryBadge}>
                      <Text style={styles.primaryBadgeText}>Primary</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.removePhotoBtn}
                    onPress={() => handleRemovePhoto(index)}
                  >
                    <Ionicons name="close-circle" size={24} color={Colors.dark.primary} />
                  </TouchableOpacity>
                </View>
              ))}

              {photos.length < 6 && (
                <TouchableOpacity
                  style={styles.addPhotoBtn}
                  onPress={handleAddPhoto}
                  disabled={uploadingPhoto}
                >
                  {uploadingPhoto ? (
                    <ActivityIndicator color={Colors.dark.primary} />
                  ) : (
                    <>
                      <Ionicons name="camera" size={32} color={Colors.dark.primary} />
                      <Text style={styles.addPhotoText}>Add Photo</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Select your interests</Text>
            <Text style={styles.stepSubtitle}>Choose at least 3 interests</Text>

            {loadingInterests ? (
              <ActivityIndicator size="large" color={Colors.dark.primary} style={{ marginTop: 20 }} />
            ) : (
              <View style={styles.interestsContainer}>
                {availableInterests.map((interest) => (
                  <TouchableOpacity
                    key={interest.id}
                    style={[
                      styles.interestChip,
                      selectedInterests.includes(interest.id) && styles.interestChipSelected,
                    ]}
                    onPress={() => toggleInterest(interest.id)}
                  >
                    <Text
                      style={[
                        styles.interestChipText,
                        selectedInterests.includes(interest.id) && styles.interestChipTextSelected,
                      ]}
                    >
                      {interest.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={styles.selectedCount}>
              Selected: {selectedInterests.length} / {availableInterests.length}
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Complete Your Profile</Text>
          <View style={styles.progressContainer}>
            {[...Array(totalSteps)].map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  index + 1 <= currentStep && styles.progressDotActive,
                ]}
              />
            ))}
          </View>
          <Text style={styles.stepIndicator}>
            Step {currentStep} of {totalSteps}
          </Text>
        </View>

        {/* Content */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderStepContent()}
        </ScrollView>

        {/* Footer Buttons */}
        <View style={styles.footer}>
          <View style={styles.buttonRow}>
            {currentStep > 1 && (
              <Button
                title="Back"
                onPress={handlePrevious}
                variant="secondary"
                style={styles.footerButton}
              />
            )}
            <Button
              title={currentStep === totalSteps ? 'Complete' : 'Next'}
              onPress={handleNext}
              loading={loading}
              variant="primary"
              style={styles.footerButton}
            />
          </View>
          
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 30,
    paddingBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  progressDot: {
    width: 40,
    height: 4,
    backgroundColor: Colors.dark.inputBorder,
    borderRadius: 2,
  },
  progressDotActive: {
    backgroundColor: Colors.dark.primary,
  },
  stepIndicator: {
    fontSize: 14,
    color: Colors.dark.placeholder,
  },
  scrollContent: {
    paddingHorizontal: 30,
    paddingBottom: 20,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 14,
    color: Colors.dark.placeholder,
    marginBottom: 20,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: Colors.dark.text,
    marginBottom: 8,
    fontWeight: '500',
  },
  inputContainer: {
    backgroundColor: Colors.dark.inputBackground,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: Colors.dark.inputBorder,
    paddingHorizontal: 16,
    minHeight: 50,
  },
  inputError: {
    borderColor: Colors.dark.primary,
  },
  input: {
    fontSize: 16,
    color: Colors.dark.text,
    paddingVertical: 12,
  },
  textAreaContainer: {
    backgroundColor: Colors.dark.inputBackground,
    borderRadius: 20,
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
  errorText: {
    fontSize: 12,
    color: Colors.dark.primary,
    marginTop: 4,
    marginLeft: 16,
  },
  // Photo styles
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 20,
  },
  photoItem: {
    width: '48%',
    aspectRatio: 3 / 4,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  primaryBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: Colors.dark.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  primaryBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  removePhotoBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
  },
  addPhotoBtn: {
    width: '48%',
    aspectRatio: 3 / 4,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.dark.inputBorder,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark.inputBackground,
  },
  addPhotoText: {
    color: Colors.dark.primary,
    fontSize: 14,
    marginTop: 8,
    fontWeight: '500',
  },
  // Interest styles
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 20,
  },
  interestChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.dark.inputBackground,
    borderWidth: 1,
    borderColor: Colors.dark.inputBorder,
  },
  interestChipSelected: {
    backgroundColor: Colors.dark.primary,
    borderColor: Colors.dark.primary,
  },
  interestChipText: {
    color: Colors.dark.text,
    fontSize: 14,
  },
  interestChipTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  selectedCount: {
    fontSize: 14,
    color: Colors.dark.placeholder,
    marginTop: 16,
    textAlign: 'center',
  },
  // Footer styles
  footer: {
    paddingHorizontal: 30,
    paddingVertical: 20,
    backgroundColor: Colors.dark.background,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.inputBorder,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  footerButton: {
    flex: 1,
  },
  skipButton: {
    marginTop: 12,
    alignItems: 'center',
  },
  skipText: {
    color: Colors.dark.placeholder,
    fontSize: 14,
  },
});