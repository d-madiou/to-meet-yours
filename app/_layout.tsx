import { AuthProvider, useAuth } from "@/app/(tabs)/AuthContext"; // Import AuthProvider and useAuth
import { Colors } from "@/constants/theme";
import { notificationService } from "@/src/services/notification.service";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  return (
    <AuthProvider>
      <RootLayoutContent />
    </AuthProvider>
  );
}

function RootLayoutContent() {
  const { isAuthenticated, isProfileComplete, isLoadingAuth } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  /**
   * 🔔 Initialize notifications after authentication
   */
  useEffect(() => {
    if (!isAuthenticated || isLoadingAuth) return;

    const initNotifications = async () => {
      try {
        await notificationService.initialize();

        const cleanup = notificationService.setupListeners(
          (notification) => {
            console.log("📬 Notification received:", notification);
          },
          (response) => {
            const data = response.notification.request.content.data as any;
            if (data.type === "like" || data.type === "match") {
              router.push("/(tabs)/matches" as any);
            }
          }
        );

        return cleanup;
      } catch (error) {
        console.error("❌ Notification init failed:", error);
      }
    };

    const cleanupPromise = initNotifications();
    return () => {
      cleanupPromise?.then((cleanup) => cleanup?.());
    };
  }, [isAuthenticated]);

  /**
   * 🧭 Handle navigation logic based on auth/profile state
   */
  useEffect(() => {
    if (isLoadingAuth) return;

    const currentSegment = segments[0];
    const inAuthGroup = currentSegment === "(auth)";
    const inTabsGroup = currentSegment === "(tabs)";

    console.log("🧭 Navigation Check:", {
      segment: currentSegment, // (auth) or (tabs)
      isAuthenticated: isAuthenticated,
      isProfileComplete: isProfileComplete,
    });

    if (!isAuthenticated) {
      if (!inAuthGroup) {
        console.log("➡️ Redirecting to login (unauthenticated)");
        router.replace("/(auth)/login" as any);
      }
      return;
    }

    if (!isProfileComplete) {
      if (currentSegment !== "(auth)") {
        console.log("➡️ Redirecting to complete profile");
        router.replace("/(auth)/makeprofile" as any);
      }
      return;
    }

    if (!inTabsGroup) {
      console.log("➡️ Redirecting to main app");
      router.replace("/(tabs)" as any);
    }
  }, [isLoadingAuth, isAuthenticated, isProfileComplete, segments, router]);

  /**
   * 💫 Loading screen while checking auth session
   */
  if (isLoadingAuth) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: Colors.dark.background,
        }}
      >
        <ActivityIndicator size="large" color={Colors.dark.primary} />
      </View>
    );
  }

  /**
   * 🧩 App navigation stack
   */
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
