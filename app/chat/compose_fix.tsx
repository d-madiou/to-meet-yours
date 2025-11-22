import { Colors } from '@/constants/theme';
import { messagingService } from '@/src/services/api/messaging.service';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface Params {
  userUuid?: string;
  username?: string;
}

export default function ComposeScreen() {
  const raw = useLocalSearchParams() as Params;
  const userUuid = (raw.userUuid || (raw as any).user_uuid || (raw as any).id) as string | undefined;
  const username = (raw.username || (raw as any).user || (raw as any).name) as string | undefined;

  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
  }, [fadeAnim]);

  useEffect(() => {
    if (!userUuid || userUuid === 'undefined' || !username) {
      console.warn('Compose missing params', { userUuid, username });
      Alert.alert('Error', 'Missing user information');
      router.back();
    }
  }, [userUuid, username]);

  const handleSend = async () => {
    const content = text.trim();
    if (!content) return Alert.alert('Error', 'Please type a message');

    if (!userUuid) {
      Alert.alert('Error', 'Missing recipient id');
      return;
    }

    setLoading(true);

    try {
      const sendPromise = messagingService.sendMessage(userUuid, content);
      const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('Request timed out')), 12000));
      const response = await Promise.race([sendPromise, timeout]) as any;

      let conv = null as any;
      const attempts = 6;
      for (let i = 0; i < attempts; i++) {
        conv = await messagingService.getConversationWithUser(userUuid);
        if (conv) break;
        await new Promise(res => setTimeout(res, 500));
      }

      if (conv) {
        router.replace({ pathname: '/chat/[id]', params: { id: conv.uuid, username: conv.other_user.username, userUuid: conv.other_user.uuid } });
        return;
      }

      if (response && response.data) {
        Alert.alert('Sent', 'Message sent, opening conversations...');
        router.replace({ pathname: '/(tabs)/messages' });
        return;
      }

      Alert.alert('Error', 'Failed to open conversation');
      router.back();
    } catch (err: any) {
      console.error('Compose send error', err);
      Alert.alert('Error', err.message ?? 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.card, { opacity: fadeAnim }]}> 
        <View style={styles.header}>
          <Ionicons name="chatbubbles" size={32} color={Colors.dark.primary} />
          <Text style={styles.title}>New message</Text>
        </View>

        <Text style={styles.to}>To: {username}</Text>

        <TextInput
          style={styles.input}
          placeholder={`Say hi to ${username}...`}
          placeholderTextColor="#9A9A9A"
          value={text}
          onChangeText={setText}
          multiline
          maxLength={1000}
        />

        <View style={styles.actions}>
          <TouchableOpacity style={styles.cancel} onPress={() => router.back()} disabled={loading}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.send} onPress={handleSend} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.sendText}>Send</Text>}
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background, padding: 16 },
  card: { backgroundColor: Colors.dark.inputBackground, borderRadius: 12, padding: 16, marginTop: 48 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  title: { fontSize: 18, fontWeight: '600', color: Colors.dark.text },
  to: { color: Colors.dark.placeholder, marginBottom: 8 },
  input: { minHeight: 100, maxHeight: 220, backgroundColor: '#0F0F10', color: '#FFF', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#1E1E1F' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12, gap: 8 },
  cancel: { paddingVertical: 10, paddingHorizontal: 14 },
  cancelText: { color: Colors.dark.placeholder },
  send: { backgroundColor: Colors.dark.primary, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8 },
  sendText: { color: '#FFF', fontWeight: '600' },
});
