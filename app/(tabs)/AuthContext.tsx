import { authService } from '@/src/services/api/auth.service';
import { profileService } from '@/src/services/api/profile.service';
import { Profile } from '@/src/types/profile.types';
import * as SplashScreen from 'expo-splash-screen';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  isProfileComplete: boolean;
  userProfile: Profile | null;
  isLoadingAuth: boolean;
  checkAuthSession: () => Promise<void>;
  logout: () => Promise<void>;
  setUserProfile: (profile: Profile | null) => void; // Added for updating profile from other screens
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const checkAuthSession = useCallback(async () => {
    console.log("🔍 [AuthContext] Checking authentication session...");
    setIsLoadingAuth(true);
    try {
      const hasValidSession = await authService.checkSession();

      if (!hasValidSession) {
        console.log("❌ [AuthContext] No valid session found");
        setIsAuthenticated(false);
        setIsProfileComplete(false);
        setUserProfile(null);
        return;
      }

      console.log("✅ [AuthContext] Valid session found");
      setIsAuthenticated(true);

      try {
        const profile = await profileService.getMyProfile();
        const isComplete = profile.profile_completion_percentage >= 70;
        setIsProfileComplete(isComplete);
        setUserProfile(profile);

        console.log(
          `📊 [AuthContext] Profile completion: ${profile.profile_completion_percentage}%`
        );
      } catch (error) {
        console.warn("⚠️ [AuthContext] Failed to load profile:", error);
        setIsProfileComplete(false);
        setUserProfile(null);
      }
    } catch (error) {
      console.error("💥 [AuthContext] Session check error:", error);
      setIsAuthenticated(false);
      setIsProfileComplete(false);
      setUserProfile(null);
    } finally {
      setIsLoadingAuth(false);
      await SplashScreen.hideAsync();
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("❌ [AuthContext] Logout failed:", error);
    } finally {
      setIsAuthenticated(false);
      setIsProfileComplete(false);
      setUserProfile(null);
    }
  }, []);

  useEffect(() => {
    checkAuthSession();
  }, [checkAuthSession]);

  const value = {
    isAuthenticated,
    isProfileComplete,
    userProfile,
    isLoadingAuth,
    checkAuthSession,
    logout,
    setUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};