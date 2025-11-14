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
    Image,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
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
    const response = await messagingService.sendMessage(otherUserUuid, text);
    
    // The response should include the conversation data
    // We need to fetch conversations to get the UUID
    const conversations = await messagingService.getConversations();
    
    // Find the conversation with this user
    const conversation = conversations.find(
      conv => conv.other_user.uuid === otherUserUuid
    );

    if (conversation) {
      // Redirect to the actual chat screen
      router.replace({
        pathname: '/chat/[id]',
        params: {
          id: conversation.uuid,
          username: otherUsername,
          userUuid: otherUserUuid,
        },
      });
    } else {
      // If conversation not found, just go back to messages
      Alert.alert('Success', 'Message sent!');
      router.replace('/(tabs)/messages');
    }

  } catch (error: any) {
    setMessageText(text); // Restore text on error
    Alert.alert('Error', error.message);
  } finally {
    setSending(false);
  }
};

  // This screen doesn't render existing messages, only the input
  const renderMessage = () => null;

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

      {/* Messages Area - show a prompt */}
      <View style={styles.promptContainer}>
        <Image source={{ uri: 'https://via.placeholder.com/100' }} style={styles.promptAvatar} />
        <Text style={styles.promptText}>
          You are starting a new conversation with {otherUsername}.
        </Text>
      </View>

      {/* Cost Warning */}
      {messageCost && !messageCost.is_free && (
        <View style={styles.costWarning}>
          <Ionicons name="information-circle" size={16} color={Colors.dark.primary} />
          <Text style={styles.costWarningText}>
            First message costs {messageCost.coin_cost} coin(s)
          </Text>
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
    padding: 20,
  },
  promptAvatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      marginBottom: 20,
  },
  promptText: {
      color: Colors.dark.placeholder,
      fontSize: 16,
      textAlign: 'center',
  },
  costWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 159, 10, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  costWarningText: {
    fontSize: 12,
    color: Colors.dark.primary,
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
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.dark.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  messageContainer: {},
  myMessageContainer: {},
  otherMessageContainer: {},
  avatarContainer: {},
  avatar: {},
  avatarSpacer: {},
  messageBubble: {},
  myMessageBubble: {},
  otherMessageBubble: {},
  messageText: {},
  myMessageText: {},
  otherMessageText: {},
  messageFooter: {},
  messageTime: {},
  myMessageTime: {},
  otherMessageTime: {},
  coinBadge: {},
  coinText: {},
  centerContainer: {},
  messagesList: {},
});