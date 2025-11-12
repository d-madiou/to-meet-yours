import AsyncStorage from "@react-native-async-storage/async-storage";

const AUTH_TOKEN_KEY = "authToken";
const USER_DATA_KEY = "userData";
const TOKEN_EXPIRY_KEY = "tokenExpiry"; // optional: if you want to track token validity

export const AuthStorage = {
  /**
   * Save auth token (and optional expiry time)
   */
  async saveToken(token: string, expiryInHours?: number): Promise<void> {
    try {
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);

      if (expiryInHours) {
        const expiryTimestamp = Date.now() + expiryInHours * 60 * 60 * 1000;
        await AsyncStorage.setItem(TOKEN_EXPIRY_KEY, expiryTimestamp.toString());
      }

      console.log("✅ Auth token saved");
    } catch (error) {
      console.error("❌ Error saving auth token:", error);
    }
  },

  /**
   * Get auth token (check if expired if expiry tracking is used)
   */
  async getToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      if (!token) return null;

      const expiry = await AsyncStorage.getItem(TOKEN_EXPIRY_KEY);
      if (expiry && Date.now() > parseInt(expiry, 10)) {
        console.log("⚠️ Token expired — clearing...");
        await this.clearAll();
        return null;
      }

      return token;
    } catch (error) {
      console.error("❌ Error getting auth token:", error);
      return null;
    }
  },

  /**
   * Remove auth token (and expiry)
   */
  async removeToken(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, TOKEN_EXPIRY_KEY]);
      console.log("🧹 Auth token removed");
    } catch (error) {
      console.error("❌ Error removing auth token:", error);
    }
  },

  /**
   * Save user data for offline access
   */
  async saveUserData(userData: Record<string, any>): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
      console.log("✅ User data saved");
    } catch (error) {
      console.error("❌ Error saving user data:", error);
    }
  },

  /**
   * Get stored user data
   */
  async getUserData<T = any>(): Promise<T | null> {
    try {
      const data = await AsyncStorage.getItem(USER_DATA_KEY);
      return data ? (JSON.parse(data) as T) : null;
    } catch (error) {
      console.error("❌ Error getting user data:", error);
      return null;
    }
  },

  /**
   * Remove all stored authentication-related data
   */
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_DATA_KEY, TOKEN_EXPIRY_KEY]);
      console.log("🧽 Cleared all auth data");
    } catch (error) {
      console.error("❌ Error clearing auth data:", error);
    }
  },

  /**
   * Check if a user session exists
   */
  async isLoggedIn(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  },
};
