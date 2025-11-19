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
  Animated,
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
  const [otherUsername, setOtherUsername] = useState(params.username as string);
  const [otherUserUuid, setOtherUserUuid] = useState(params.userUuid as string);

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');
  const [messageCost, setMessageCost] = useState<MessageCostCheck | null>(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [isOnline] = useState(true); // mock

  const flatListRef = useRef<FlatList>(null);
  const sendScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!conversationId) return;
    loadInitialData();
  }, [conversationId]);

  const loadInitialData = async () => {
    try {
      // First, get all conversations to find the 'other user' in this one
      const conversations = await messagingService.getConversations();
      const currentConversation = conversations.find(c => c.uuid === conversationId);
      if (!currentConversation) throw new Error('Conversation not found');

      const otherUser = currentConversation.other_user;
      setOtherUsername(otherUser.username);
      setOtherUserUuid(otherUser.uuid);

      // Now fetch all data in parallel
      const [user, messagesData, cost, wallet] = await Promise.all([
        authService.getCurrentUser(),
        messagingService.getConversationMessages(conversationId),
        messagingService.checkMessageCost(otherUser.uuid),
        messagingService.getWalletBalance(),
      ]);

      setCurrentUserId(user.uuid);
      setMessages(messagesData.reverse());
      setMessageCost(cost);
      setWalletBalance(wallet.balance);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load conversation.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const animateSend = () => {
    Animated.sequence([
      Animated.timing(sendScale, { toValue: 0.9, duration: 100, useNativeDriver: true }),
      Animated.timing(sendScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const handleSend = async () => {
  if (!messageText.trim()) return;

  // Check if message costs coins and user has insufficient balance
  if (messageCost && !messageCost.is_free && walletBalance < messageCost.coin_cost) {
    // Show upgrade modal instead of simple alert
    Alert.alert(
      '💎 Need More Coins',
      `You need ${messageCost.coin_cost} coin(s) to send this message.\n\nCurrent balance: ${walletBalance} coin(s)\nFree messages used: ${messageCost.free_messages_limit - (messageCost.free_messages_remaining || 0)}/${messageCost.free_messages_limit}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Get Coins', 
          onPress: () => {
            // Navigate to coin purchase screen
            router.push({
              pathname: '/wallet/purchase',
              params: { 
                returnTo: `/chat/${conversationId}`,
                minCoins: messageCost.coin_cost 
              }
            });
          }
        },
      ]
    );
    return;
  }

  animateSend();
  setSending(true);
  const text = messageText.trim();
  setMessageText('');

  try {
    const response = await messagingService.sendMessage(otherUserUuid, text);
    setMessages(prev => [...prev, response.data]);

    // Update cost and balance after successful send
    const [cost, wallet] = await Promise.all([
      messagingService.checkMessageCost(otherUserUuid),
      messagingService.getWalletBalance(),
    ]);
    setMessageCost(cost);
    setWalletBalance(wallet.balance);

    // Show success notification if coins were spent
    if (response.coin_cost > 0) {
      // Optional: Show a small toast notification
      Alert.alert(
        'Message Sent',
        `${response.coin_cost} coin(s) deducted. New balance: ${wallet.balance}`,
        [{ text: 'OK' }],
        { cancelable: true }
      );
    }

    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  } catch (error: any) {
    setMessageText(text);
    
    // Check if error is due to insufficient coins
    if (error.message?.includes('Insufficient coins')) {
      Alert.alert(
        '💎 Insufficient Coins',
        error.message,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Get Coins', 
            onPress: () => router.push('/wallet/purchase')
          },
        ]
      );
    } else {
      Alert.alert('Error', error.message || 'Failed to send message');
    }
  } finally {
    setSending(false);
  }
};

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    // The backend may sometimes return `uuid` or `id` for the sender.
    // Normalize to string and compare against the current user id to determine
    // whether a message was sent by the current user.
    const senderIdStr = String(item.sender?.uuid ?? item.sender?.id ?? '');
    const currentUserIdStr = String(currentUserId ?? '');
    const isMyMessage = !!currentUserIdStr && senderIdStr === currentUserIdStr;
    const prev = messages[index - 1];
    const next = messages[index + 1];
    const isFirst = !prev || prev.sender.uuid !== item.sender.uuid;
    const isLast = !next || next.sender.uuid !== item.sender.uuid;

    return (
      <View style={[styles.messageRow, isMyMessage ? styles.rowRight : styles.rowLeft]}>
        {/* Avatar - only for receiver, first in group */}
        {!isMyMessage && isFirst && (
          <Image source={item.sender.photo_url ? { uri: item.sender.photo_url } : undefined} style={styles.avatar} />
        )}
        {!isMyMessage && !isFirst && <View style={styles.avatarSpacer} />}

        {/* Bubble */}
        <View
          style={[
            styles.bubble,
            isMyMessage ? styles.myBubble : styles.otherBubble,
            isFirst && (isMyMessage ? styles.myFirst : styles.otherFirst),
            isLast && (isMyMessage ? styles.myLast : styles.otherLast),
          ]}
        >
          <Text style={[styles.msgText, isMyMessage ? styles.myText : styles.otherText]}>
            {item.content}
          </Text>

          <View style={styles.meta}>
            <Text style={[styles.time, isMyMessage ? styles.myTime : styles.otherTime]}>
              {new Date(item.created_at).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              }).replace(' ', '').toLowerCase()}
            </Text>

            {isMyMessage && (
              <Ionicons
                name={item.delivered ? 'checkmark-done' : 'checkmark'}
                size={14}
                color={item.delivered ? '#4FC3F7' : 'rgba(255,255,255,0.6)'}
                style={{ marginLeft: 4 }}
              />
            )}

            {messageCost && (
              <View style={styles.costContainer}>
                {messageCost.is_free ? (
                  <View style={styles.freeMessagesBar}>
                    <Ionicons name="gift" size={16} color="#4CAF50" />
                    <Text style={styles.freeMessagesText}>
                      {messageCost.free_messages_remaining} free message{messageCost.free_messages_remaining !== 1 ? 's' : ''} left today (all conversations)
                    </Text>
                  </View>
                ) : (
                  <View style={styles.paidMessagesBar}>
                    <Ionicons name="alert-circle" size={16} color="#FF9F0A" />
                    <Text style={styles.costMsg}>
                      Next message costs <Text style={styles.costAmount}>{messageCost.coin_cost}</Text> coin{messageCost.coin_cost > 1 ? 's' : ''}
                    </Text>
                    <TouchableOpacity
                      style={styles.getCoinsBtn}
                      onPress={() => router.push('/wallet/purchase')}
                    >
                      <Ionicons name="diamond" size={14} color="#FFF" />
                      <Text style={styles.getCoinsText}>Get Coins</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.dark.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={styles.username}>{otherUsername}</Text>
          <Text style={styles.status}>{isOnline ? 'Online' : 'Last seen recently'}</Text>
        </View>

        <View style={styles.coinBadge}>
          <Ionicons name="diamond" size={16} color="#FF9F0A" />
          <Text style={styles.balance}>{walletBalance}</Text>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.uuid}
        renderItem={renderMessage}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
      />

      {/* Calculate Cost Warning */}
      {messageCost && !messageCost.is_free && (
        <View style={styles.costBar}>
          <Ionicons name="alert-circle" size={16} color="#FF9F0A" />
          <Text style={styles.costMsg}>
            Next message costs <Text style={{ fontWeight: '700' }}>{messageCost.coin_cost}</Text> coin{messageCost.coin_cost > 1 ? 's' : ''}
          </Text>
        </View>
      )}

      {/* Input */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#8E8E93"
          value={messageText}
          onChangeText={setMessageText}
          multiline
          maxLength={1000}
        />
        <Animated.View style={{ transform: [{ scale: sendScale }] }}>
          <TouchableOpacity
            style={[
              styles.sendBtn,
              (!messageText.trim() || sending) && styles.sendBtnDisabled,
            ]}
            onPress={handleSend}
            disabled={!messageText.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size={20} color="#FFF" />
            ) : (
              <Ionicons name="send" size={20} color="#FFF" />
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}

/* ====================== STYLES ====================== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: '#111',
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C1E',
  },
  backBtn: { padding: 8 },
  headerInfo: { flex: 1, marginLeft: 8 },
  username: { fontSize: 17, fontWeight: '600', color: '#FFF' },
  status: { fontSize: 13, color: '#8E8E93', marginTop: 2 },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  balance: { color: '#FFF', fontWeight: '600', fontSize: 14 },

  // Messages
  list: { paddingVertical: 16, paddingHorizontal: 12 },

  messageRow: { flexDirection: 'row', marginBottom: 8, alignItems: 'flex-end' },
  rowLeft: { justifyContent: 'flex-start' },
  rowRight: { justifyContent: 'flex-end' },

  avatar: { width: 36, height: 36, borderRadius: 18, marginRight: 8 },
  avatarSpacer: { width: 44 },

  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 18,
    marginHorizontal: 2,
  },
  myBubble: { backgroundColor: '#0084FF' },
  otherBubble: { backgroundColor: '#2C2C2E', borderWidth: 0.5, borderColor: '#3A3A3C' },

  // Corner tweaks for message grouping
  myFirst: { borderTopRightRadius: 6 },
  myLast: { borderBottomRightRadius: 6 },
  otherFirst: { borderTopLeftRadius: 6 },
  otherLast: { borderBottomLeftRadius: 6 },

  msgText: { fontSize: 15.5, lineHeight: 21 },
  myText: { color: '#FFF' },
  otherText: { color: '#E5E5EA' },

  meta: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
  time: { fontSize: 11.5, fontWeight: '500' },
  myTime: { color: 'rgba(255,255,255,0.7)' },
  otherTime: { color: 'rgba(229,229,234,0.6)' },

  coinTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,159,10,0.15)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
    gap: 2,
  },
  myCoinTag: { backgroundColor: 'rgba(255,255,255,0.25)' },
  coinNum: { fontSize: 10, fontWeight: '600', color: '#FF9F0A' },

  // Cost warning
  costBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,159,10,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,159,10,0.2)',
    gap: 6,
  },
  costMsg: { fontSize: 13.5, color: '#FF9F0A', fontWeight: '500' },

  // Input
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#111',
    borderTopWidth: 1,
    borderTopColor: '#1C1C1E',
  },
  input: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    color: '#FFF',
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 22,
    maxHeight: 100,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0084FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0084FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  costContainer: {
    backgroundColor: Colors.dark.inputBackground,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.inputBorder,
  },
  
  freeMessagesBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  
  freeMessagesText: {
    flex: 1,
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: '500',
  },
  
  paidMessagesBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: 'rgba(255, 159, 10, 0.1)',
  },
  
  costMsg: {
    flex: 1,
    fontSize: 13,
    color: '#FF9F0A',
  },
  
  costAmount: {
    fontWeight: '700',
    color: '#FF9F0A',
  },
  
  getCoinsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  
  getCoinsText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  sendBtnDisabled: { backgroundColor: '#555', shadowOpacity: 0, elevation: 0 },
});