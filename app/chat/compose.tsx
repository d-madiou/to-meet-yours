import { Colors } from '@/constants/theme';
import { authService } from '@/src/services/api/auth.service';
import { messagingService } from '@/src/services/api/messaging.service';
import { Message, MessageCostCheck } from '@/src/types/messaging.types';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function ComposeChatScreen() {
  const params = useLocalSearchParams();
  const otherUsername = params.username as string;
  const otherUserUuid = params.userUuid as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');
  const [messageCost, setMessageCost] = useState<MessageCostCheck | null>(null);
  const [walletBalance, setWalletBalance] = useState(0);
  
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const user = await authService.getCurrentUser();
      setCurrentUserId(user.uuid);

      const [cost, wallet] = await Promise.all([
        messagingService.checkMessageCost(otherUserUuid),
        messagingService.getWalletBalance(),
      ]);
      
      setMessageCost(cost);
      setWalletBalance(wallet.balance);
    } catch (error) {
      console.error('Load initial data error:', error);
      Alert.alert('Error', 'Failed to start new conversation.');
      router.back();
    }
  };

  const handleSend = async () => {
    if (!messageText.trim()) return;

    // Validate we have the other user's UUID
    if (!otherUserUuid || otherUserUuid === 'undefined') {
      Alert.alert('Error', 'Invalid user. Please try again.');
      router.back();
      return;
    }

    // Check if user needs coins
    if (messageCost && !messageCost.is_free && walletBalance < messageCost.coin_cost) {
      Alert.alert(
        'Insufficient Coins',
        `You need ${messageCost.coin_cost} coin(s) to send this message. Your balance: ${walletBalance}`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Get Coins',
            onPress: () => {
              Alert.alert('Coming Soon', 'Coin purchase will be available soon!');
            },
          },
        ]
      );
      return;
    }

    setSending(true);
    const text = messageText;
    setMessageText('');

    try {
      // Send the message
      const response = await messagingService.sendMessage(otherUserUuid, text);
      
      console.log('Message sent successfully');

      // Wait a moment for backend to process
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Use the helper function to find conversation
      const conversation = await messagingService.getConversationWithUser(otherUserUuid);

      if (conversation) {
        console.log('Found conversation:', conversation.uuid);
        
        // Navigate to the chat screen
        router.replace({
          pathname: '/chat/[id]',
          params: {
            id: conversation.uuid,
            username: otherUsername,
            userUuid: otherUserUuid,
          },
        });
      } else {
        console.error('Conversation not found for user:', otherUserUuid);
        
        Alert.alert(
          'Message Sent',
          'Your message was sent successfully. Redirecting to messages...',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(tabs)/messages'),
            },
          ]
        );
      }
    } catch (error: any) {
      setMessageText(text);
      Alert.alert('Error', error.message || 'Failed to send message');
      console.error('Send message error:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.dark.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{otherUsername}</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.coinButton}>
            <Ionicons name="diamond-outline" size={20} color={Colors.dark.primary} />
            <Text style={styles.coinBalance}>{walletBalance}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages Area - show a welcoming prompt */}
      <View style={styles.promptContainer}>
        <View style={styles.iconContainer}>
          <Ionicons name="chatbubbles" size={64} color={Colors.dark.primary} />
        </View>
        <Text style={styles.promptTitle}>New Conversation</Text>
        <Text style={styles.promptText}>
          Start chatting with {otherUsername}
        </Text>
        <Text style={styles.promptSubtext}>
          Send your first message to begin the conversation
        </Text>
        
        {/* Fun emoji decoration */}
        <View style={styles.emojiRow}>
          <Text style={styles.emoji}>👋</Text>
          <Text style={styles.emoji}>💬</Text>
          <Text style={styles.emoji}>✨</Text>
        </View>
      </View>

      {/* Cost Warning */}
      {messageCost && !messageCost.is_free && (
        <View style={styles.costWarning}>
          <View style={styles.costWarningContent}>
            <Ionicons name="information-circle" size={18} color={Colors.dark.primary} />
            <View style={styles.costWarningTextContainer}>
              <Text style={styles.costWarningTitle}>Message Cost</Text>
              <Text style={styles.costWarningText}>
                First message costs {messageCost.coin_cost} coin{messageCost.coin_cost > 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor={Colors.dark.placeholder}
          value={messageText}
          onChangeText={setMessageText}
          multiline
          maxLength={1000}
          autoFocus
        />
        <TouchableOpacity
          style={[styles.sendButton, (!messageText.trim() || sending) && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!messageText.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="send" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.inputBorder,
    backgroundColor: Colors.dark.background,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 80,
    alignItems: 'flex-end',
  },
  coinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.inputBackground,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  coinBalance: {
    color: Colors.dark.text,
    fontSize: 14,
    fontWeight: '600',
  },
  promptContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0, 132, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(0, 132, 255, 0.2)',
  },
  promptTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  promptText: {
    color: Colors.dark.text,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 4,
  },
  promptSubtext: {
    color: Colors.dark.placeholder,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  emojiRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  emoji: {
    fontSize: 32,
    opacity: 0.8,
  },
  costWarning: {
    backgroundColor: 'rgba(0, 132, 255, 0.08)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(0, 132, 255, 0.15)',
  },
  costWarningContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  costWarningTextContainer: {
    flex: 1,
  },
  costWarningTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 2,
  },
  costWarningText: {
    fontSize: 12,
    color: Colors.dark.placeholder,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: Colors.dark.background,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.inputBorder,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.dark.inputBackground,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.dark.text,
    maxHeight: 100,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.dark.inputBorder,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0084FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0084FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sendButtonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
});