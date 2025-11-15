import { Colors } from '@/constants/theme';
import { messagingService } from '@/src/services/api/messaging.service';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Animated, StyleSheet, Text, View } from 'react-native';

export default function NewChatScreen() {
  const params = useLocalSearchParams();
  const userUuid = params.userUuid as string;
  const username = params.username as string;
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    findOrCreateConversation();
  }, []);

  const findOrCreateConversation = async () => {
    try {
      // Validate params
      if (!userUuid || userUuid === 'undefined' || !username) {
        console.error('Invalid params:', { userUuid, username });
        Alert.alert('Error', 'Invalid user information');
        router.back();
        return;
      }

      // Get all conversations
      const conversations = await messagingService.getConversations();
      
      // Find existing conversation with this user
      const existing = conversations.find(
        c => c.other_user.uuid === userUuid
      );

      if (existing) {
        // Navigate to existing conversation
        router.replace({
          pathname: '/chat/[id]',
          params: {
            id: existing.uuid,
            username: existing.other_user.username,
            userUuid: existing.other_user.uuid,
          },
        });
      } else {
        // No existing conversation, go to compose screen
        router.replace({
          pathname: '/chat/compose',
          params: {
            username: username,
            userUuid: userUuid,
          },
        });
      }
    } catch (error: any) {
      console.error('Find conversation error:', error);
      Alert.alert('Error', 'Failed to start conversation');
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Icon Container */}
        <View style={styles.iconContainer}>
          <View style={styles.iconBackground}>
            <Ionicons name="chatbubbles" size={48} color="#0084FF" />
          </View>
          
          {/* Animated rings */}
          <View style={styles.ring1} />
          <View style={styles.ring2} />
        </View>

        {/* Loading Indicator */}
        <ActivityIndicator 
          size="large" 
          color="#0084FF" 
          style={styles.loader}
        />

        {/* Text */}
        <Text style={styles.loadingText}>Opening conversation...</Text>
        {username && (
          <Text style={styles.usernameText}>with {username}</Text>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark.background,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconBackground: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(0, 132, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0, 132, 255, 0.2)',
    zIndex: 3,
  },
  ring1: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: 'rgba(0, 132, 255, 0.15)',
    zIndex: 2,
  },
  ring2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: 'rgba(0, 132, 255, 0.08)',
    zIndex: 1,
  },
  loader: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  usernameText: {
    fontSize: 14,
    color: Colors.dark.placeholder,
  },
});