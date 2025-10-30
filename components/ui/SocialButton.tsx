import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

interface SocialButtonProps {
  platform: 'facebook' | 'whatsapp' | 'instagram';
  onPress: () => void;
}

export default function SocialButton({ platform, onPress }: SocialButtonProps) {
  const getIconName = () => {
    switch (platform) {
      case 'facebook':
        return 'logo-facebook';
      case 'whatsapp':
        return 'logo-whatsapp';
      case 'instagram':
        return 'logo-instagram';
      default:
        return 'logo-facebook';
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.7}>
      <Ionicons name={getIconName()} size={24} color="#FFFFFF" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
});