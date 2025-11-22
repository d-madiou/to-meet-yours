/*  NewChatScreen.tsx  */
import { Colors } from '@/constants/theme';
import { messagingService } from '@/src/services/api/messaging.service';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  StyleSheet,
  Text,
  View,
} from 'react-native';

interface Params {
  userUuid?: string;
  username?: string;
}

/* --------------------------------------------------------------- */
export default function NewChatScreen() {
  const raw = useLocalSearchParams() as Params;
  const userUuid = raw.userUuid;
  const username = raw.username;

  // Fade-in for the whole card
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Ring pulse animation
  const ring1Anim = useRef(new Animated.Value(1)).current;
  const ring2Anim = useRef(new Animated.Value(1)).current;

  /* ---------- Fade-in ---------- */
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  /* ---------- Ring pulse loop ---------- */
  useEffect(() => {
    const pulse = (anim: Animated.Value) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1.3,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );

    const a1 = pulse(ring1Anim);
    const a2 = pulse(ring2Anim);
    a1.start();
    a2.start();

    return () => {
      a1.stop();
      a2.stop();
    };
  }, [ring1Anim, ring2Anim]);

  /* ---------- Find / create conversation ---------- */
  useEffect(() => {
    const go = async () => {
      // ---- validation ----
      if (!userUuid || userUuid === 'undefined' || !username) {
        console.warn('Invalid navigation params →', { userUuid, username });
        Alert.alert('Error', 'Missing user information');
        router.back();
        return;
      }

      try {
        const convs = await messagingService.getConversations();

        const existing = convs.find(c => c.other_user.uuid === userUuid);
        if (existing) {
          router.replace({
            pathname: '/chat/[id]',
            params: {
              id: existing.uuid,
              username: existing.other_user.username,
              userUuid: existing.other_user.uuid,
            },
          });
        } else {
          // Use the fixed compose screen while repairing the original compose.tsx
          router.replace({
            pathname: '/chat/compose_fix',
            params: { userUuid, username },
          });
        }
      } catch (err: any) {
        console.error('NewChatScreen →', err);
        Alert.alert('Error', err.message ?? 'Failed to start chat');
        router.back();
      }
    };

    // tiny delay so the fade-in finishes before navigation
    const tid = setTimeout(go, 350);
    return () => clearTimeout(tid);
  }, [userUuid, username]);

  /* --------------------------------------------------------------- */
  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* ---------- Icon + pulsing rings ---------- */}
        <View style={styles.iconWrapper} accessibilityLabel="Starting chat">
          <Animated.View
            style={[
              styles.ring,
              styles.ring1,
              { transform: [{ scale: ring1Anim }] },
            ]}
          />
          <Animated.View
            style={[
              styles.ring,
              styles.ring2,
              { transform: [{ scale: ring2Anim }] },
            ]}
          />
          <View style={styles.iconBg}>
            <Ionicons name="chatbubbles" size={48} color={Colors.dark.primary} />
          </View>
        </View>

        {/* ---------- Loader ---------- */}
        <ActivityIndicator
          size="large"
          color={Colors.dark.primary}
          style={styles.loader}
        />

        {/* ---------- Text ---------- */}
        <Text style={styles.title}>Opening conversation…</Text>
        {username && <Text style={styles.subtitle}>with {username}</Text>}
      </Animated.View>
    </View>
  );
}

/* --------------------------------------------------------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { alignItems: 'center' },

  /* ----- Icon + rings ----- */
  iconWrapper: {
    position: 'relative',
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconBg: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(0,132,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0,132,255,0.2)',
    zIndex: 3,
  },
  ring: {
    position: 'absolute',
    borderRadius: 60,
    borderWidth: 2,
    borderColor: Colors.dark.primary,
    opacity: 0.2,
  },
  ring1: { width: 110, height: 110 },
  ring2: { width: 120, height: 120 },

  loader: { marginBottom: 16 },

  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.dark.placeholder,
  },
});