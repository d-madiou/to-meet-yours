import { Colors } from '@/constants/theme';
import { authService } from '@/src/services/api/auth.service';
import { profileService } from '@/src/services/api/profile.service';
import { notificationService } from '@/src/services/notification.service'; // ✅ Added for push notifications
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

// Keep splash screen visible while checking session
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(false);

  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    checkAuthSession();
  }, []);

  const checkAuthSession = async () => {
    try {
      console.log('🔍 Checking authentication session...');

      // Check if user has valid session
      const hasValidSession = await authService.checkSession();

      if (hasValidSession) {
        console.log('✅ Valid session found');
        setIsAuthenticated(true);

        // Check profile completion
        try {
          const profile = await profileService.getMyProfile();
          const isComplete = profile.profile_completion_percentage >= 70;
          setIsProfileComplete(isComplete);
          console.log(`📊 Profile completion: ${profile.profile_completion_percentage}%`);
        } catch (error) {
          console.log('⚠️ Could not load profile');
          setIsProfileComplete(false);
        }
      } else {
        console.log('❌ No valid session found');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Session check error:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
      // Hide splash screen after checking
      await SplashScreen.hideAsync();
    }
  };

  // ✅ ADD after session check (initialize notifications when user is authenticated)
  useEffect(() => {
    if (isAuthenticated) {
      initializeNotifications();
    }
  }, [isAuthenticated]);

  const initializeNotifications = async () => {
    try {
      await notificationService.initialize();

      const cleanup = notificationService.setupListeners(
        (notification) => {
          console.log('📬 Notification received:', notification);
        },
        (response) => {
          const data = response.notification.request.content.data as any;
          if (data.type === 'like' || data.type === 'match') {
            router.push('/(tabs)/matches' as any);
          }
        }
      );

      return cleanup;
    } catch (error) {
      console.error('Notification init failed:', error);
    }
  };

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';

    console.log('🧭 Current segment:', segments[0]);
    console.log('🔐 Auth status:', { isAuthenticated, isProfileComplete });

    if (!isAuthenticated && !inAuthGroup) {
      // Not authenticated, redirect to login
      console.log('➡️ Redirecting to login');
      router.replace('/(auth)/login' as any);
    } else if (isAuthenticated && !isProfileComplete && !inAuthGroup) {
      // Authenticated but profile incomplete
      console.log('➡️ Redirecting to complete profile');
      router.replace('/(auth)/complete-profile' as any);
    } else if (isAuthenticated && isProfileComplete && !inTabsGroup) {
      // Authenticated and profile complete
      console.log('➡️ Redirecting to main app');
      router.replace('/(tabs)' as any);
    }
  }, [isLoading, isAuthenticated, isProfileComplete, segments]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: Colors.dark.background,
        }}
      >
        <ActivityIndicator size="large" color={Colors.dark.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
