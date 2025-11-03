import Button from '@/components/ui/Button';
import { Colors } from '@/constants/theme';
import { profileService } from '@/src/services/api/profile.service';
import { Interest } from '@/src/types/profile.types';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ManageInterestsScreen() {
  const [availableInterests, setAvailableInterests] = useState<Interest[]>([]);
  const [userInterests, setUserInterests] = useState<Interest[]>([]);
  const [selectedInterestIds, setSelectedInterestIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [available, user] = await Promise.all([
        profileService.getInterests(),
        profileService.getUserInterests(),
      ]);
      setAvailableInterests(available);
      setUserInterests(user);
      setSelectedInterestIds(user.map((interest) => interest.id));
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load interests. Please try again.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = (interestId: number) => {
    if (selectedInterestIds.includes(interestId)) {
      setSelectedInterestIds(selectedInterestIds.filter((id) => id !== interestId));
    } else {
      setSelectedInterestIds([...selectedInterestIds, interestId]);
    }
  };

  const handleSaveChanges = async () => {
    if (selectedInterestIds.length < 3) {
      Alert.alert('Minimum Required', 'Please select at least 3 interests.');
      return;
    }

    setSaving(true);
    try {
      const originalIds = new Set(userInterests.map((i) => i.id));
      const selectedIds = new Set(selectedInterestIds);

      const interestsToAdd = [...selectedIds].filter((id) => !originalIds.has(id));
      const interestsToRemove = [...originalIds].filter((id) => !selectedIds.has(id));

      // Perform API calls
      await Promise.all([
        ...interestsToAdd.map((id) => profileService.addInterest(id, 3)), // Default passion level 3
        ...interestsToRemove.map((id) => profileService.removeInterest(id)),
      ]);

      Alert.alert('Success', 'Your interests have been updated.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Save Failed', error.message || 'Could not update interests. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.dark.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Manage Your Interests</Text>
        <Text style={styles.subtitle}>Select at least 3 that best describe you.</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.interestsContainer}>
          {availableInterests.map((interest) => (
            <TouchableOpacity
              key={interest.id}
              style={[
                styles.interestChip,
                selectedInterestIds.includes(interest.id) && styles.interestChipSelected,
              ]}
              onPress={() => toggleInterest(interest.id)}
            >
              <Text
                style={[
                  styles.interestChipText,
                  selectedInterestIds.includes(interest.id) && styles.interestChipTextSelected,
                ]}
              >
                {interest.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.selectedCount}>
          {selectedInterestIds.length} selected
        </Text>
        <Button
          title="Save Changes"
          onPress={handleSaveChanges}
          loading={saving}
          disabled={saving}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.inputBorder,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.dark.placeholder,
  },
  scrollContent: {
    padding: 30,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
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
  footer: {
    paddingHorizontal: 30,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.inputBorder,
    backgroundColor: Colors.dark.background,
  },
  selectedCount: {
    fontSize: 14,
    color: Colors.dark.placeholder,
    textAlign: 'center',
    marginBottom: 12,
  },
});