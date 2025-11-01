import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface GenderSelectorProps {
  selected: 'male' | 'female' | null;
  onSelect: (gender: 'male' | 'female') => void;
  error?: string;
}

export default function GenderSelector({ selected, onSelect, error }: GenderSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Gender</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.genderButton,
            selected === 'male' && styles.selectedMale,
          ]}
          onPress={() => onSelect('male')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="male"
            size={24}
            color={selected === 'male' ? '#FFFFFF' : Colors.dark.text}
          />
          <Text
            style={[
              styles.genderText,
              selected === 'male' && styles.selectedText,
            ]}
          >
            Male
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.genderButton,
            selected === 'female' && styles.selectedFemale,
          ]}
          onPress={() => onSelect('female')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="female"
            size={24}
            color={selected === 'female' ? '#FFFFFF' : Colors.dark.text}
          />
          <Text
            style={[
              styles.genderText,
              selected === 'female' && styles.selectedText,
            ]}
          >
            Female
          </Text>
        </TouchableOpacity>
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: Colors.dark.text,
    marginBottom: 8,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark.inputBackground,
    borderRadius: 25,
    paddingVertical: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.dark.inputBorder,
  },
  selectedMale: {
    backgroundColor: '#2A2A2A',
    borderColor: Colors.dark.text,
  },
  selectedFemale: {
    backgroundColor: Colors.dark.primary,
    borderColor: Colors.dark.primary,
  },
  genderText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  selectedText: {
    color: '#FFFFFF',
  },
  errorText: {
    fontSize: 12,
    color: Colors.dark.primary,
    marginTop: 4,
    marginLeft: 16,
  },
});