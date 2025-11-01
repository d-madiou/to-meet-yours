import Button from '@/components/ui/Button';
import DatePickerInput from '@/components/ui/DatePickerInput';
import DropdownInput from '@/components/ui/DropdownInput';
import GenderSelector from '@/components/ui/GenderSelector';
import { Colors } from '@/constants/theme';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

// Mock data - will come from backend later
const COUNTRIES = [
  { label: 'United States', value: 'us' },
  { label: 'United Kingdom', value: 'uk' },
  { label: 'Canada', value: 'ca' },
  { label: 'Australia', value: 'au' },
  { label: 'Malaysia', value: 'my' },
  { label: 'Singapore', value: 'sg' },
];

const CITIES = [
  { label: 'New York', value: 'new_york' },
  { label: 'Los Angeles', value: 'los_angeles' },
  { label: 'London', value: 'london' },
  { label: 'Toronto', value: 'toronto' },
  { label: 'Kuala Lumpur', value: 'kuala_lumpur' },
  { label: 'Singapore', value: 'singapore' },
];

export default function PersonalInfoScreen() {
  // Form state
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);

  // Error state
  const [errors, setErrors] = useState({
    name: '',
    bio: '',
    birthDate: '',
    gender: '',
    country: '',
    city: '',
  });

  // Calculate maximum date (18 years ago)
  const getMaxDate = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 18);
    return date;
  };

  // Calculate minimum date (100 years ago)
  const getMinDate = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 100);
    return date;
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      name: '',
      bio: '',
      birthDate: '',
      gender: '',
      country: '',
      city: '',
    };

    if (!name.trim()) {
      newErrors.name = 'Name is required';
      valid = false;
    }

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

    if (!country) {
      newErrors.country = 'Country is required';
      valid = false;
    }

    if (!city) {
      newErrors.city = 'City is required';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Success', 'Profile information saved successfully!', [
        {
          text: 'OK',
          onPress: () => {
            // TODO: Navigate to next screen (photos, interests, etc.)
            // router.push('/(auth)/upload-photos');
            router.replace('/(tabs)'); // or wherever you want
          },
        },
      ]);
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Personal information</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Name */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Name</Text>
              <View
                style={[
                  styles.inputContainer,
                  errors.name && styles.inputError,
                ]}
              >
                <TextInput
                  style={styles.input}
                  placeholder="Vanessa Taylor"
                  placeholderTextColor={Colors.dark.placeholder}
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    if (errors.name) setErrors({ ...errors, name: '' });
                  }}
                />
              </View>
              {errors.name && (
                <Text style={styles.errorText}>{errors.name}</Text>
              )}
            </View>

            {/* Bio */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Bio</Text>
              <View
                style={[
                  styles.textAreaContainer,
                  errors.bio && styles.inputError,
                ]}
              >
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
            <GenderSelector
              selected={gender}
              onSelect={(selectedGender) => {
                setGender(selectedGender);
                if (errors.gender) setErrors({ ...errors, gender: '' });
              }}
              error={errors.gender}
            />

            {/* Country */}
            <DropdownInput
              label="Country"
              placeholder="United States"
              value={country}
              options={COUNTRIES}
              onChange={(value) => {
                setCountry(value);
                if (errors.country) setErrors({ ...errors, country: '' });
              }}
              error={errors.country}
            />

            {/* City */}
            <DropdownInput
              label="City"
              placeholder="New York"
              value={city}
              options={CITIES}
              onChange={(value) => {
                setCity(value);
                if (errors.city) setErrors({ ...errors, city: '' });
              }}
              error={errors.city}
            />

            {/* Save Button */}
            <Button
              title="Save"
              onPress={handleSave}
              loading={loading}
              variant="primary"
              style={styles.saveButton}
            />
          </View>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 30,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.dark.text,
    textAlign: 'center',
  },
  form: {
    flex: 1,
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
  saveButton: {
    marginTop: 20,
  },
});