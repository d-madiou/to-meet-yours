import { ENDPOINTS } from '@/src/api.config';
import { Interest, Profile, ProfileUpdateRequest } from '@/src/types/profile.types';
import * as ImagePicker from 'expo-image-picker';
import { apiService } from './api.service';

class ProfileService {
  /**
   * Get current user's profile
   */
  async getMyProfile(): Promise<Profile> {
    try {
      const response = await apiService.get<Profile>(ENDPOINTS.PROFILE.ME);
      return response;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Update profile information
   */
  async updateProfile(data: ProfileUpdateRequest): Promise<Profile> {
  try {
    // Convert Date to string if needed
    if (data.birth_date && typeof data.birth_date !== 'string') {
      const date = new Date(data.birth_date);
      data.birth_date = date.toISOString().split('T')[0]; // YYYY-MM-DD
    }

    const response = await apiService.patch<{ profile: Profile }>(
      '/profile/update/',  // Note the trailing slash!
      data
    );
    
    return response.profile;
  } catch (error: any) {
    throw this.handleError(error);
  }
}

  /**
   * Upload profile photo
   */
  async uploadPhoto(imageUri: string, isPrimary: boolean = false): Promise<any> {
    try {
      // Create form data
      const formData = new FormData();
      
      // Get file extension
      const uriParts = imageUri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      
      formData.append('image', {
        uri: imageUri,
        name: `photo.${fileType}`,
        type: `image/${fileType}`,
      } as any);
      
      formData.append('is_primary', isPrimary.toString());

      const response = await apiService.uploadFile(
        ENDPOINTS.PROFILE.UPLOAD_PHOTO,
        formData
      );
      
      return response;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete profile photo
   */
  async deletePhoto(photoId: number): Promise<void> {
    try {
      await apiService.delete(`${ENDPOINTS.PROFILE.DELETE_PHOTO}?photo_id=${photoId}`);
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get all available interests
   */
  async getInterests(): Promise<Interest[]> {
    try {
      const response = await apiService.get<Interest[]>('/interests/');
      return response;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get current user's selected interests
   */
  async getUserInterests(): Promise<Interest[]> {
    try {
      const response = await apiService.get<Interest[]>(ENDPOINTS.PROFILE.ME_INTERESTS);
      return response;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Get user public profile
  async getUserProfile(userId: string): Promise<any> {
  try {
    const response = await apiService.get(`/users/${userId}/profile/`);
    return response;
  } catch (error: any) {
    throw this.handleError(error);
  }
}

  /**
   * Add interest to profile
   */
  async addInterest(interestId: number, passionLevel: number = 3): Promise<any> {
    try {
      const response = await apiService.post(ENDPOINTS.PROFILE.ADD_INTEREST, {
        interest_id: interestId,
        passion_level: passionLevel,
      });
      return response;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Remove interest from profile
   */
  async removeInterest(interestId: number): Promise<void> {
    try {
      await apiService.delete(`${ENDPOINTS.PROFILE.REMOVE_INTEREST}?interest_id=${interestId}`);
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Request camera/gallery permissions
   */
  async requestImagePermissions(): Promise<boolean> {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    return cameraStatus === 'granted' && libraryStatus === 'granted';
  }

  /**
   * Pick image from gallery
   */
  async pickImage(): Promise<string | null> {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
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
   * Take photo with camera
   */
  async takePhoto(): Promise<string | null> {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [3, 4],
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
      const errorData = error.response.data;
      
      if (errorData.error) {
        return new Error(errorData.message || 'Profile operation failed');
      }
      
      // Handle field-specific errors
      const fieldErrors = Object.entries(errorData)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
      
      return new Error(fieldErrors || 'Profile operation failed');
    }
    
    return new Error(error.message || 'An unexpected error occurred');
  }
}

export const profileService = new ProfileService();