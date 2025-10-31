
import { API_CONFIG } from "@/src/api.config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from "axios";

class ApiService {
  private axiosInstance: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: { "Content-Type": "application/json" },
    });

    this.setupInterceptors();
  }

  /**
   * Setup request & response interceptors
   */
  private setupInterceptors() {
    // Request Interceptor
    this.axiosInstance.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const token = await this.getToken();
        if (token) {
          config.headers.set('Authorization', `Token ${token}`);
        }

        console.log(`🚀 [API Request] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error("❌ Request Error:", error);
        return Promise.reject(error);
      }
    );

    // Response Interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => {
        console.log(`✅ [API Response] ${response.config.url}`, response.status);
        return response;
      },
      async (error) => {
        console.error("❌ [API Error]:", error.response?.data || error.message);

        // Automatically clear token on 401 Unauthorized
        if (error.response?.status === 401) {
          await this.clearToken();
        }

        return Promise.reject(error);
      }
    );
  }

  // 🔹 Retrieve stored token (cache + AsyncStorage)
  private async getToken(): Promise<string | null> {
    if (!this.token) {
      this.token = await AsyncStorage.getItem("authToken");
    }
    return this.token;
  }

  // 🔹 Save token to memory + AsyncStorage
  async setToken(token: string): Promise<void> {
    this.token = token;
    await AsyncStorage.setItem("authToken", token);
  }

  // 🔹 Clear stored token
  async clearToken(): Promise<void> {
    this.token = null;
    await AsyncStorage.removeItem("authToken");
  }

  // 🔹 Generic request methods (typed)
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.get(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.post(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.put(url, data, config);
    return response.data;
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.patch(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.delete(url, config);
    return response.data;
  }

  // 🔹 File upload (multipart/form-data)
  async uploadFile<T = any>(url: string, formData: FormData): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.post(url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  }
}

// Export a single instance (singleton)
export const apiService = new ApiService();
