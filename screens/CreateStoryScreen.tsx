import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { storyService } from '../src/services/api//story.service';

const BACKGROUND_COLORS = [
  '#FF006E',
  '#8338EC',
  '#3A86FF',
  '#FB5607',
  '#FFBE0B',
  '#06FFA5',
];

export default function CreateStoryScreen() {
  const router = useRouter();
  
  const [storyType, setStoryType] = useState<'image' | 'text'>('image');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [textContent, setTextContent] = useState('');
  const [backgroundColor, setBackgroundColor] = useState(BACKGROUND_COLORS[0]);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePickImage = async () => {
    const uri = await storyService.pickImageForStory();
    if (uri) {
      setSelectedImage(uri);
      setStoryType('image');
    }
  };

  const handleTakePhoto = async () => {
    const uri = await storyService.takePhotoForStory();
    if (uri) {
      setSelectedImage(uri);
      setStoryType('image');
    }
  };

  const handleCreateStory = async () => {
    if (storyType === 'image' && !selectedImage) {
      Alert.alert('Error', 'Please select an image');
      return;
    }

    if (storyType === 'text' && !textContent.trim()) {
      Alert.alert('Error', 'Please enter some text');
      return;
    }

    setLoading(true);

    try {
      if (storyType === 'image') {
        await storyService.createImageStory(selectedImage!, caption);
      } else {
        await storyService.createTextStory(textContent, backgroundColor, caption);
      }

      Alert.alert('Success', 'Story created successfully!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color={Colors.dark.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Story</Text>
        <TouchableOpacity onPress={handleCreateStory} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={Colors.dark.primary} />
          ) : (
            <Ionicons name="checkmark" size={28} color={Colors.dark.primary} />
          )}
        </TouchableOpacity>
      </View>

      {/* Type Selector */}
      <View style={styles.typeSelectorContainer}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            storyType === 'image' && styles.typeButtonActive,
          ]}
          onPress={() => setStoryType('image')}
        >
          <Ionicons
            name="image"
            size={24}
            color={storyType === 'image' ? '#fff' : Colors.dark.text}
          />
          <Text
            style={[
              styles.typeButtonText,
              storyType === 'image' && styles.typeButtonTextActive,
            ]}
          >
            Image
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.typeButton,
            storyType === 'text' && styles.typeButtonActive,
          ]}
          onPress={() => setStoryType('text')}
        >
          <Ionicons
            name="text"
            size={24}
            color={storyType === 'text' ? '#fff' : Colors.dark.text}
          />
          <Text
            style={[
              styles.typeButtonText,
              storyType === 'text' && styles.typeButtonTextActive,
            ]}
          >
            Text
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content Area */}
      {storyType === 'image' ? (
        <View style={styles.imageContainer}>
          {selectedImage ? (
            <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={64} color={Colors.dark.placeholder} />
              <Text style={styles.placeholderText}>No image selected</Text>
            </View>
          )}

          <View style={styles.imageActions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleTakePhoto}>
              <Ionicons name="camera" size={24} color={Colors.dark.primary} />
              <Text style={styles.actionButtonText}>Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handlePickImage}>
              <Ionicons name="images" size={24} color={Colors.dark.primary} />
              <Text style={styles.actionButtonText}>Gallery</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={[styles.textContainer, { backgroundColor }]}>
          <TextInput
            style={styles.textInput}
            placeholder="Type your story..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={textContent}
            onChangeText={setTextContent}
            multiline
            maxLength={500}
          />

          {/* Color Picker */}
          <View style={styles.colorPicker}>
            {BACKGROUND_COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorCircle,
                  { backgroundColor: color },
                  backgroundColor === color && styles.colorCircleSelected,
                ]}
                onPress={() => setBackgroundColor(color)}
              />
            ))}
          </View>
        </View>
      )}

      {/* Caption Input */}
      <View style={styles.captionContainer}>
        <TextInput
          style={styles.captionInput}
          placeholder="Add a caption (optional)"
          placeholderTextColor={Colors.dark.placeholder}
          value={caption}
          onChangeText={setCaption}
          maxLength={200}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  typeSelectorContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.dark.inputBackground,
    gap: 8,
  },
  typeButtonActive: {
    backgroundColor: Colors.dark.primary,
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  imageContainer: {
    flex: 1,
    padding: 16,
  },
  selectedImage: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: Colors.dark.inputBackground,
  },
  imagePlaceholder: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: Colors.dark.inputBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.dark.inputBorder,
  },
  placeholderText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.dark.placeholder,
  },
  imageActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.dark.inputBackground,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.primary,
  },
  textContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 12,
    padding: 24,
    justifyContent: 'center',
  },
  textInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    minHeight: 200,
  },
  colorPicker: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 24,
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  colorCircleSelected: {
    borderWidth: 3,
    borderColor: '#fff',
  },
  captionContainer: {
    padding: 16,
  },
  captionInput: {
    backgroundColor: Colors.dark.inputBackground,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: Colors.dark.text,
  },
});