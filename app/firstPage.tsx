import Button from "@/components/ui/Button";
import SocialButton from "@/components/ui/SocialButton";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Alert, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";

// TypeScript interface for props (if needed)
interface LoginScreenProps {}

// Placeholder image (replace with local asset or stable URL)
const BACKGROUND_IMAGE = require('../assets/background.png'); // Add your local image in the assets folder

export default function LoginScreen({}: LoginScreenProps) {
  const handleSocialLogin = (platform: string) => {
    Alert.alert("Login", `Logging in with ${platform.charAt(0).toUpperCase() + platform.slice(1)} is coming soon!`);
  };

  const handleLogin = () => {
    router.replace('/(auth)/login');
  };

  const handleSignUp = () => {
    router.replace('/(auth)/signup');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ImageBackground
        source={BACKGROUND_IMAGE} // Use local asset
        style={styles.background}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(22, 22, 22, 0.3)', 'rgba(15, 15, 15, 0.7)', 'rgba(0,0,0,0.95)']}
          style={styles.gradient}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Logo at the top */}
              <View style={{ alignItems: 'center', marginBottom: 40 }}>
                <ImageBackground
                  source={require('../assets/Splash2.png')}
                  style={{ width: 100, height: 100 }}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.header}>
                <Text style={styles.title}>Dating</Text>
                <Text style={styles.title}>better than</Text>
                <Text style={styles.title}>ever before</Text>
                <Text style={styles.subtitle}>Let's have fun and meet people</Text>
              </View>

              <View style={styles.form}>
                <Button
                  title="Login"
                  onPress={handleLogin}
                  style={styles.loginButton}
                  variant="secondary"
                />
                <Button
                  title="Sign Up"
                  onPress={handleSignUp}
                  style={styles.loginButton}
                />
              </View>

              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: 'white' }}>Or login with</Text>
              </View>

              <View style={styles.socialButtons}>
                <SocialButton
                  platform="facebook"
                  onPress={() => handleSocialLogin('facebook')}
                />
                <SocialButton
                  platform="whatsapp"
                  onPress={() => handleSocialLogin('whatsapp')} // Fixed from 'twitter'
                />
                <SocialButton
                  platform="instagram"
                  onPress={() => handleSocialLogin('instagram')}
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
    paddingTop: 80,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 40,
    marginTop: 100,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 12,
    lineHeight: 20,
  },
  form: {
    marginBottom: 30,
  },
  loginButton: {
    marginBottom: 20,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 10, // Note: Use marginRight on individual SocialButton for React Native < 0.71
    marginTop: 20,
    justifyContent: 'center',
  },
});