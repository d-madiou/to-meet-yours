import { ThemedText } from '@/components/themed-text';
import { SimpleLineIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Menu, MessageCircle, Search, UserPlus } from 'lucide-react-native'; // ← Changed from lucide-react
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Hardcoded data for the profile
const profile = {
  name: 'Elliot Denis',
  age: 24,
  bio: 'Award-winning designer raised in Austria, living in New York.',
  image: 'https://i.pinimg.com/736x/ee/bb/05/eebb055f6982704555b5930e350796a5.jpg',
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <Image
        source={{ uri: profile.image }}
        style={styles.backgroundImage}
        contentFit="cover"
        placeholder={{ uri: 'https://placehold.co/600x800/222/FFF?text=Loading...' }}
      />

      {/* Gradient Overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)', 'rgba(0,0,0,0.95)']}
        style={styles.gradient}
      />

      {/* Top Navigation */}
      <View style={[styles.topNav, { paddingTop: insets.top + 10 }]}>
        <Pressable>
          <Menu color="white" size={28} />
        </Pressable>
        <Pressable>
          <Search color="white" size={28} />
        </Pressable>
      </View>

      {/* Side Action Buttons */}
      <View style={styles.sideButtonsContainer}>
        <Pressable style={styles.sideButton}>
          <UserPlus color="white" size={24} />
        </Pressable>
        <Pressable style={styles.sideButton}>
          <MessageCircle color="white" size={24} />
        </Pressable>
      </View>

      {/* Bottom Content Area */}
      <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + 10 }]}>
        {/* Profile Info */}
        <View style={styles.profileInfoContainer}>
          <ThemedText style={styles.nameText}>
            {profile.name}, {profile.age}
          </ThemedText>
          <ThemedText style={styles.bioText}>{profile.bio}</ThemedText>
        </View>

        {/* Social Icons */}
        <View style={styles.socialIconsContainer}>
          <Pressable>
            <SimpleLineIcons name="social-facebook" size={24} color="white" />
          </Pressable>
          <Pressable>
            <SimpleLineIcons name="social-instagram" size={24} color="white" />
          </Pressable>
          <Pressable>
            <SimpleLineIcons name="paper-plane" size={24} color="white" />
          </Pressable>
        </View>

        {/* Find Match Button */}
        <Pressable style={styles.findMatchButton}>
          <ThemedText style={styles.findMatchButtonText}>Find match</ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  sideButtonsContainer: {
    position: 'absolute',
    right: 20,
    bottom: 200,
    gap: 16,
    zIndex: 10,
  },
  sideButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
  },
  profileInfoContainer: {
    marginBottom: 10,
  },
  nameText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 24,
  },
  bioText: {
    color: 'white',
    fontSize: 16,
    marginTop: 8,
    lineHeight: 22,
  },
  socialIconsContainer: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 24,
  },
  findMatchButton: {
    backgroundColor: '#FF005C',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
  },
  findMatchButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});