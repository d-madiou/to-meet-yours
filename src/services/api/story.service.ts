import { StoriesResponse, Story, StoryViewer } from '@/src/types/story.types';
import * as ImagePicker from 'expo-image-picker';
import { apiService } from './api.service';

class StoryService {
  /**
   * Get all active stories
   */
  async getStories(): Promise<StoriesResponse> {
    try {
      const response = await apiService.get<StoriesResponse>('/stories/');
      return response;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get current user's stories
   */
  async getMyStories(): Promise<{ count: number; results: Story[] }> {
    try {
      const response = await apiService.get('/stories/my_stories/');
      return response;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Create image story
   */
  async createImageStory(imageUri: string, caption?: string): Promise<Story> {
    try {
      const formData = new FormData();
      
      const uriParts = imageUri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      
      formData.append('story_type', 'image');
      formData.append('image', {
        uri: imageUri,
        name: `story.${fileType}`,
        type: `image/${fileType}`,
      } as any);
      
      if (caption) {
        formData.append('caption', caption);
      }
      
      formData.append('duration', '5');

      const response = await apiService.uploadFile<Story>('/stories/', formData);
      return response;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Create text story
   */
  async createTextStory(
    text: string,
    backgroundColor: string = '#FF006E',
    caption?: string
  ): Promise<Story> {
    try {
      const response = await apiService.post<Story>('/stories/', {
        story_type: 'text',
        text_content: text,
        background_color: backgroundColor,
        caption: caption || '',
        duration: 5,
      });
      return response;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Mark story as viewed
   */
  async markStoryViewed(storyId: number): Promise<void> {
    try {
      await apiService.post(`/stories/${storyId}/mark_viewed/`);
    } catch (error: any) {
      console.error('Mark viewed error:', error);
    }
  }

  /**
   * Get story viewers
   */
  async getStoryViewers(storyId: number): Promise<{ count: number; results: StoryViewer[] }> {
    try {
      const response = await apiService.get(`/stories/${storyId}/viewers/`);
      return response;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete story
   */
  async deleteStory(storyId: number): Promise<void> {
    try {
      await apiService.delete(`/stories/${storyId}/`);
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Pick image for story
   */
  async pickImageForStory(): Promise<string | null> {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        throw new Error('Camera roll permission required');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [9, 16],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        return result.assets[0].uri;
      }

      return null;
    } catch (error) {
      console.error('Image picker error:', error);
      return null;
    }
  }

  /**
   * Take photo for story
   */
  async takePhotoForStory(): Promise<string | null> {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        throw new Error('Camera permission required');
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [9, 16],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        return result.assets[0].uri;
      }

      return null;
    } catch (error) {
      console.error('Camera error:', error);
      return null;
    }
  }

  private handleError(error: any): Error {
    if (error.response?.data) {
      return new Error(error.response.data.message || 'Story operation failed');
    }
    return new Error(error.message || 'An unexpected error occurred');
  }
}

export const storyService = new StoryService();