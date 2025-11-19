import { ENDPOINTS } from "@/src/api.config";
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  User
} from "@/src/types/auth.types";
import { AuthStorage } from "@/src/utils/auth.storage";
import { apiService } from "./api.service";

class AuthService {
  getUser(otherUserUuid: string): import("../../types/messaging.types").BaseUser | PromiseLike<import("../../types/messaging.types").BaseUser> {
    throw new Error('Method not implemented.');
  }
  // 🔹 LOGIN
  async login(credentials: LoginRequest): Promise<LoginResponse> {
  try {
    const response = await apiService.post<LoginResponse>(
      ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    
    // Store token
    await apiService.setToken(response.token);
    
    // Save user data for offline access
    await AuthStorage.saveUserData(response.user);
    
    return response;
  } catch (error: any) {
    throw this.handleError(error);
  }
}

  // 🔹 REGISTER
  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await apiService.post<RegisterResponse>(
        ENDPOINTS.AUTH.REGISTER,
        userData
      );
      await apiService.setToken(response.token);
      return response;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // 🔹 LOGOUT
  async logout(): Promise<void> {
  try {
    // Try to call logout endpoint, but don't fail if it errors
    await apiService.post(ENDPOINTS.AUTH.LOGOUT).catch(() => {
      // Ignore errors during logout API call
      console.log('Logout API call failed, but continuing with local cleanup');
    });
  } finally {
    // Always clear local data regardless of API call result
    await AuthStorage.clearAll();
    await apiService.clearToken();
    console.log('✅ Logout complete - all auth data cleared');
  }
}

// ADD new method to check if session is valid:
async checkSession(): Promise<boolean> {
  try {
    const isLoggedIn = await AuthStorage.isLoggedIn();
    if (!isLoggedIn) return false;
    
    await this.getCurrentUser();
    return true;
  } catch (error) {
    await AuthStorage.clearAll();
    return false;
  }
}

  // 🔹 CURRENT USER
  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiService.get<LoginResponse>(ENDPOINTS.AUTH.ME);
      return response.user;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // 🔹 CHECK AUTHENTICATION STATUS
  async isAuthenticated(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch {
      return false;
    }
  }
  // Let's get my profile

  // 🔹 ERROR HANDLER
  private handleError(error: any): Error {
    if (error.response) {
      const errorData = error.response.data;

      if (errorData.error) {
        return new Error(errorData.message || "Authentication failed");
      }
      if (errorData.detail) {
        return new Error(errorData.detail);
      }
      if (errorData.username) {
        return new Error(`Username: ${errorData.username[0]}`);
      }
      if (errorData.email) {
        return new Error(`Email: ${errorData.email[0]}`);
      }
      if (errorData.password) {
        return new Error(`Password: ${errorData.password[0]}`);
      }
      if (errorData.password_confirm) {
        return new Error(`Password confirmation: ${errorData.password_confirm[0]}`);
      }
      return new Error("An unknown error occurred");
    } else if (error.request) {
      return new Error("No response from server. Please check your network connection.");
    } else {
      return new Error("An unknown error occurred");
    }
  }
}

export const authService = new AuthService();
