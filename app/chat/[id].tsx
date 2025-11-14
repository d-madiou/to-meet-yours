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

export default function ChatScreen() {
  const params = useLocalSearchParams();
  const conversationId = params.id as string;
  const otherUsername = params.username as string;
  const otherUserUuid = params.userUuid as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');
  const [messageCost, setMessageCost] = useState<MessageCostCheck | null>(null);
  const [walletBalance, setWalletBalance] = useState(0);
  
  const flatListRef = useRef<FlatList>(null);

useEffect(() => {
  // If this is a new chat, redirect to the compose screen
  if (conversationId === 'new') {
    router.replace({
      pathname: '/chat/compose',
      params: {
        username: otherUsername,
        userUuid: otherUserUuid,  // Make sure this is passed correctly
      },
    });
    return;
  }

  // Validate that we have the required params
  if (!conversationId || !otherUserUuid) {
    Alert.alert('Error', 'Invalid conversation parameters');
    router.back();
    return;
  }

  loadInitialData();
}, [conversationId, otherUserUuid]);

  const loadInitialData = async () => {
    try {
      // Fetch all data in parallel for better performance
      const [user, messagesData, cost, wallet] = await Promise.all([
        authService.getCurrentUser(),
        messagingService.getConversationMessages(conversationId),
        messagingService.checkMessageCost(otherUserUuid),
        messagingService.getWalletBalance(),
      ]);

      setCurrentUserId(user.uuid);
      setMessages(messagesData.reverse()); // Reverse to show newest at bottom
      setMessageCost(cost);
      setWalletBalance(wallet.balance);
      
      // Mark as read
      await messagingService.markAsRead(conversationId);

    } catch (error: any) {
      console.error('Failed to load chat data:', error);
      Alert.alert('Error', 'Failed to load conversation.');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!messageText.trim()) return;

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
              // TODO: Navigate to coin purchase
              Alert.alert('Coming Soon', 'Coin purchase will be available soon!');
            },
          },
        ]
      );
      return;
    }

    setSending(true);
    const text = messageText;
    setMessageText(''); // Clear input immediately

    try {
      const response = await messagingService.sendMessage(otherUserUuid, text);
      
      // Add message to list
      setMessages([...messages, response.data]);
      
      // Update costs
      const [cost, wallet] = await Promise.all([
        messagingService.checkMessageCost(otherUserUuid),
        messagingService.getWalletBalance(),
      ]);
      setMessageCost(cost);
      setWalletBalance(wallet.balance);
      
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

    } catch (error: any) {
      setMessageText(text); // Restore text on error
      Alert.alert('Error', error.message);
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isMyMessage = item.sender.uuid === currentUserId;
    const showAvatar = !isMyMessage && (
      index === 0 || messages[index - 1].sender.uuid !== item.sender.uuid
    );

    return (
      <View
        style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer,
        ]}
      >
        {/* Avatar for other user */}
        {!isMyMessage && (
          <View style={styles.avatarContainer}>
            {showAvatar && item.sender.photo_url ? (
              <Image
                source={{ uri: item.sender.photo_url }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarSpacer} />
            )}
          </View>
        )}

        {/* Message Bubble */}
        <View
          style={[
            styles.messageBubble,
            isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isMyMessage ? styles.myMessageText : styles.otherMessageText,
            ]}
          >
            {item.content}
          </Text>
          <View style={styles.messageFooter}>
            <Text
              style={[
                styles.messageTime,
                isMyMessage ? styles.myMessageTime : styles.otherMessageTime,
              ]}
            >
              {new Date(item.created_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
            {item.coin_cost > 0 && (
              <View style={styles.coinBadge}>
                <Ionicons name="diamond" size={10} color={Colors.dark.primary} />
                <Text style={styles.coinText}>{item.coin_cost}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.dark.primary} />
      </View>
    );
  }

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

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.uuid}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Cost Warning */}
      {messageCost && !messageCost.is_free && (
        <View style={styles.costWarning}>
          <Ionicons name="information-circle" size={16} color={Colors.dark.primary} />
          <Text style={styles.costWarningText}>
            Next message costs {messageCost.coin_cost} coin(s)
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  myMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    width: 32,
    marginRight: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarSpacer: {
    width: 32,
    height: 32,
  },
  messageBubble: {
    maxWidth: '70%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  myMessageBubble: {
    backgroundColor: Colors.dark.primary,
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: Colors.dark.inputBackground,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: Colors.dark.text,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  messageTime: {
    fontSize: 11,
  },
  myMessageTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  otherMessageTime: {
    color: Colors.dark.placeholder,
  },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  coinText: {
    fontSize: 10,
    color: Colors.dark.primary,
    fontWeight: '600',
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
});