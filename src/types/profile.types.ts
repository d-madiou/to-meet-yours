export interface Profile {
  user: string; // UUID
  bio: string;
  birth_date: string | null;
  age: number | null;
  gender: 'M' | 'F' | 'O' | '';
  city: string;
  country: string;
  relationship_goal: 'casual' | 'serious' | 'friendship' | 'marriage' | '';
  looking_for_gender: 'M' | 'F' | 'O' | '';
  min_age_preference: number;
  max_age_preference: number;
  max_distance_km: number;
  profile_completion_percentage: number;
  total_matches: number;
  total_messages_sent: number;
  profile_views: number;
  photos: ProfilePhoto[];
  interests: ProfileInterest[];
  created_at: string;
  updated_at: string;
  is_verified: boolean;
}

export interface ProfilePhoto {
  url: string | undefined;
  id?: number;
  profile?: string;
  image: string;
  is_primary: boolean;
  uploaded_at?: string;
  
}

export interface Interest {
  id: number;
  name: string;
}

export interface ProfileInterest {
  interest: Interest;
  passion_level: number;
}

export interface ProfileUpdateRequest {
  bio?: string;
  birth_date?: string; // YYYY-MM-DD format
  gender?: 'M' | 'F' | 'O';
  city?: string;
  country?: string;
  relationship_goal?: 'casual' | 'serious' | 'friendship' | 'marriage';
  looking_for_gender?: 'M' | 'F' | 'O';
  min_age_preference?: number;
  max_age_preference?: number;
  max_distance_km?: number;
}