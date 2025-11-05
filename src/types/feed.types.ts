export interface FeedUser {
  id: string;
  username: string;
  age: number | null;
  city: string;
  country: string;
  bio: string;
  gender: string;
  relationship_goal: string;
  photo_url: string | null;
  interests: string[];
  is_verified: boolean;
}

export interface FeedResponse {
  count: number;
  results: FeedUser[];
}