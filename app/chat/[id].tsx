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
  
  // State for UI Data
  const [otherUsername, setOtherUsername] = useState(params.username as string);
  const [otherUserUuid, setOtherUserUuid] = useState(params.userUuid as string);
  
  // Messages and Logic State
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState('');
  
  // User Data State (Required for Optimistic Updates to show your own avatar/name immediately)
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState('');

  // Economics State
  const [messageCost, setMessageCost] = useState<MessageCostCheck | null>(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [isOnline] = useState(true); // Mock status

  // Refs
  const flatListRef = useRef<FlatList>(null);
  const sendScale = useRef(new Animated.Value(1)).current;
  const pollRef = useRef<any>(null);

  useEffect(() => {
    if (!conversationId) return;
    loadInitialData();
    // Start polling for new messages while the chat is open
    startPolling();

    return () => {
      // Cleanup polling on unmount
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [conversationId]);

  const startPolling = () => {
    // Avoid creating multiple intervals
    if (pollRef.current) return;

    pollRef.current = setInterval(async () => {
      try {
        const msgs = await messagingService.getConversationMessages(conversationId);
        const ordered = msgs.reverse();

        setMessages(prev => {
          // Build a set of existing uuids to quickly detect new messages
          const existing = new Set(prev.map(m => m.uuid));
          const newOnes = ordered.filter(m => !existing.has(m.uuid));
          if (newOnes.length === 0) return prev;

          // Append new messages (they are already oldest->newest)
          const merged = [...prev, ...newOnes];

          // Mark conversation read when new messages arrive and we are viewing it
          (async () => {
            try {
              await messagingService.markAsRead(conversationId);
            } catch (e) {
              console.warn('markAsRead failed in poll:', e);
            }
          })();

          return merged;
        });
      } catch (err) {
        // Ignore polling errors silently
      }
    }, 2000);
  };

  const loadInitialData = async () => {
    try {
      // 1. Get Conversation Details to identify the "Other User"
      const conversations = await messagingService.getConversations();
      const currentConversation = conversations.find(c => c.uuid === conversationId);
      if (!currentConversation) throw new Error('Conversation not found');

      const otherUser = currentConversation.other_user;
      setOtherUsername(otherUser.username);
      setOtherUserUuid(otherUser.uuid);

      // 2. Parallel Fetch: User Info, Messages, Costs, Wallet
      const [user, messagesData, cost, wallet] = await Promise.all([
        authService.getCurrentUser(),
        messagingService.getConversationMessages(conversationId),
        messagingService.checkMessageCost(otherUser.uuid),
        messagingService.getWalletBalance(),
      ]);

      // 3. Store Data
      setCurrentUser(user);          // Save full user object for optimistic UI
      setCurrentUserId(user.uuid);   // Save ID for logic checks
      // Ensure messages are in chronological order (oldest -> newest)
      const ordered = messagesData.reverse();
      setMessages(ordered);
      // Mark conversation as read on open and update local messages to 'read'
      try {
        await messagingService.markAsRead(conversationId);
        // Optimistically mark messages as read locally so UI reflects backend
        setMessages(prev => prev.map(m => ({ ...m, is_read: true, read_at: m.read_at || new Date().toISOString() })));
      } catch (err) {
        // Non-fatal — log and continue
        console.warn('Failed to mark conversation as read:', err);
      }
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

  // Animation for the send button
  const animateSend = () => {
    Animated.sequence([
      Animated.timing(sendScale, { toValue: 0.9, duration: 100, useNativeDriver: true }),
      Animated.timing(sendScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  // =====================================================
  // THE FIX: Optimistic "Instant" Send Logic
  // =====================================================
  const handleSend = async () => {
    const text = messageText.trim();
    if (!text) return;

    // 1. Wallet Check (Pre-flight)
    if (messageCost && !messageCost.is_free && walletBalance < messageCost.coin_cost) {
      Alert.alert(
        '💎 Need More Coins',
        `You need ${messageCost.coin_cost} coins. Balance: ${walletBalance}`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Get Coins', 
            onPress: () => router.push({ pathname: '/wallet/purchase', params: { returnTo: `/chat/${conversationId}` } }) 
          },
        ]
      );
      return;
    }

    animateSend();
    setSending(true);

    // 2. OPTIMISTIC UPDATE: Create a fake message to show IMMEDIATELY
    const tempId = `temp-${Date.now()}`; // Temporary ID
    const optimisticMessage: Message = {
      uuid: tempId,
      content: text,
      sender: {
        uuid: currentUserId,
        username: currentUser?.username || 'You',
        photo_url: currentUser?.photo_url || null,
        id: currentUserId
      },
      created_at: new Date().toISOString(),
      delivered: false, // We use this to show the "Clock" icon
      is_read: false,
      read_at: null,
      coin_cost: messageCost?.coin_cost ?? 0,
      receiver: { uuid: otherUserUuid, username: otherUsername || '', photo_url: null }
    };

    // 3. Update UI instantly (don't wait for server)
    setMessages(prev => [...prev, optimisticMessage]);
    setMessageText(''); // Clear input immediately
    
    // Scroll to bottom smoothly
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);

    try {
      // 4. Send to Server in Background
      const response = await messagingService.sendMessage(otherUserUuid, text);

      // 5. SUCCESS: Replace the 'temp' message with the 'real' message from server
      setMessages(prev => 
        prev.map(msg => 
          msg.uuid === tempId ? { ...response.data, delivered: true } : msg
        )
      );

      // 6. Update Wallet/Cost silently in background
      const [cost, wallet] = await Promise.all([
        messagingService.checkMessageCost(otherUserUuid),
        messagingService.getWalletBalance(),
      ]);
      setMessageCost(cost);
      setWalletBalance(wallet.balance);

    } catch (error: any) {
      // 7. ERROR: Revert UI changes
      console.error("Send failed", error);
      
      // Remove the temporary message
      setMessages(prev => prev.filter(msg => msg.uuid !== tempId));
      
      // Put the text back in the input so the user doesn't lose it
      setMessageText(text); 
      
      // Show specific error
      if (error.message?.includes('Insufficient coins')) {
        Alert.alert('💎 Insufficient Coins', error.message);
      } else {
        Alert.alert('Error', 'Message failed to send. Please try again.');
      }
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const senderIdStr = String(item.sender?.uuid ?? item.sender?.id ?? '');
    const currentUserIdStr = String(currentUserId ?? '');
    const isMyMessage = !!currentUserIdStr && senderIdStr === currentUserIdStr;
    
    // Check if this is a temporary (optimistic) message
    const isPending = item.uuid.toString().startsWith('temp-');

    const prev = messages[index - 1];
    const next = messages[index + 1];
    const isFirst = !prev || prev.sender.uuid !== item.sender.uuid;
    const isLast = !next || next.sender.uuid !== item.sender.uuid;

    return (
      <View style={[styles.messageRow, isMyMessage ? styles.rowRight : styles.rowLeft]}>
        {/* Avatar (Only for receiver) */}
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
            // Make bubble slightly transparent if pending
            isPending && { opacity: 0.7 }
          ]}
        >
          <Text style={[styles.msgText, isMyMessage ? styles.myText : styles.otherText]}>
            {item.content}
          </Text>

          <View style={styles.meta}>
            <Text style={[styles.time, isMyMessage ? styles.myTime : styles.otherTime]}>
              {new Date(item.created_at).toLocaleTimeString('en-US', {
                hour: 'numeric', minute: '2-digit', hour12: true,
              }).replace(' ', '').toLowerCase()}
            </Text>

            {/* Status Icons: Clock (Pending) vs Checkmarks (Sent) */}
            {isMyMessage && (
              <Ionicons
                name={isPending ? 'time-outline' : (item.delivered ? 'checkmark-done' : 'checkmark')}
                size={14}
                color={isPending ? '#ddd' : (item.delivered ? '#4FC3F7' : 'rgba(255,255,255,0.6)')}
                style={{ marginLeft: 4 }}
              />
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
          <Text style={styles.status}>{isOnline ? 'Online' : 'Offline'}</Text>
        </View>

        <View style={styles.coinBadge}>
          <Ionicons name="diamond" size={16} color="#FF9F0A" />
          <Text style={styles.balance}>{walletBalance}</Text>
        </View>
      </View>

      {/* Message List */}
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

      {/* Cost Warning Banner */}
      {messageCost && !messageCost.is_free && (
        <View style={styles.costBar}>
          <Ionicons name="alert-circle" size={16} color="#FF9F0A" />
          <Text style={styles.costMsg}>
            Next message costs <Text style={{ fontWeight: '700' }}>{messageCost.coin_cost}</Text> coin{messageCost.coin_cost > 1 ? 's' : ''}
          </Text>
        </View>
      )}

      {/* Input Area */}
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
              (!messageText.trim() && !sending) && styles.sendBtnDisabled, // Allow clicking while "sending" isn't technically true for optim UI, but prevent empty
            ]}
            onPress={handleSend}
            disabled={!messageText.trim()}
          >
             {/* Always show Send icon because 'sending' state is handled optimistically now */}
            <Ionicons name="send" size={20} color="#FFF" />
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
  
  // Rounding logic
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

  // Cost Bar
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
  },
  sendBtnDisabled: { backgroundColor: '#555', opacity: 0.6 },
});