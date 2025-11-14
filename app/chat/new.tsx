import { Colors } from '@/constants/theme';
import { messagingService } from '@/src/services/api/messaging.service';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';

export default function NewChatScreen() {
  const params = useLocalSearchParams();
  const userUuid = params.userUuid as string;
  const username = params.username as string;

  useEffect(() => {
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
            username: existing.other_user.username, // Already have it
            userUuid: existing.other_user.uuid,     // Pass it along
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
      <ActivityIndicator size="large" color={Colors.dark.primary} />
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
});