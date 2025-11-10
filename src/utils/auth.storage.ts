import AsyncStorage from "@react-native-async-storage/async-storage";

const AUTH_TOKEN_KEY = 'authToken';
const USER_DATA_KEY = 'userData';


export const AuthStorage = {
    // Save auth token
    async saveToken(token: string): Promise<void>{
        try{
            await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
        } catch (error){
            console.error('Error saving auth token:', error)
        }
    },

    // Get auth token
    async getToken(): Promise<string | null>{
        try{
            return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
        } catch (error){
            console.error('Error getting auth token:', error)
            return null;
        }
    },

    //  Remove auth token
    async removeToken(): Promise<void>{
        try{
            await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
        } catch (error){
            console.error('Error removing auth token:', error)
        }
    },

    // save user data for offline access
    async saveUserData(userData: any): Promise<void>{
        try{
            await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
        } catch (error){
            console.error('Error saving user data:', error)
        }
    },

    // get saved user data
    async getUserData(): Promise<any | null>{
        try{
            const data = await AsyncStorage.getItem(USER_DATA_KEY);
            return data ? JSON.parse(data) : null;
        } catch (error){
            console.error('Error getting user data:', error)
            return null;
        }
    },

    // clear all auth data
    async clearAll(): Promise<void>{
        try{
            await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_DATA_KEY]);
        } catch (error){
            console.error('Error clearing auth data:', error)
        }
    },

    // check if the user is logged in
    async isLoggedIn(): Promise<boolean>{
        const token = await this.getToken();
        return !!token;
    }
}