export interface User {
  id: number;
  uuid: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_profile_complete: boolean;
  last_active: string;
  created_at: string;
  profile?: Profile;
}

export interface Profile {
  bio: string;
  birth_date: string | null;
  age: number | null;
  gender: string;
  city: string;
  country: string;
  relationship_goal: string;
  looking_for_gender: string;
  min_age_preference: number;
  max_age_preference: number;
  max_distance_km: number;
  profile_completion_percentage: number;
  is_complete: boolean;
  total_matches: number;
  total_messages_sent: number;
  profile_views: number;
  photos: ProfilePhoto[];
  interests: Interest[];
}

export interface ProfilePhoto {
  id: number;
  url: string;
  is_primary: boolean;
  order: number;
  uploaded_at: string;
}

export interface Interest {
  id: number;
  name: string;
  category: string;
  icon: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: User;
  token: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
}

export interface RegisterResponse {
  message: string;
  user: User;
  token: string;
}

export interface AuthError {
  error: boolean;
  message: string;
  details?: any;
}