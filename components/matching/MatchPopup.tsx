import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Dimensions,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MatchPopupProps {
  visible: boolean;
  matchedUser: {
    username: string;
    photo_url: string | null;
  };
  onClose: () => void;
  onSendMessage: () => void;
}

export default function MatchPopup({
  visible,
  matchedUser,
  onClose,
  onSendMessage,
}: MatchPopupProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Ionicons name="heart" size={60} color="#FF006E" />
            <Text style={styles.title}>It's a Match!</Text>
            <Text style={styles.subtitle}>
              You and {matchedUser.username} liked each other
            </Text>
          </View>

          {/* Photos */}
          <View style={styles.photosContainer}>
            {matchedUser.photo_url ? (
              <Image
                source={{ uri: matchedUser.photo_url }}
                style={styles.photo}
              />
            ) : (
              <View style={styles.placeholderPhoto}>
                <Ionicons name="person" size={60} color={Colors.dark.placeholder} />
              </View>
            )}
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={onSendMessage}
            >
              <Ionicons name="chatbubble" size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>Send Message</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
              <Text style={styles.secondaryButtonText}>Keep Swiping</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: SCREEN_WIDTH - 60,
    backgroundColor: Colors.dark.inputBackground,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginTop: 12,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.dark.placeholder,
    textAlign: 'center',
  },
  photosContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  photo: {
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
    backgroundColor: Colors.dark.inputBorder,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.dark.primary,
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark.primary,
    paddingVertical: 16,
    borderRadius: 25,
    gap: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: Colors.dark.text,
    fontSize: 14,
    fontWeight: '500',
  },
});