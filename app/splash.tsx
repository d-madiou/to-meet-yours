import { useAuth } from '@/app/(tabs)/AuthContext';
import { Colors } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';

const LOGO_IMAGE = require('../assets/Splash2.png');

export default function SplashScreen() {
  const { isAuthenticated, isProfileComplete, isLoadingAuth } = useAuth();
  const router = useRouter();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (isLoadingAuth) return; // Wait until auth state is known

    // Parallel animations for logo
    Animated.parallel([
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      // Scale up with bounce
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      // Slide up text
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Redirect after animation
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Navigate based on auth state
        if (isAuthenticated && isProfileComplete) {
          router.replace('/(tabs)');
        } else {
          router.replace('/firstPage');
        }
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, [isLoadingAuth, isAuthenticated, isProfileComplete, router]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[
          'rgba(162, 14, 59, 1)', // Dark at top
          'rgba(255, 5, 68, 0.9)', // Subtle red in middle
          'rgba(162, 14, 59, 1)',     // Dark at bottom
        ]}
        style={styles.gradient}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Logo with pulse animation */}
          <View style={styles.logoContainer}>
            <View style={styles.logoGlow} />
            <Image source={LOGO_IMAGE} style={styles.logo} resizeMode="contain" />
          </View>

          {/* Text with slide animation */}
          <Animated.View
            style={[
              styles.textContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.title}>To Meet Yours</Text>
            <Text style={styles.subtitle}>Connect • Love • Thrive</Text>
            
            {/* Loading indicator */}
            <View style={styles.loadingContainer}>
              <Animated.View
                style={[
                  styles.loadingDot,
                  {
                    opacity: fadeAnim,
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.loadingDot,
                  {
                    opacity: fadeAnim,
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.loadingDot,
                  {
                    opacity: fadeAnim,
                  },
                ]}
              />
            </View>
          </Animated.View>
        </Animated.View>

        {/* Bottom accent */}
        <View style={styles.bottomAccent}>
          <View style={styles.accentLine} />
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  logoGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.dark.primary,
    opacity: 0.15,
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 40,
  },
  logo: {
    width: 140,
    height: 140,
    zIndex: 1,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 8,
    textAlign: 'center',
    letterSpacing: 2,
    fontWeight: '300',
  },
  loadingContainer: {
    flexDirection: 'row',
    marginTop: 40,
    gap: 8,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.dark.secondary,
  },
  bottomAccent: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
  },
  accentLine: {
    width: 60,
    height: 3,
    backgroundColor: Colors.dark.secondary,
    borderRadius: 2,
  },
});