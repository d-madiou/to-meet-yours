import { API_CONFIG } from '@/src/api.config';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { AuthStorage } from '../../utils/auth.storage';

class ApiService {
  private axiosInstance: AxiosInstance;
  private token: string | null = null;
  private isRefreshing = false; // Prevent multiple logout attempts

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        const token = await this.getToken();
        if (token) {
          config.headers.Authorization = `Token ${token}`;
        }
        
        console.log(`🚀 [API Request]: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ [Request Error]:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => {
        console.log(`✅ [API Response]: ${response.config.url}`, response.status);
        return response;
      },
      async (error) => {
        // Only log errors that aren't expected (like during logout)
        // Suppress 401 errors during logout
        const isLogoutError = error.config?.url === '/auth/logout' && error.response?.status === 401;

        if ((error.response?.status !== 401 || !this.isRefreshing) && !isLogoutError) {
          console.error("❌ [API Error]:", error.response?.data || error.message);
        }

        // Handle 401 Unauthorized
        if (error.response?.status === 401) {
          // Prevent multiple simultaneous logout attempts
          if (!this.isRefreshing) {
            this.isRefreshing = true;
            console.log('🔐 Token invalid, clearing auth data...');
            
            try {
              await this.clearToken();
              await AuthStorage.clearAll();
            } catch (clearError) {
              console.error('Error clearing auth:', clearError);
            } finally {
              this.isRefreshing = false;
            }
          }
        }

        return Promise.reject(error);
      }
    );
  }

  async getToken(): Promise<string | null> {
    if (!this.token) {
      this.token = await AuthStorage.getToken();
    }
    return this.token;
  }

  async setToken(token: string): Promise<void> {
    this.token = token;
    await AuthStorage.saveToken(token);
  }

  async clearToken(): Promise<void> {
    this.token = null;
    await AuthStorage.removeToken();
  }

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

  async uploadFile<T = any>(url: string, formData: FormData): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}

export const apiService = new ApiService();