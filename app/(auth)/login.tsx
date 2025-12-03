import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { profileService } from "@/src/services/api/profile.service";
import { LoginRequest } from "@/src/types/auth.types";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  Alert,
  Image,
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
import { AuthStorage } from "@/src/utils/auth.storage";
import { useNavigation } from 'expo-router';

const BACKGROUND_IMAGE = require("../../assets/login.png");

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const navigation = useNavigation();

  // ===============================
  // Validate form inputs
  // ===============================
  const validateForm = () => {
    let valid = true;
    const newErrors = { email: "", password: "" };

    if (!email) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
      valid = false;
    }

    if (!password) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  // ===============================
  // Handle Login
  // ===============================
  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {

      const credentials: LoginRequest = {
        email: email.trim(),
        password: password,
      };

      console.log("🔐 Attempting login...");

      // Step 1: Login
      const response = await authService.login(credentials);
      console.log("✅ Login successful");


      // Step 2: Ensure token is stored
      const savedToken = await AuthStorage.getToken();
      console.log("🔒 Token confirmed in storage:", savedToken ? "✅" : "❌");

      // Step 3: Fetch user profile
      console.log("📊 Checking profile completion...");
      const profile = await profileService.getMyProfile();
      console.log(`Profile completion: ${profile.profile_completion_percentage}%`);

      // Step 4: Save user data
      await AuthStorage.saveUserData(profile);
      console.log("✅ User data saved");

      // Step 5: Verify token again before navigating
      const tokenCheck = await AuthStorage.getToken();
      if (!tokenCheck) {
        console.warn("⚠️ Token not yet ready, waiting 300ms...");
        await new Promise((res) => setTimeout(res, 300));
      }

      // Step 6: Navigate
      const finalToken = await AuthStorage.getToken();
      console.log("🔎 Final token before navigation:", !!finalToken);

       if (finalToken) {
        if (profile.profile_completion_percentage < 70) {
          console.log("➡️ Redirecting to complete profile");
          router.replace("/(auth)/makeprofile" as any);
        } else {
          console.log("➡️ Redirecting to main app");
          router.replace("/(tabs)" as any);
         }
      } else {
        Alert.alert("Error", "Authentication failed, please try again.");
      }
    } catch (error: any) {
      console.error("❌ Login failed:", error);
      Alert.alert("Login Failed", error.message || "Invalid credentials");
    } finally {

      setLoading(false);
    }
  };

  // ===============================
  // Forgot Password
  // ===============================
  const handleForgotPassword = () => {
    router.push("/(auth)/login");
  };

  // ===============================
  // UI
  // ===============================
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ImageBackground source={BACKGROUND_IMAGE} style={styles.background} resizeMode="cover">
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

              {/* Logo */}
              <View style={styles.logoContainer}>
                <Image
                  source={require("../../assets/Splash2.png")}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>

              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>Welcome back</Text>
                <Text style={styles.subtitle}>Login to your account to continue</Text>
              </View>

              {/* Form */}
              <View style={styles.form}>
                <Input
                  placeholder="Email"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) setErrors({ ...errors, email: "" });
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  iconName="mail-outline"
                  error={errors.email}
                />

                <Input
                  placeholder="Password"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) setErrors({ ...errors, password: "" });
                  }}
                  isPassword
                  iconName="lock-closed-outline"
                  error={errors.password}
                />

                <Button
                  title="Login"
                  onPress={handleLogin}
                  loading={loading}
                  variant="primary"
                  style={styles.loginButton}
                />
              </View>

              {/* Forgot Password */}
              <TouchableOpacity
                onPress={handleForgotPassword}
                style={styles.forgotPasswordContainer}
              >
                <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
              </TouchableOpacity>

              {/* Sign Up */}
              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
                  <Text style={styles.signupLink}>Sign Up</Text>
                </TouchableOpacity>
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
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  logo: { width: 100, height: 100 },
  header: { marginBottom: 40 },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  subtitle: { fontSize: 16, color: "rgba(255, 255, 255, 0.7)", lineHeight: 22 },
  form: { marginBottom: 20 },
  loginButton: { marginTop: 10 },
  forgotPasswordContainer: { alignItems: "center", marginBottom: 30 },
  forgotPasswordText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signupText: { color: "rgba(255, 255, 255, 0.7)", fontSize: 14 },
  signupLink: { color: "#FF1654", fontSize: 14, fontWeight: "600" },
});
