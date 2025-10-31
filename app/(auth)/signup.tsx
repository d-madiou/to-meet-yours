import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
    Alert,
    ImageBackground,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

// Let's import the the authservice
import { authService } from "@/src/services/api/auth.service";

interface SignupScreenProps {}

const BACKGROUND_IMAGE = require("../../assets/register1.png");

export default function SignupScreen({}: SignupScreenProps) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    };

    // Email validation
    if (!email) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
      valid = false;
    }

    // Username validation
    if (!username) {
      newErrors.username = "Username is required";
      valid = false;
    } else if (username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
      valid = false;
    }

    // Password validation
    if (!password) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      valid = false;
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      valid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSignup = async () => {
  if (!validateForm()) return;

  setLoading(true);

  try {
    const response = await authService.register({
      email,
      username,
      password,
      password_confirm: confirmPassword,
    });

    Alert.alert("Success", response.message || "Account created successfully!", [
      {
        text: "OK",
        onPress: () => router.replace("/(auth)/login"),
      },
    ]);
  } catch (error: any) {
    Alert.alert("Registration Failed", error.message || "Something went wrong.");
  } finally {
    setLoading(false);
  }
};


  const handleBackPress = () => {
    router.replace("/");
  };

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
              {/* Back Button - Goes to first page */}
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBackPress}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>

              {/* Logo */}
              {/* <View style={styles.logoContainer}>
                <Image
                  source={require("../../assets/Splash2.png")}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View> */}

              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>Welcome to GTM</Text>
                <Text style={styles.subtitle}>
                  Sign up to create a new account
                </Text>
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
                  placeholder="Username"
                  value={username}
                  onChangeText={(text) => {
                    setUsername(text);
                    if (errors.username) setErrors({ ...errors, username: "" });
                  }}
                  autoCapitalize="none"
                  iconName="person-outline"
                  error={errors.username}
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

                <Input
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (errors.confirmPassword)
                      setErrors({ ...errors, confirmPassword: "" });
                  }}
                  isPassword
                  iconName="lock-closed-outline"
                  error={errors.confirmPassword}
                />

                <Button
                  title="Sign Up"
                  onPress={handleSignup}
                  loading={loading}
                  variant="primary"
                  style={styles.signupButton}
                />
              </View>

              {/* Terms and Conditions */}
              <View style={styles.termsContainer}>
                <Text style={styles.termsText}>
                  By signing up, you agree to our{" "}
                  <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              </View>

              {/* Sign In Link */}
              <View style={styles.signinContainer}>
                <Text style={styles.signinText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
                  <Text style={styles.signinLink}>Sign In</Text>
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
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
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
  logo: {
    width: 100,
    height: 100,
  },
  header: {
    marginBottom: 30,
    marginTop: 150,
  },
  title: {
    fontSize: 36,
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
    marginBottom: 25,
  },
  signupButton: {
    marginTop: 10,
  },
  termsContainer: {
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  termsText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
  termsLink: {
    color: "#FF1654",
    textDecorationLine: "underline",
  },
  signinContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signinText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
  },
  signinLink: {
    color: "#FF1654",
    fontSize: 14,
    fontWeight: "600",
  },
});