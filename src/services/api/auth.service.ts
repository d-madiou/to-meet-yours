import { ENDPOINTS } from "@/src/api.config";
import {
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
    User
} from "@/src/types/auth.types";
import { apiService } from "./api.service";

class AuthService {
  // 🔹 LOGIN
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiService.post<LoginResponse>(
        ENDPOINTS.AUTH.LOGIN,
        credentials
      );
      await apiService.setToken(response.token);
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
      await apiService.post(ENDPOINTS.AUTH.LOGOUT);
    } catch (error: any) {
      throw this.handleError(error);
    }
    await apiService.clearToken();
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
