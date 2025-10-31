import Button from "@/components/ui/Button";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
    ImageBackground,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { authService } from "@/src/services/api/auth.service";

const BACKGROUND_IMAGE = require("../assets/register.png");

export default function LoginSuccessScreen() {
   const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const handlePress = () => {
    router.replace("/makeprofile");
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await authService.getCurrentUser();
        setUsername(user.username);
      } catch (error) {
        console.log(" Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);


  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ImageBackground
        source={BACKGROUND_IMAGE}
        style={styles.background}
        resizeMode="cover"
      >
        <LinearGradient
          colors={[
            "rgba(22, 22, 22, 0.3)",
            "rgba(15, 15, 15, 0.7)",
            "rgba(0, 0, 0, 0.95)",
          ]}
          style={styles.gradient}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardView}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Back Button */}
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.replace("/firstPage")}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>

              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>
                    Welcome back
                    {username ? (
                    <Text style={styles.primaryText}>, {username}</Text>
                    ) : null}
                    !
                </Text>
                <Text style={styles.subtitle}>
                    Thank you for logging in. Let's complete your profile to get started.
                </Text>
                </View>


              {/* Button */}
              <View style={styles.form}>
                <Button
                  title="Continue to Profile Setup"
                  onPress={handlePress}
                  style={styles.loginButton}
                />
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1 },
  gradient: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 30,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
    marginTop: 150,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    lineHeight: 22,
  },
  form: {
    marginTop: 350,
  },
  loginButton: {
    marginTop: 10,
  },
  primaryText: {
    color: '#FF1654',
    fontWeight: '800',
    textTransform: 'uppercase',
  },
});
